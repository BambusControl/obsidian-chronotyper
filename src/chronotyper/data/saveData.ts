import {MetaFragment} from "./metaFragment";
import {DataFragment} from "./dataFragment";
import {CriterionFragment} from "./criterionFragment";

/**
 * Generic structure of `data.json`
 */
export interface SaveDataOf<T> {
    /**
     * Metadata information about the save data itself
     */
    meta: T;

    /**
     * Criterion for files to be included/excluded from tracking
     */
    criterion: T;
}

/**
 * Structure of `data.json`, where each fragment is a self-managed data fragment
 */
export interface SaveData extends SaveDataOf<DataFragment> {
    meta: MetaFragment;
    criterion: CriterionFragment;
}
