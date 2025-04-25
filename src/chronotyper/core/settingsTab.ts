import {App, debounce, Plugin, PluginSettingTab, Setting} from "obsidian";
import {CriterionStorage} from "../storage/criterionStorage";

export class SettingsTab extends PluginSettingTab {
    private rendered = false;

    constructor(
        app: App,
        private readonly plugin: Plugin,
        private readonly criterionStore: CriterionStorage
    ) {
        super(app, plugin);
        this.containerEl.addClass("plugin", "chronotyper", "setting-tab");
    }

    override async display(): Promise<void> {
        if (this.rendered) {
            return;
        }

        const {containerEl} = this;

        const loadedExclusions = await this.criterionStore.getExclusion();
        const exclusions = loadedExclusions || [];
        await this.displayFolderExclusions(containerEl, exclusions);

        const updatedPropertyName = await this.criterionStore.getUpdatedPropertyName();
        const editTimePropertyName = await this.criterionStore.getEditTimePropertyName();
        await this.displayPropertySettings(containerEl, updatedPropertyName, editTimePropertyName);

        this.rendered = true;
    }

    private async displayPropertySettings(containerEl: HTMLElement, updatedPropertyName: string, editTimePropertyName: string): Promise<void> {
        // Add section for property name settings
        new Setting(containerEl).setHeading().setName("Property Names");

        new Setting(containerEl)
            .setName("Updated timestamp property")
            .setDesc("Property name used to store the last update timestamp in frontmatter")
            .addText(text => text
                .setValue(updatedPropertyName)
                .onChange(async (value) => {
                    await this.criterionStore.overwriteUpdatedPropertyName(value);
                })
            );

        new Setting(containerEl)
            .setName("Edit time property")
            .setDesc("Property name used to store the total edit time (in seconds) in frontmatter")
            .addText(text => text
                .setValue(editTimePropertyName)
                .onChange(async (value) => {
                    await this.criterionStore.overwriteEditTimePropertyName(value);
                })
            );
    }

    private async displayFolderExclusions(containerEl: HTMLElement, exclusions: string[]): Promise<void> {
        let currentInput = "";

        new Setting(containerEl)
            .setHeading()
            .setName("Excluded directories")
            .setDesc(
                "Exclude directories from having their edit time tracked. " +
                "The plugin will leave files within these directories alone."
            )

        new Setting(containerEl)
            .setName("Add a directory exclusion")
            .addSearch((search) => {
                search.setPlaceholder("Enter directory path to exclude");

                search.onChange(debounce((value) => {
                    currentInput = value;
                    const folder = this.app.vault.getFolderByPath(value);
                    search.inputEl.style.color = folder == null ? "" : "green";
                }));
            })
            .addButton((button) => {
                button
                    .setButtonText("Add")
                    .setCta()
                    .onClick(async () => {
                        if (currentInput && !exclusions.includes(currentInput)) {
                            const folder = this.app.vault.getFolderByPath(currentInput);
                            if (folder) {
                                const updatedExclusions = [...exclusions, folder.path];
                                await this.criterionStore.overwriteExclusion(updatedExclusions);
                                this.display();
                            }
                        }
                    });
            });

        const excludedList = containerEl.createEl("div", {cls: "excluded-paths-list"});

        if (exclusions.length === 0) {
            excludedList.createEl("p", {text: "No directories are currently excluded."});
        } else {
            for (const path of exclusions) {
                new Setting(excludedList)
                    .setName(path)
                    .addExtraButton(button => {
                        button
                            .setIcon("trash")
                            .setTooltip("Remove")
                            .onClick(async () => {
                                const updatedExclusions = exclusions.filter(p => p !== path);
                                await this.criterionStore.overwriteExclusion(updatedExclusions);
                                this.display();
                            });
                    });
            }
        }
    }

    override async hide(): Promise<void> {
        const exclusions = await this.criterionStore.getExclusion() || [];
        await this.criterionStore.overwriteExclusion(exclusions);
    }
}
