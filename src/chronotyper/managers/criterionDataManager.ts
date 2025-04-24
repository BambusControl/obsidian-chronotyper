import {DataFragment} from "../data/dataFragment";
import {CriterionFragment} from "../data/criterionFragment";
import {DataFragmentManager} from "./dataFragmentManager";
import {DataEvent} from "../data/metaFragment";

export class CriterionDataManager implements DataFragmentManager<CriterionFragment> {
    initData(fragment: DataFragment): CriterionFragment {
        if (fragment.initialized && isCriterionFragment(fragment)) {
            return fragment;
        }

        console.info("Initializing criterion");

        return {
            ...fragment,
            initialized: true,
            exclude: [],
        };
    }

    async updateData(fragment: CriterionFragment, _: Set<DataEvent>): Promise<CriterionFragment> {
        /* No-op yet */
        return fragment;
    }

}

function isCriterionFragment(fragment: DataFragment): fragment is CriterionFragment {
    return "exclude" in fragment
        && Array.isArray(fragment.exclude)
        ;
}
