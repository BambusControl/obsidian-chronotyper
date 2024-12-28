import {App, moment, Plugin, PluginManifest, TFile} from "obsidian";
import {throttle} from "rxjs";
import {ChronotyperError} from "./errors/chronotyperError";

/* Used by Obsidian */
// noinspection JSUnusedGlobalSymbols
export default class Chronotyper extends Plugin {
    private editSession: EditSession = {
        filepath: null,
        viewStartTime: 0,
        lastEditTime: null,
        totalEditTime: 0
    };

    public constructor(app: App, manifest: PluginManifest) {
        super(app, manifest);
    }

    public override async onload(): Promise<void> {
        console.group("Loading Chronotyper plugin");
        console.time("Chronotyper load time");

        this.registerEvent(
            this.app.workspace.on('file-open', (newFile) => {
                const session = this.editSession;

                if (session.filepath != null) {
                    const viewDuration = moment.duration(
                        Date.now() - session.viewStartTime,
                        'milliseconds'
                    );

                    const file = this.app.vault.getFileByPath(session.filepath);

                    if (file == null) {
                        throw new ChronotyperError(`File ${session.filepath} not found`)
                    }

                    const closedSession = {...session} // Because of the callback
                    console.log("Closing file", session.filepath, "with", closedSession);

                    this.app.fileManager.processFrontMatter(file, (frontmatter) => {
                        // Update view time
                        frontmatter['viewTime'] = Math.floor(
                            (frontmatter['viewTime'] ?? 0) + viewDuration.asSeconds()
                        );

                        // Update edit time if there was any editing
                        if (closedSession.totalEditTime > 0) {
                            const addedEditTime = closedSession.totalEditTime / 1000;
                            frontmatter['editTime'] = Math.floor(
                                (frontmatter['editTime'] ?? 0) +
                                addedEditTime // Convert ms to seconds
                            );
                        }
                    });
                }

                if (newFile == null) {
                    /* File closed */
                    session.filepath = null;
                    session.viewStartTime = 0;

                } else {
                    /* New file opened */
                    session.filepath = newFile.path;
                    session.viewStartTime = Date.now();
                }

                /* Reset parameters */
                session.lastEditTime = null;
                session.totalEditTime = 0;

            })
        );

        this.registerEvent(
            this.app.workspace.on('editor-change', () => {
                const session = this.editSession;
                if (session.filepath == null) {
                    return
                }

                const now = Date.now();
                const typingTime = now - (session.lastEditTime ?? now);

                // Only register typing which is of a certain speed
                if (typingTime < 1000) {
                    session.totalEditTime += typingTime;
                }

                session.lastEditTime = now;
            })
        );

        this.registerEvent(
            this.app.vault.on('delete', (deletedFile) => {
                const session = this.editSession;

                if (session.filepath === deletedFile.path) {
                    session.filepath = null;
                    console.log("Deleting file", deletedFile.path);
                }
            })
        );

        this.registerEvent(
            this.app.vault.on('rename', (newFile, oldPath) => {
                const session = this.editSession;

                if (session.filepath === oldPath) {
                    session.filepath = newFile.path;
                    console.log("Renaming file", oldPath, "to", newFile.path);
                }
            })
        );

        console.timeEnd("Chronotyper load time");
        console.groupEnd();
    }
}

interface EditSession {
    filepath: TFile["path"] | null;
    viewStartTime: number;
    lastEditTime: number | null;
    totalEditTime: number;
}
