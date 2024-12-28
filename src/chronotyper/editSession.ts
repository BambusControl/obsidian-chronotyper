import {TFile} from "obsidian";

export interface EditSession {
    filepath: TFile["path"] | null;
    viewStartTime: number;
    lastEditTime: number | null;
    totalEditTime: number;
}
