/**
 * Version of the plugin.
 *
 * Must comply with RegEx:
 * ```^[0-9]+\\.[0-9]+\\.[0-9]+(?:-[A-Z]+)?$```
 */
export type PluginVersion
    = "0.2.0"
    | "0.2.0-NEXT"
    // Update every release only if plugin version changed
    ;

export type CurrentPluginVersion = "0.2.0-NEXT" & PluginVersion;
export const CURRENT_PLUGIN_VERSION: CurrentPluginVersion = "0.2.0-NEXT";

/**
 * Version of the save data schema.
 *
 * Must comply with RegEx:
 * ```^[0-9]+\\.[0-9]+\\.[0-9]+(?:-[A-Z]+)?$```
 *
 * The version of the save data schema is independent of the plugin version
 * @see {@link PluginVersion}
 */
export type SaveDataVersion = PluginVersion &
    ( "0.2.0"
    | "0.2.0-NEXT"
    // Update only if save data schema changed
    );

export type CurrentSaveDataVersion = "0.2.0-NEXT" & SaveDataVersion;
export const CURRENT_DATA_VERSION: CurrentPluginVersion = "0.2.0-NEXT";
