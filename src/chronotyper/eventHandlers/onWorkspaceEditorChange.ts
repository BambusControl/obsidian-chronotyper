import {EditSession} from "../core/editSession";

export function onWorkspaceEditorChange(session: EditSession): () => void {
    return () => {
        if (session.filepath == null) {
            return
        }

        const now = Date.now();
        const typingTime = now - (session.lastEditTime ?? now);

        // Only register typing with gaps of 5 seconds between keystrokes
        if (typingTime < 5000) {
            session.totalEditTime += typingTime;
        }

        session.lastEditTime = now;
    }
}
