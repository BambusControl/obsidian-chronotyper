import {DataFragment, isTypeDataFragment} from "../data/dataFragment";
import {SaveData, SaveDataOf} from "../data/saveData";
import {MetaFragment} from "../data/metaFragment";
import {PersistCache} from "../storage/persistCache";
import {DataManager} from "./dataManager";
import {MetaDataManager} from "./metaDataManager";
import {CriterionDataManager} from "./criterionDataManager";
import {CURRENT_DATA_VERSION} from "../core/version";

type MetaSaveDataFragments = Omit<SaveDataOf<DataFragment>, "meta"> & { meta: MetaFragment };

export class RootDataManager implements DataManager {
    constructor(
        private readonly storedData: PersistCache<any>,
        private readonly metaDm: MetaDataManager,
        private readonly criterionDm: CriterionDataManager,
    ) {
    }

    async initializeData(): Promise<void> {
        console.group("Save data initialization");
        /* We don't know what we will load */
        const loadedData: any = (await this.storedData.get()) ?? {};

        /* First, Make sure the data is well-shaped */
        const shapedData = RootDataManager.shapeLoadedData(loadedData);

        /* Full initialization of meta-data, because other fragments need to process its events */
        const loadedDataWithMeta = await this.initMeta(shapedData);

        /* Now we let each data fragment handle initialization of its data if needed */
        console.group("Initializing data");
        const initializedData = this.initData(loadedDataWithMeta);
        console.groupEnd();

        /* After this, each data fragment manager can request fragments data */
        this.storedData.set(initializedData);

        /* Each data fragment can update its data if needed */
        console.group("Updating data");
        const upToDateData = await this.updateData(initializedData);
        console.groupEnd();

        /* Finally, persist the data */
        console.info("Saving initialized data");
        this.storedData.set(upToDateData);
        await this.storedData.persist();
        console.groupEnd();
    }

    private async initMeta(fragments: SaveDataOf<DataFragment>): Promise<MetaSaveDataFragments> {
        /* Does the skeleton have data? */
        const initializedMeta = this.metaDm.initData(fragments.meta);

        /* Is the data up to date with the latest data version? */
        const upToDateMeta = await this.metaDm.updateData(initializedMeta, new Set([]));

        /* Check and create the shape of save-data if missing */
        return {
            ...fragments,
            meta: upToDateMeta,
        };
    }

    private initData(fragments: MetaSaveDataFragments): SaveData {
        const criterionData = this.criterionDm.initData(fragments.criterion);

        return {
            ...fragments,
            criterion: criterionData,
        };
    }

    private async updateData(initializedData: SaveData): Promise<SaveData> {
        /* We load the meta-data first, to be able to process events like re-downloading of characters etc. */
        const metaData = await this.metaDm.updateData(initializedData.meta, new Set([]));
        const events = new Set(metaData.events);
        console.info("Events to process", events);

        /* All the other updates see the events, and handle them accordingly */
        const criterionData = await this.criterionDm.updateData(initializedData.criterion, events);

        console.info("Unprocessed events", events);
        metaData.events = Array.from(events);

        return {
            meta: metaData,
            criterion: criterionData,
        };
    }

    private static shapeLoadedData(loadedData: any): SaveDataOf<DataFragment> {
        /* Check and create the shape of save-data if missing
         * Removing any element will remove it from save data
         */
        return {
            meta: RootDataManager.createFragment(loadedData.meta),
            criterion: RootDataManager.createFragment(loadedData.criterion),
        };
    }

    private static createFragment(dataPart: any): DataFragment {
        return isTypeDataFragment(dataPart)
            ? dataPart
            : {
                initialized: false,
                version: CURRENT_DATA_VERSION,
            };
    }

}
