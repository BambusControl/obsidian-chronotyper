import {DataFragment} from "./dataFragment";

export type Exclusion = string[];

export interface CriterionFragment extends DataFragment {

    /**
     * List of excluded directories
     */
    exclude: Exclusion;

    /**
     * Property name for storing update timestamp in frontmatter
     */
    updatedPropertyName?: string;

    /**
     * Property name for storing edit time in seconds in frontmatter
     */
    editTimePropertyName?: string;
}
