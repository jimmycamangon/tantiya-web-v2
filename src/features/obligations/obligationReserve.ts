import type { Obligation } from "../../types/obligation";
import type { FundingRule } from "../../types/common";

import { getCurrentCutoff } from "../cutoffs/getCurrentCutoff";
import { roundMoney } from "../../utils/money";

import {
    getObligationDueInfo,
    getOccurrence,
    getPeriodKey,
} from "./obligationSchedule";

/**
 * Cutoff-based reservation ("sinking funds").
 *
 * Every unpaid obligation occurrence is funded by one or two
 * semi-monthly cutoffs, chosen by its funding rule:
 *
 * - current_cutoff:  the cutoff the due date falls in
 * - previous_cutoff: the cutoff right before that one
 * - split_cutoffs:   half from each of those two cutoffs
 *
 * Once the funding cutoff has started, that money is reserved,
 * so Safe to Spend drops the moment an obligation is entered
 * instead of a few days before it is due.
 */

export interface ReservationLine {
    obligation: Obligation;
    dueDate: Date;
    periodKey: string;
    /** Full amount due for this occurrence. */
    amount: number;
    /** Part of `amount` that must already be set aside today. */
    reservedNow: number;
    overdue: boolean;
}

export interface ReserveSummary {
    lines: ReservationLine[];
    /** Total that must be set aside today. */
    reservedNow: number;
    /** Reserved now, per accountId. */
    reservedByAccount: Map<string, number>;
    /**
     * Every unpaid occurrence due by the end of this month, plus
     * anything already reserved for early next month.
     */
    projectedObligations: number;
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function startOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
}

function cutoffBefore(start: Date) {
    return getCurrentCutoff(
        new Date(start.getTime() - MS_PER_DAY)
    );
}

function reservedPortion(
    amount: number,
    rule: FundingRule,
    dueDate: Date,
    currentCutoffStart: Date
): number {

    const dueCutoff = getCurrentCutoff(dueDate);
    const previousCutoff = cutoffBefore(dueCutoff.startDate);

    const started = (cutoffStart: Date) =>
        cutoffStart.getTime() <= currentCutoffStart.getTime();

    switch (rule) {

        case "previous_cutoff":
            return started(previousCutoff.startDate)
                ? amount
                : 0;

        case "split_cutoffs": {
            const firstHalf = roundMoney(amount / 2);
            const secondHalf = roundMoney(amount - firstHalf);

            return roundMoney(
                (started(previousCutoff.startDate) ? firstHalf : 0) +
                (started(dueCutoff.startDate) ? secondHalf : 0)
            );
        }

        default:
            return started(dueCutoff.startDate)
                ? amount
                : 0;
    }
}

/** Unpaid occurrences of one obligation up to `horizonEnd`. */
function unpaidOccurrences(
    obligation: Obligation,
    paidKeys: Set<string>,
    horizonEnd: Date
): { dueDate: Date; periodKey: string }[] {

    if (
        obligation.recurrenceType === "one_time" &&
        paidKeys.has("once")
    ) {
        return [];
    }

    const first = getObligationDueInfo(obligation, paidKeys);
    const result: { dueDate: Date; periodKey: string }[] = [];

    let dueDate = first.dueDate;

    for (
        let guard = 0;
        guard < 20 && dueDate.getTime() <= horizonEnd.getTime();
        guard++
    ) {
        const periodKey = getPeriodKey(obligation, dueDate);

        if (!paidKeys.has(periodKey)) {
            result.push({ dueDate, periodKey });
        }

        if (obligation.recurrenceType === "one_time") {
            break;
        }

        dueDate = startOfDay(
            getOccurrence(obligation, dueDate, "after")
        );
    }

    return result;
}

export function computeReservations(
    obligations: Obligation[],
    paidPeriodKeys: Map<string, Set<string>>,
    now: Date = new Date()
): ReserveSummary {

    const today = startOfDay(now);
    const currentCutoff = getCurrentCutoff(today);

    // previous_cutoff bills due next cutoff are funded by this one,
    // so look one full cutoff ahead.
    const nextCutoff = getCurrentCutoff(
        new Date(currentCutoff.endDate.getTime() + MS_PER_DAY)
    );
    const horizonEnd = startOfDay(nextCutoff.endDate);

    const monthEnd = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        0
    );

    const lines: ReservationLine[] = [];
    const reservedByAccount = new Map<string, number>();
    let reservedNow = 0;
    let projectedObligations = 0;

    for (const obligation of obligations) {

        if (!obligation.active) {
            continue;
        }

        const occurrences = unpaidOccurrences(
            obligation,
            paidPeriodKeys.get(obligation.id) ?? new Set(),
            horizonEnd
        );

        for (const { dueDate, periodKey } of occurrences) {

            const overdue = dueDate.getTime() < today.getTime();

            const reserved = overdue
                ? obligation.amount
                : reservedPortion(
                      obligation.amount,
                      obligation.fundingRule,
                      dueDate,
                      currentCutoff.startDate
                  );

            const inProjection =
                reserved > 0 ||
                dueDate.getTime() <= monthEnd.getTime();

            if (!inProjection) {
                continue;
            }

            lines.push({
                obligation,
                dueDate,
                periodKey,
                amount: obligation.amount,
                reservedNow: reserved,
                overdue,
            });

            reservedNow += reserved;
            projectedObligations += obligation.amount;

            if (reserved > 0) {
                reservedByAccount.set(
                    obligation.accountId,
                    roundMoney(
                        (reservedByAccount.get(obligation.accountId) ?? 0) +
                        reserved
                    )
                );
            }
        }
    }

    lines.sort(
        (a, b) => a.dueDate.getTime() - b.dueDate.getTime()
    );

    return {
        lines,
        reservedNow: roundMoney(reservedNow),
        reservedByAccount,
        projectedObligations: roundMoney(projectedObligations),
    };
}
