import {MetaFragment} from "../data/metaFragment";
import {CriterionFragment} from "../data/criterionFragment";

export interface RootDataStore {
    getMeta(): Promise<MetaFragment>
    overwriteMeta(data: MetaFragment): Promise<MetaFragment>

    getCriterion(): Promise<CriterionFragment>
    overwriteCriterion(data: CriterionFragment): Promise<CriterionFragment>
}
