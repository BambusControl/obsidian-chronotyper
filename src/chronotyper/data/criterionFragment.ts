import { DataFragment } from "./dataFragment";

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
     * Whether the updated property is enabled
     */
    updatedPropertyEnabled?: boolean;

    /**
     * Property name for storing edit time in seconds in frontmatter
     */
    editTimePropertyName?: string;

    /**
     * Whether the edit time property is enabled
     */
    editTimePropertyEnabled?: boolean;

}
