import { RootDataStore } from "./rootDataStore";
import {PersistCache} from "./persistCache";
import {SaveData} from "./saveData";
import { MetaFragment } from "./metaFragment";
import {CriterionFragment} from "./criterionFragment";

export class RootPluginDataStorage implements RootDataStore {

    constructor(
        private readonly storedData: PersistCache<SaveData>,
    ) {
    }

    async getMeta(): Promise<MetaFragment> {
        return (await this.storedData.get()).meta;
    }

    async overwriteMeta(data: MetaFragment): Promise<MetaFragment> {
        const mergedData = await this.mergeData({
            meta: data,
        });

        return mergedData.meta;
    }

    async getCriterion(): Promise<CriterionFragment> {
        return (await this.storedData.get()).criterion;
    }

    async overwriteCriterion(data: CriterionFragment): Promise<CriterionFragment> {
        const mergedData = await this.mergeData({
            criterion: data,
        });

        return mergedData.criterion;
    }

    private async mergeData(data: Partial<SaveData>): Promise<SaveData> {
        const storedData = await this.storedData.get();

        const newData: SaveData = {
            ...storedData,
            ...data,
        };

        this.storedData.set(newData);
        return await this.storedData.persist();
    }
}
