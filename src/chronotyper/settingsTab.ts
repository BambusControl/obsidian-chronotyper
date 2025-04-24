import {App, ButtonComponent, debounce, Plugin, PluginSettingTab, Setting} from "obsidian";
import {CriterionStorage} from "./criterionStorage";

export class SettingsTab extends PluginSettingTab {
    private rendered = false;
    private exclusions: string[] = [];
    private currentInput = "";

    constructor(
        app: App,
        private readonly plugin: Plugin,
        private readonly criterionStore: CriterionStorage
    ) {
        super(app, plugin);
        this.containerEl.addClass("plugin", "chronotyper", "setting-tab");
    }

    override async display(): Promise<void> {
        const {containerEl} = this;
        containerEl.empty();

        const loadedExclusions = await this.criterionStore.getExclusion();
        this.exclusions = loadedExclusions || [];

        new Setting(containerEl)
            .setName("Excluded directories")
            .setDesc(
                "Exclude directories from having their edit time tracked. " +
                "The plugin will leave files within these directories alone."
            )
            .addSearch((search) => {
                search.setPlaceholder("Enter directory path to exclude");

                search.onChange(debounce((value) => {
                    this.currentInput = value;
                    const folder = this.app.vault.getFolderByPath(value);
                    search.inputEl.style.color = folder == null ? "" : "green";
                }));
            })
            .addButton((button) => {
                button
                    .setButtonText("Add")
                    .setCta()
                    .onClick(async () => {
                        if (this.currentInput && !this.exclusions.includes(this.currentInput)) {
                            const folder = this.app.vault.getFolderByPath(this.currentInput);
                            if (folder) {
                                this.exclusions.push(folder.path);
                                await this.criterionStore.overwriteExclusion(this.exclusions);
                                this.display();
                            }
                        }
                    });
            });

        // Display existing exclusions with remove buttons
        containerEl.createEl("h3", {text: "Currently excluded directories:"});

        const excludedList = containerEl.createEl("div", {cls: "excluded-paths-list"});

        if (this.exclusions.length === 0) {
            excludedList.createEl("p", {text: "No directories are currently excluded."});
        } else {
            for (const path of this.exclusions) {
                const exclusionContainer = excludedList.createDiv({cls: "excluded-path-container"});

                exclusionContainer.createSpan({text: path, cls: "excluded-path"});

                const removeButton = new ButtonComponent(exclusionContainer)
                    .setIcon("trash")
                    .setTooltip("Remove")
                    .onClick(async () => {
                        this.exclusions = this.exclusions.filter(p => p !== path);
                        await this.criterionStore.overwriteExclusion(this.exclusions);
                        this.display();
                    });
            }
        }
    }

    override async hide(): Promise<void> {
        await this.criterionStore.overwriteExclusion(this.exclusions);
    }
}
