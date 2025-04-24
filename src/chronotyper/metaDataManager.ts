import {DataEvent, isDataEvent, MetaFragment} from "./metaFragment";
import {DataFragment} from "./dataFragment";
import {DataFragmentManager} from "./dataFragmentManager";
import {CURRENT_PLUGIN_VERSION} from "./version";

export class MetaDataManager implements DataFragmentManager<MetaFragment> {
    initData(fragment: DataFragment): MetaFragment {
        if (fragment.initialized && isMetaFragment(fragment)) {
            return fragment;
        }

        console.info("Initializing metadata");

        return {
            ...fragment,
            pluginVersion: CURRENT_PLUGIN_VERSION,
            initialized: true,
            events: [],
        };
    }

    async updateData(fragment: MetaFragment, _: Set<DataEvent>): Promise<MetaFragment> {
        /* No-op yet */
        return fragment;
    }

}

function isMetaFragment(fragment: DataFragment): fragment is MetaFragment {
    return "events" in fragment
        && fragment.events != null
        && Array.isArray(fragment.events)
        && fragment.events.every(e => isDataEvent(e))
        ;
}

