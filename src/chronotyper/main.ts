import {App, moment, Plugin, PluginManifest, TFile} from "obsidian";

/* Used by Obsidian */
// noinspection JSUnusedGlobalSymbols
export default class Chronotyper extends Plugin {

    public constructor(
        app: App,
        manifest: PluginManifest,
    ) {
        super(app, manifest);
    }

    public override async onload(): Promise<void> {
        console.group("Loading Chronotyper plugin");
        console.time("Chronotyper load time");

        const es: EditSession = {
            file: null,
            openTime: 0,
        };

        this.registerEvent(
            this.app.workspace.on('file-open', (newFile) => {
                if (es.file != null) {
                    const duration = moment.duration(Date.now() - es.openTime, 'milliseconds');
                    const isClosingFile = newFile == null;
                    const reason = isClosingFile ? "closed" : "switched";

                    console.info(`File ${reason} after ${duration.humanize()}`);

                    // Update edit time in frontmatter
                    this.app.fileManager.processFrontMatter(es.file, (frontmatter) => {
                        frontmatter['editTime'] = Math.floor(
                            (frontmatter['editTime'] ?? 0) + duration.asSeconds()
                        );
                    });
                }

                // Handle file opening
                if (newFile != null) {
                    console.info(`File opened: ${newFile.name}`);
                    es.file = newFile;
                    es.openTime = Date.now();
                } else {
                    es.file = null;
                    es.openTime = 0;
                }
            })
        );

        console.timeEnd("Chronotyper load time");
        console.groupEnd();
    }
}

interface EditSession {
    file: TFile | null;
    openTime: number;
}
