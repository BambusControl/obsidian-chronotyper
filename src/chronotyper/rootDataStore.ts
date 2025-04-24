import {MetaFragment} from "./metaFragment";
import {CriterionFragment} from "./criterionFragment";

export interface RootDataStore {
    getMeta(): Promise<MetaFragment>
    overwriteMeta(data: MetaFragment): Promise<MetaFragment>

    getCriterion(): Promise<CriterionFragment>
    overwriteCriterion(data: CriterionFragment): Promise<CriterionFragment>
}
