import { useSyncExternalStore } from "react";

import {
    getResolvedTheme,
    getThemePreference,
    subscribeTheme,
    type ResolvedTheme,
    type ThemePreference,
} from "./theme";

/** The theme currently shown ("light" or "dark"). */
export function useResolvedTheme(): ResolvedTheme {
    return useSyncExternalStore(subscribeTheme, getResolvedTheme, () => "light");
}

/** The user's choice: "system", "light" or "dark". */
export function useThemePreference(): ThemePreference {
    return useSyncExternalStore(subscribeTheme, getThemePreference, () => "system");
}
