import { App, moment, TFile } from "obsidian";
import { EditSession } from "../core/editSession";
import { ChronotyperError } from "../errors/chronotyperError";
import { CriterionStorage } from "../storage/criterionStorage";

export function onWorkspaceFileOpen(
    app: App,
    session: EditSession,
    criterionStore: CriterionStorage
): (newFile: (TFile | null)) => Promise<void> {
    return async (newFile: TFile | null) => {

        if (session.filepath != null) {
            const file = app.vault.getFileByPath(session.filepath);

            if (file == null) {
                throw new ChronotyperError(`File ${session.filepath} not found`)
            }

            const closedSession = { ...session }
            console.log("Closing file", session.filepath, "with", closedSession);

            if (closedSession.totalEditTime > 0) {
                const updatedPropertyName = await criterionStore.getUpdatedPropertyName();
                const editTimePropertyName = await criterionStore.getEditTimePropertyName();
                const updatedEnabled = await criterionStore.getUpdatedPropertyEnabled();
                const editTimeEnabled = await criterionStore.getEditTimePropertyEnabled();
                if (updatedEnabled || editTimeEnabled) {
                    await app.fileManager.processFrontMatter(file, (frontmatter) => {
                        if (updatedEnabled) {
                            frontmatter[updatedPropertyName] = moment().toISOString(true);
                        }
                        if (editTimeEnabled) {
                            const addedEditTime = closedSession.totalEditTime / 1000;
                            frontmatter[editTimePropertyName] = Math.floor(
                                (frontmatter[editTimePropertyName] ?? 0) +
                                addedEditTime
                            );
                        }
                    });
                }
            }
        }

        if (newFile == null) {
            session.filepath = null;
            session.viewStartTime = 0;

        } else {
            const exclusions = await criterionStore.getExclusion();
            if (!isPathExcluded(newFile.path, exclusions)) {
                session.filepath = newFile.path;
                session.viewStartTime = Date.now();
            } else {
                console.log(`File '${newFile.path}' excluded`);
            }
        }

        session.lastEditTime = null;
        session.totalEditTime = 0;
    };

}

function isPathExcluded(filepath: string | null, exclusions: string[]): boolean {
    return exclusions.some((excluded) => (filepath ?? "").startsWith(excluded));
}
