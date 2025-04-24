import {EditSession} from "../core/editSession";
import {TAbstractFile} from "obsidian";

export function onVaultRename(session: EditSession): (newFile: TAbstractFile, oldPath: string) => void {
    return (newFile: TAbstractFile, oldPath: string) => {
        if (session.filepath === oldPath) {
            session.filepath = newFile.path;
            console.log("Renaming file", oldPath, "to", newFile.path);
        }
    }
}
