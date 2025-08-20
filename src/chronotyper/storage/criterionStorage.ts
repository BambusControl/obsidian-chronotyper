import { RootDataStore } from "./rootDataStore";
import { Exclusion } from "../data/criterionFragment";

// Default property names to maintain backward compatibility
const DEFAULT_UPDATED_PROPERTY = 'updated';
const DEFAULT_EDIT_TIME_PROPERTY = 'edited_seconds';

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

    async getUpdatedPropertyName(): Promise<string> {
        const criterion = await this.store.getCriterion();
        return criterion.updatedPropertyName || DEFAULT_UPDATED_PROPERTY;
    }

    async getEditTimePropertyName(): Promise<string> {
        const criterion = await this.store.getCriterion();
        return criterion.editTimePropertyName || DEFAULT_EDIT_TIME_PROPERTY;
    }

    async overwriteUpdatedPropertyName(propertyName: string): Promise<void> {
        const originalData = await this.store.getCriterion();

        await this.store.overwriteCriterion({
            ...originalData,
            updatedPropertyName: propertyName,
        });
    }

    async overwriteEditTimePropertyName(propertyName: string): Promise<void> {
        const originalData = await this.store.getCriterion();

        await this.store.overwriteCriterion({
            ...originalData,
            editTimePropertyName: propertyName,
        });
    }

    async getUpdatedPropertyEnabled(): Promise<boolean> {
        const criterion = await this.store.getCriterion();
        return criterion.updatedPropertyEnabled ?? true; // Default to enabled for backward compatibility
    }

    async getEditTimePropertyEnabled(): Promise<boolean> {
        const criterion = await this.store.getCriterion();
        return criterion.editTimePropertyEnabled ?? true; // Default to enabled for backward compatibility
    }

    async overwriteUpdatedPropertyEnabled(enabled: boolean): Promise<void> {
        const originalData = await this.store.getCriterion();

        await this.store.overwriteCriterion({
            ...originalData,
            updatedPropertyEnabled: enabled,
        });
    }

    async overwriteEditTimePropertyEnabled(enabled: boolean): Promise<void> {
        const originalData = await this.store.getCriterion();

        await this.store.overwriteCriterion({
            ...originalData,
            editTimePropertyEnabled: enabled,
        });
    }
}
