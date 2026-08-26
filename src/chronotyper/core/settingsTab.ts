import {
    App,
    debounce,
    Plugin,
    PluginSettingTab,
    requireApiVersion,
    Setting,
    type SettingDefinitionItem
} from "obsidian";
import { CriterionStorage } from "../storage/criterionStorage";

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

    override getSettingDefinitions(): SettingDefinitionItem[] {
        if (!requireApiVersion("1.13.0")) return [];

        return [
            {
                name: "Excluded directories",
                desc:
                    "Exclude directories from having their edit time tracked. " +
                    "The plugin will leave files within these directories alone.",
                render: setting => {
                    setting.setHeading();
                }
            },
            {
                name: "Add a directory exclusion",
                render: setting => {
                    let currentInput = "";

                    setting
                        .addSearch(search => {
                            search.setPlaceholder("Enter directory path to exclude");
                            search.onChange(debounce(value => {
                                currentInput = value;
                                const folder = this.app.vault.getFolderByPath(value);
                                search.inputEl.style.color = folder == null ? "" : "green";
                            }));
                        })
                        .addButton(button => {
                            button
                                .setButtonText("Add")
                                .setCta()
                                .onClick(async () => {
                                    const exclusions = await this.criterionStore.getExclusion() || [];
                                    if (currentInput && !exclusions.includes(currentInput)) {
                                        const folder = this.app.vault.getFolderByPath(currentInput);
                                        if (folder) {
                                            await this.criterionStore.overwriteExclusion([
                                                ...exclusions,
                                                folder.path
                                            ]);
                                            this.update();
                                        }
                                    }
                                });
                        });
                }
            },
            {
                name: "Current directory exclusions",
                searchable: false,
                render: setting => {
                    let disposed = false;
                    setting.settingEl.empty();
                    const excludedList = setting.settingEl.createEl("div", {
                        cls: "excluded-paths-list"
                    });

                    void this.criterionStore.getExclusion().then(loadedExclusions => {
                        if (disposed) return;
                        const exclusions = loadedExclusions || [];

                        if (exclusions.length === 0) {
                            excludedList.createEl("p", {
                                text: "No directories are currently excluded."
                            });
                            return;
                        }

                        for (const path of exclusions) {
                            new Setting(excludedList)
                                .setName(path)
                                .addExtraButton(button => {
                                    button
                                        .setIcon("trash")
                                        .setTooltip("Remove")
                                        .onClick(async () => {
                                            await this.criterionStore.overwriteExclusion(
                                                exclusions.filter(candidate => candidate !== path)
                                            );
                                            this.update();
                                        });
                                });
                        }
                    });

                    return () => {
                        disposed = true;
                    };
                }
            },
            {
                name: "Property names",
                render: setting => {
                    setting.setHeading();
                }
            },
            {
                name: "Updated timestamp property",
                desc: "Property name used to store the last update timestamp in frontmatter",
                render: setting => {
                    let disposed = false;
                    void Promise.all([
                        this.criterionStore.getUpdatedPropertyName(),
                        this.criterionStore.getUpdatedPropertyEnabled()
                    ]).then(([propertyName, enabled]) => {
                        if (disposed) return;
                        setting
                            .addText(text => text
                                .setValue(propertyName)
                                .setDisabled(!enabled)
                                .onChange(async value => {
                                    await this.criterionStore.overwriteUpdatedPropertyName(value);
                                })
                            )
                            .addToggle(toggle => toggle
                                .setValue(enabled)
                                .onChange(async value => {
                                    await this.criterionStore.overwriteUpdatedPropertyEnabled(value);
                                    this.update();
                                })
                            );
                    });

                    return () => {
                        disposed = true;
                    };
                }
            },
            {
                name: "Edit time property",
                desc: "Property name used to store the total edit time (in seconds) in frontmatter",
                render: setting => {
                    let disposed = false;
                    void Promise.all([
                        this.criterionStore.getEditTimePropertyName(),
                        this.criterionStore.getEditTimePropertyEnabled()
                    ]).then(([propertyName, enabled]) => {
                        if (disposed) return;
                        setting
                            .addText(text => text
                                .setValue(propertyName)
                                .setDisabled(!enabled)
                                .onChange(async value => {
                                    await this.criterionStore.overwriteEditTimePropertyName(value);
                                })
                            )
                            .addToggle(toggle => toggle
                                .setValue(enabled)
                                .onChange(async value => {
                                    await this.criterionStore.overwriteEditTimePropertyEnabled(value);
                                    this.update();
                                })
                            );
                    });

                    return () => {
                        disposed = true;
                    };
                }
            }
        ];
    }

    override async display(): Promise<void> {
        if (this.rendered) {
            return;
        }

        const { containerEl } = this;

        const loadedExclusions = await this.criterionStore.getExclusion();
        const exclusions = loadedExclusions || [];
        await this.displayFolderExclusions(containerEl, exclusions);

        const updatedPropertyName = await this.criterionStore.getUpdatedPropertyName();
        const editTimePropertyName = await this.criterionStore.getEditTimePropertyName();
        const updatedEnabled = await this.criterionStore.getUpdatedPropertyEnabled();
        const editTimeEnabled = await this.criterionStore.getEditTimePropertyEnabled();
        await this.displayPropertySettings(containerEl, updatedPropertyName, editTimePropertyName, updatedEnabled, editTimeEnabled);

        this.rendered = true;
    }

    private async displayPropertySettings(containerEl: HTMLElement, updatedPropertyName: string, editTimePropertyName: string, updatedEnabled: boolean, editTimeEnabled: boolean): Promise<void> {
        // Add section for property name settings
        new Setting(containerEl).setHeading().setName("Property Names");

        new Setting(containerEl)
            .setName("Updated timestamp property")
            .setDesc("Property name used to store the last update timestamp in frontmatter")
            .addText(text => text
                .setValue(updatedPropertyName)
                .setDisabled(!updatedEnabled)
                .onChange(async (value) => {
                    await this.criterionStore.overwriteUpdatedPropertyName(value);
                })
            )
            .addToggle(toggle => toggle
                .setValue(updatedEnabled)
                .onChange(async (value) => {
                    await this.criterionStore.overwriteUpdatedPropertyEnabled(value);
                })
            );

        new Setting(containerEl)
            .setName("Edit time property")
            .setDesc("Property name used to store the total edit time (in seconds) in frontmatter")
            .addText(text => text
                .setValue(editTimePropertyName)
                .setDisabled(!editTimeEnabled)
                .onChange(async (value) => {
                    await this.criterionStore.overwriteEditTimePropertyName(value);
                })
            )
            .addToggle(toggle => toggle
                .setValue(editTimeEnabled)
                .onChange(async (value) => {
                    await this.criterionStore.overwriteEditTimePropertyEnabled(value);
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

        const excludedList = containerEl.createEl("div", { cls: "excluded-paths-list" });

        if (exclusions.length === 0) {
            excludedList.createEl("p", { text: "No directories are currently excluded." });
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
