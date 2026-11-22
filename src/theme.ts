/**
 * Light / dark theme.
 *
 * The preference ("system", "light" or "dark") is stored per device in
 * localStorage. The resolved theme is written to <html data-theme>,
 * which index.css uses to swap the whole palette to warm charcoal.
 * An inline script in index.html applies it before the first paint,
 * so the app never flashes white.
 */

export type ThemePreference = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "tantiya-theme";

/** Browser/status bar color per theme (matches the page header). */
const THEME_COLORS: Record<ResolvedTheme, string> = {
    light: "#1c1917",
    dark: "#0c0a09",
};

const listeners = new Set<() => void>();

function systemPrefersDark(): boolean {
    return typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-color-scheme: dark)").matches;
}

export function getThemePreference(): ThemePreference {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);

        if (stored === "light" || stored === "dark" || stored === "system") {
            return stored;
        }
    } catch {
        // Storage can be blocked (private mode); fall back to system.
    }

    return "system";
}

export function getResolvedTheme(): ResolvedTheme {
    const preference = getThemePreference();

    if (preference === "system") {
        return systemPrefersDark() ? "dark" : "light";
    }

    return preference;
}

function applyTheme(): void {
    const theme = getResolvedTheme();
    const root = document.documentElement;

    root.dataset.theme = theme;
    root.style.colorScheme = theme;

    document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute("content", THEME_COLORS[theme]);

    listeners.forEach(listener => listener());
}

export function setThemePreference(preference: ThemePreference): void {
    try {
        localStorage.setItem(STORAGE_KEY, preference);
    } catch {
        // Not saved, but still applied for this session.
    }

    applyTheme();
}

export function subscribeTheme(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

/** Apply the theme and follow the OS setting while on "system". */
export function initTheme(): void {
    applyTheme();

    window
        .matchMedia?.("(prefers-color-scheme: dark)")
        .addEventListener("change", () => {
            if (getThemePreference() === "system") {
                applyTheme();
            }
        });
}
