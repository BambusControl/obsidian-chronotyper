import {App, moment, TFile} from "obsidian";
import {EditSession} from "../editSession";
import {ChronotyperError} from "../errors/chronotyperError";

const FM_UPDATED = 'updated';
const FM_VIEW_TIME = 'viewed_seconds';
const FM_EDIT_TIME = 'edited_seconds';

export function onWorkspaceFileOpen(app: App, session: EditSession): (newFile: (TFile | null)) => void {
    return (newFile: TFile | null) => {
        if (session.filepath != null) {
            const viewDuration = moment.duration(
                Date.now() - session.viewStartTime,
                'milliseconds'
            );

            const file = app.vault.getFileByPath(session.filepath);

            if (file == null) {
                throw new ChronotyperError(`File ${session.filepath} not found`)
            }

            const closedSession = {...session} // Because of the callback
            console.log("Closing file", session.filepath, "with", closedSession);

            app.fileManager.processFrontMatter(file, (frontmatter) => {
                /* Temporarily disabled */
                frontmatter[FM_VIEW_TIME] = Math.floor(
                    (frontmatter[FM_VIEW_TIME] ?? 0) + viewDuration.asSeconds()
                );

                // Update edit time if there was any editing
                if (closedSession.totalEditTime > 0) {
                    const addedEditTime = closedSession.totalEditTime / 1000;
                    frontmatter[FM_EDIT_TIME] = Math.floor(
                        (frontmatter[FM_EDIT_TIME] ?? 0) +
                        addedEditTime
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

    };
}
