import {App, debounce, moment, Plugin, PluginManifest, TFile} from "obsidian";

/* Used by Obsidian */
// noinspection JSUnusedGlobalSymbols
export default class Chronotyper extends Plugin {
    private editSession: EditSession = {
        file: null,
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

        /* Modification tells us when it has been saved... */
        this.registerEvent(this.app.vault.on('modify', (file) => {
            console.log(`File ${file.path} modified`);
        }))
        /* Error when file deleted */
        this.registerEvent(this.app.vault.on('delete', (file) => {
            console.log(`File ${file.path} del`);
        }))
        this.registerEvent(this.app.vault.on('rename', (file) => {
            console.log(`File ${file.path} tn`);
        }))
        this.registerEvent(this.app.workspace.on('file-open', (file) => {
            console.log(`File ==> ${file?.path}`);
        }))

        // Track file open/close events
        this.registerEvent(
            this.app.workspace.on('file-open', (newFile) => {
                const hadOpenFile = this.editSession.file != null;

                // Handle file closing or switching
                if (hadOpenFile) {
                    const viewDuration = moment.duration(
                        Date.now() - this.editSession.viewStartTime,
                        'milliseconds'
                    );

                    // Update both view and edit times in frontmatter
                    const es = {...this.editSession} // Because of the callback
                    this.app.fileManager.processFrontMatter(es.file!, (frontmatter) => {
                        // Update view time
                        frontmatter['viewTime'] = Math.floor(
                            (frontmatter['viewTime'] ?? 0) + viewDuration.asSeconds()
                        );

                        // Update edit time if there was any editing
                        if (es.totalEditTime > 0) {
                            const addedEditTime = es.totalEditTime / 1000;
                            frontmatter['editTime'] = Math.floor(
                                (frontmatter['editTime'] ?? 0) +
                                addedEditTime // Convert ms to seconds
                            );
                        }
                    });
                }

                if (newFile == null) {
                    /* File closed */
                    this.editSession.file = null;
                    this.editSession.viewStartTime = 0;

                } else {
                    /* New file opened */
                    this.editSession.file = newFile;
                    this.editSession.viewStartTime = Date.now();
                }

                /* Reset parameters */
                this.editSession.lastEditTime = null;
                this.editSession.totalEditTime = 0;

            })
        );

        // Track editing events
        this.registerEvent(
            this.app.workspace.on('editor-change', () => {
                if (this.editSession.file == null) {
                    return
                }

                const now = Date.now();
                const typingTime = now - (this.editSession.lastEditTime ?? now);

                // Only register typing which is of a certain speed
                if (typingTime < 1000) {
                    this.editSession.totalEditTime += typingTime;
                }

                this.editSession.lastEditTime = now;
            })
        );

        console.timeEnd("Chronotyper load time");
        console.groupEnd();
    }
}

interface EditSession {
    file: TFile | null;
    viewStartTime: number;
    lastEditTime: number | null;
    totalEditTime: number;
}
