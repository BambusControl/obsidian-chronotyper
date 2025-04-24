import {RootDataStore} from "./rootDataStore";
import {Exclusion} from "../data/criterionFragment";

export class CriterionStorage {

    constructor(private readonly store: RootDataStore) {
    }

    async getExclusion(): Promise<Exclusion> {
        const criterion = await this.store.getCriterion();

        // Handle backward compatibility
        if (criterion.exclude === null) {
            return [];
        }

        // Convert string to array if needed (backward compatibility)
        if (typeof criterion.exclude === 'string') {
            return criterion.exclude ? [criterion.exclude] : [];
        }

        return criterion.exclude || [];
    }

    async overwriteExclusion(exclusion: Exclusion): Promise<void> {
        const originalData = await this.store.getCriterion();

        const savedData = await this.store.overwriteCriterion({
            ...originalData,
            exclude: exclusion || [],
        });
    }
}
