import {EditSession} from "../editSession";

export function onWorkspaceEditorChange(session: EditSession): () => void {
    return () => {
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
    }
}
