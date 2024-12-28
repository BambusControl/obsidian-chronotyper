import {App, moment, TFile} from "obsidian";
import {EditSession} from "../editSession";
import {ChronotyperError} from "../errors/chronotyperError";

const FM_UPDATED = 'updated';
const FM_EDIT_TIME = 'edited_seconds';

export function onWorkspaceFileOpen(app: App, session: EditSession): (newFile: (TFile | null)) => Promise<void> {
    return async (newFile: TFile | null) => {
        if (session.filepath != null) {
            const file = app.vault.getFileByPath(session.filepath);

            if (file == null) {
                throw new ChronotyperError(`File ${session.filepath} not found`)
            }

            const closedSession = {...session} // Because of the callback
            console.log("Closing file", session.filepath, "with", closedSession);

            // Update edit time if there was any editing
            if (closedSession.totalEditTime > 0) {
                await app.fileManager.processFrontMatter(file, (frontmatter) => {
                    frontmatter[FM_UPDATED] = moment().toISOString(true);

                    const addedEditTime = closedSession.totalEditTime / 1000;
                    frontmatter[FM_EDIT_TIME] = Math.floor(
                        (frontmatter[FM_EDIT_TIME] ?? 0) +
                        addedEditTime
                    );
                });
            }
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
