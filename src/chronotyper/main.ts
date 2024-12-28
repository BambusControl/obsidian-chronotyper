import {App, Events, Plugin, PluginManifest} from "obsidian";
import {EditSession} from "./editSession";
import {onWorkspaceFileOpen} from "./eventHandlers/onWorkspaceFileOpen";
import {onVaultRename} from "./eventHandlers/onVaultRename";
import {onVaultDelete} from "./eventHandlers/onVaultDelete";
import {onWorkspaceEditorChange} from "./eventHandlers/onWorkspaceEditorChange";

/* Used by Obsidian */
// noinspection JSUnusedGlobalSymbols
export default class Chronotyper extends Plugin {
    private editSession: EditSession = {
        filepath: null,
        viewStartTime: 0,
        lastEditTime: null,
        totalEditTime: 0
    };
    private readonly eventRegistrar: Map<{ target: Events, name: string }, any>;

    public constructor(app: App, manifest: PluginManifest) {
        super(app, manifest);

        this.eventRegistrar = new Map<{ target: Events, name: string }, any>();
        this.eventRegistrar.set({
            target: this.app.workspace,
            name: 'file-open'
        }, onWorkspaceFileOpen(this.app, this.editSession));
        this.eventRegistrar.set({
            target: this.app.workspace,
            name: 'editor-change'
        }, onWorkspaceEditorChange(this.editSession));
        this.eventRegistrar.set({target: this.app.vault, name: 'delete'}, onVaultDelete(this.editSession));
        this.eventRegistrar.set({target: this.app.vault, name: 'rename'}, onVaultRename(this.editSession));
    }

    override onload(): void {
        console.group("Loading Chronotyper plugin");
        console.time("Chronotyper load time");

        for (const [key, value] of this.eventRegistrar) {
            key.target.on(key.name, value);
        }

        console.timeEnd("Chronotyper load time");
        console.groupEnd();
    }

    override unload(): void {
        for (const [key, value] of this.eventRegistrar) {
            key.target.off(key.name, value);
        }
    }
}
