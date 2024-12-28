import {EditSession} from "../editSession";
import {TAbstractFile} from "obsidian";

export function onVaultDelete(session: EditSession): (deletedFile: TAbstractFile) => void {
    return (deletedFile: TAbstractFile) => {
        if (session.filepath === deletedFile.path) {
            session.filepath = null;
            console.log("Deleting file", deletedFile.path);
        }
    }
}
