import { format } from "date-fns";

/** Today's date as yyyy-MM-dd in local time (for date input defaults). */
export function todayKey(): string {
    return format(new Date(), "yyyy-MM-dd");
}

/** Converts a stored ISO timestamp into a local yyyy-MM-dd key. */
export function toDateKey(isoString: string): string {
    return format(new Date(isoString), "yyyy-MM-dd");
}

/**
 * Converts a yyyy-MM-dd value from a date input into a Date.
 * Today keeps the current time so same-day ordering still works.
 * Past dates are pinned to local noon so they never shift a day
 * when stored as UTC.
 */
export function toEntryDate(dateKey?: string): Date {
    if (!dateKey || dateKey === todayKey()) {
        return new Date();
    }

    const [year, month, day] = dateKey.split("-").map(Number);

    return new Date(year, month - 1, day, 12, 0, 0);
}