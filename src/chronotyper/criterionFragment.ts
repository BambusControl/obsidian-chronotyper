import {DataFragment} from "./dataFragment";

export type Exclusion = string[];

export interface CriterionFragment extends DataFragment {

    /**
     * List of excluded directories
     */
    exclude: Exclusion;
}
