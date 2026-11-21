export type HistoryPeriod = "thisMonth" | "lastMonth" | "allTime";

export interface HistoryFilterState {
    search: string;
    period: HistoryPeriod;
    /** Value of the dropdown filter; "all" means no filter. */
    option: string;
}

export const DEFAULT_HISTORY_FILTERS: HistoryFilterState = {
    search: "",
    period: "thisMonth",
    option: "all",
};

export const HISTORY_PAGE_SIZE = 10;

/** True when the ISO date falls inside the selected period (local time). */
export function matchesPeriod(
    isoDate: string,
    period: HistoryPeriod,
    now: Date = new Date()
): boolean {

    if (period === "allTime") {
        return true;
    }

    const date = new Date(isoDate);

    const target =
        period === "thisMonth"
            ? now
            : new Date(now.getFullYear(), now.getMonth() - 1, 1);

    return (
        date.getMonth() === target.getMonth() &&
        date.getFullYear() === target.getFullYear()
    );
}

/** Case-insensitive match against any of the given text fields. */
export function matchesSearch(
    term: string,
    ...fields: (string | undefined)[]
): boolean {

    const needle = term.trim().toLowerCase();

    if (!needle) {
        return true;
    }

    return fields.some(field =>
        field?.toLowerCase().includes(needle)
    );
}

/** Newest first, without mutating the original array. */
export function sortNewestFirst<T extends { date: string }>(
    items: T[]
): T[] {
    return [...items].sort((a, b) =>
        b.date.localeCompare(a.date)
    );
}