import {App, Events, Plugin, PluginManifest} from "obsidian";
import {EditSession} from "./editSession";
import {onWorkspaceFileOpen} from "./eventHandlers/onWorkspaceFileOpen";
import {onVaultRename} from "./eventHandlers/onVaultRename";
import {onVaultDelete} from "./eventHandlers/onVaultDelete";
import {onWorkspaceEditorChange} from "./eventHandlers/onWorkspaceEditorChange";
import {SettingsTab} from "./settingsTab";
import {PersistCache} from "./persistCache";
import {MetaDataManager} from "./metaDataManager";
import {CriterionDataManager} from "./criterionDataManager";
import {RootDataManager} from "./rootDataManager";
import {RootPluginDataStorage} from "./rootPluginDataStorage";
import {MetaStorage} from "./metaStorage";
import {CriterionStorage} from "./criterionStorage";

/* Used by Obsidian */
// noinspection JSUnusedGlobalSymbols
export default class Chronotyper extends Plugin {
    private editSession: EditSession = {
        filepath: null,
        viewStartTime: 0,
        lastEditTime: null,
        totalEditTime: 0
    };
    private readonly eventRegistrar = new Map<{ target: Events, name: string }, any>();

    public constructor(app: App, manifest: PluginManifest) {
        super(app, manifest);
    }

    override async onload(): Promise<void> {
        console.group("Loading Chronotyper plugin");
        console.time("Chronotyper load time");

        const dataLoader = new PersistCache(
            () => this.loadData(),
            (data) => this.saveData(data)
        );

        const dataStore = new RootPluginDataStorage(dataLoader);
        const metaStore = new MetaStorage(dataStore);
        const criterionStore = new CriterionStorage(dataStore);

        const metaDm = new MetaDataManager();
        const criterionDm = new CriterionDataManager();

        const dataManager = new RootDataManager(
            dataLoader,
            metaDm,
            criterionDm,
        );

        await dataManager.initializeData();

        this.eventRegistrar.set({
            target: this.app.workspace,
            name: 'file-open'
        }, onWorkspaceFileOpen(this.app, this.editSession, criterionStore));
        this.eventRegistrar.set({
            target: this.app.workspace,
            name: 'editor-change'
        }, onWorkspaceEditorChange(this.editSession));
        this.eventRegistrar.set({
            target: this.app.vault,
            name: 'delete'
        }, onVaultDelete(this.editSession));
        this.eventRegistrar.set({
            target: this.app.vault,
            name: 'rename'
        }, onVaultRename(this.editSession));

        this.addSettingTab(new SettingsTab(this.app, this, criterionStore));

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
