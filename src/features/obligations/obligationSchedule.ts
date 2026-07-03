import { getISOWeek, getISOWeekYear } from "date-fns";

import type { Obligation } from "../../types/obligation";

export interface ObligationDueInfo {
    dueDate: Date;
    /** Negative when overdue (an unpaid due date has passed). */
    daysUntilDue: number;
    /** The recurrence period the next payment should cover. */
    periodKey: string;
    /** True when the period containing today is already paid. */
    paidForCurrentPeriod: boolean;
    /**
     * Key of the period containing the most recent due date,
     * or null if the obligation was created after it.
     * Used to unmark a payment.
     */
    currentPeriodKey: string | null;
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function startOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
}

function diffDays(target: Date, from: Date): number {
    return Math.round(
        (target.getTime() - from.getTime()) / MS_PER_DAY
    );
}

function clampDayToMonth(
    year: number,
    month: number,
    day: number
): Date {
    const daysInMonth = new Date(
        year,
        month + 1,
        0
    ).getDate();

    return new Date(
        year,
        month,
        Math.min(day, daysInMonth)
    );
}

/** Monday = 1 … Sunday = 7 */
function isoWeekday(date: Date): number {
    return ((date.getDay() + 6) % 7) + 1;
}

/**
 * The most recent occurrence on or before `ref`,
 * or the first occurrence strictly after `ref`.
 */
function getOccurrence(
    obligation: Obligation,
    ref: Date,
    direction: "onOrBefore" | "after"
): Date {

    const { recurrenceType, dueDay } = obligation;

    if (recurrenceType === "weekly") {
        const target =
            ((dueDay - 1) % 7 + 7) % 7 + 1;

        const refDay = isoWeekday(ref);

        if (direction === "onOrBefore") {
            const back = (refDay - target + 7) % 7;

            const result = new Date(ref);
            result.setDate(ref.getDate() - back);
            return result;
        }

        let forward = (target - refDay + 7) % 7;

        if (forward === 0) {
            forward = 7;
        }

        const result = new Date(ref);
        result.setDate(ref.getDate() + forward);
        return result;
    }

    if (recurrenceType === "yearly") {
        const month = new Date(
            obligation.createdAt
        ).getMonth();

        const candidate = clampDayToMonth(
            ref.getFullYear(),
            month,
            dueDay
        );

        if (direction === "onOrBefore") {
            return candidate <= ref
                ? candidate
                : clampDayToMonth(
                      ref.getFullYear() - 1,
                      month,
                      dueDay
                  );
        }

        return candidate > ref
            ? candidate
            : clampDayToMonth(
                  ref.getFullYear() + 1,
                  month,
                  dueDay
              );
    }

    // monthly and one_time
    const candidate = clampDayToMonth(
        ref.getFullYear(),
        ref.getMonth(),
        dueDay
    );

    if (direction === "onOrBefore") {
        return candidate <= ref
            ? candidate
            : clampDayToMonth(
                  ref.getFullYear(),
                  ref.getMonth() - 1,
                  dueDay
              );
    }

    return candidate > ref
        ? candidate
        : clampDayToMonth(
              ref.getFullYear(),
              ref.getMonth() + 1,
              dueDay
          );
}

export function getPeriodKey(
    obligation: Obligation,
    occurrence: Date
): string {

    switch (obligation.recurrenceType) {

        case "weekly":
            return `${getISOWeekYear(occurrence)}-W${String(
                getISOWeek(occurrence)
            ).padStart(2, "0")}`;

        case "yearly":
            return String(occurrence.getFullYear());

        case "one_time":
            return "once";

        default:
            // monthly: "2026-07"
            return `${occurrence.getFullYear()}-${String(
                occurrence.getMonth() + 1
            ).padStart(2, "0")}`;
    }
}

/**
 * Determines the effective due date of an obligation,
 * respecting its recurrence type and recorded payments.
 *
 * - If the most recent due date is unpaid, it stays due
 *   (going negative = overdue) instead of silently rolling
 *   over to the next period.
 * - If the current period is paid, the next occurrence is used.
 */
export function getObligationDueInfo(
    obligation: Obligation,
    paidPeriodKeys: Set<string>
): ObligationDueInfo {

    const today = startOfDay(new Date());

    const created = startOfDay(
        new Date(obligation.createdAt)
    );

    const previous = getOccurrence(
        obligation,
        today,
        "onOrBefore"
    );

    const previousKey = getPeriodKey(
        obligation,
        previous
    );

    const previousApplies = previous >= created;

    const previousPaid =
        previousApplies &&
        paidPeriodKeys.has(previousKey);

    const currentPeriodKey = previousApplies
        ? previousKey
        : null;

    if (previousApplies && !previousPaid) {
        return {
            dueDate: previous,
            daysUntilDue: diffDays(previous, today),
            periodKey: previousKey,
            paidForCurrentPeriod: false,
            currentPeriodKey,
        };
    }

    let next = getOccurrence(
        obligation,
        today,
        "after"
    );

    if (
        paidPeriodKeys.has(
            getPeriodKey(obligation, next)
        )
    ) {
        next = getOccurrence(
            obligation,
            next,
            "after"
        );
    }

    return {
        dueDate: next,
        daysUntilDue: diffDays(next, today),
        periodKey: getPeriodKey(obligation, next),
        paidForCurrentPeriod: previousPaid,
        currentPeriodKey,
    };
}
