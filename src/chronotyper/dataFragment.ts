import {SaveDataVersion} from "./version";

/**
 * Top level fragment of self-standing save data
 */
export interface DataFragment {
    initialized: boolean;
    version: SaveDataVersion;
}

export function isTypeDataFragment(object: any): object is DataFragment {
    return object != null
        && "initialized" in object
        && "version" in object
        ;
}
