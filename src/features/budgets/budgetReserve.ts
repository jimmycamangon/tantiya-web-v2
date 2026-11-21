import type { Budget, BudgetSettlement } from "../../types/budget";
import type { Expense } from "../../types/expense";

import { getCurrentCutoff } from "../cutoffs/getCurrentCutoff";
import { roundMoney } from "../../utils/money";

/**
 * Spending budgets ("envelopes") for variable costs with no due date.
 *
 * While a budget's window is open, whatever is left of it stays
 * reserved. Expenses in the budget's category draw it down, so
 * spending from the envelope does not lower Safe to Spend again.
 * When a window ends, its leftover is settled (saved, rolled over,
 * or released) — see getPendingSettlements.
 */

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function startOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
}

function addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

export interface BudgetWindow {
    /** Cutoff id ("2026-11-1") or month ("2026-11"). */
    key: string;
    start: Date;
    /** Last day of the window (inclusive). */
    end: Date;
    /** Budget for this window before any rollover. */
    baseAmount: number;
}

/** The budget's window containing `date`, or null if it is paused then. */
export function windowFor(budget: Budget, date: Date): BudgetWindow | null {

    const day = startOfDay(date);
    const cutoff = getCurrentCutoff(day);
    const inFirstCutoff = day.getDate() <= 15;

    const firstHalf = roundMoney(budget.amount / 2);
    const secondHalf = roundMoney(budget.amount - firstHalf);

    const cutoffWindow = (baseAmount: number): BudgetWindow => ({
        key: cutoff.id,
        start: cutoff.startDate,
        end: cutoff.endDate,
        baseAmount,
    });

    switch (budget.period) {

        case "each_cutoff":
            return cutoffWindow(inFirstCutoff ? firstHalf : secondHalf);

        case "first_cutoff":
            return inFirstCutoff ? cutoffWindow(budget.amount) : null;

        case "second_cutoff":
            return inFirstCutoff ? null : cutoffWindow(budget.amount);

        default:
            return {
                key: `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}`,
                start: new Date(day.getFullYear(), day.getMonth(), 1),
                end: new Date(day.getFullYear(), day.getMonth() + 1, 0),
                baseAmount: budget.amount,
            };
    }
}

/** The most recent window that ended before `now`. */
export function previousWindow(budget: Budget, now: Date): BudgetWindow | null {

    const current = windowFor(budget, now);

    let day = current
        ? addDays(current.start, -1)
        : addDays(startOfDay(now), -1);

    for (let guard = 0; guard < 40; guard++) {
        const window = windowFor(budget, day);

        if (window) {
            return window;
        }

        day = addDays(day, -1);
    }

    return null;
}

/** The first window that starts after `window` ends. */
export function nextWindow(budget: Budget, window: BudgetWindow): BudgetWindow | null {

    let day = addDays(window.end, 1);

    for (let guard = 0; guard < 40; guard++) {
        const next = windowFor(budget, day);

        if (next) {
            return next;
        }

        day = addDays(day, 1);
    }

    return null;
}

/** Earliest expense date needed: the start of last month. */
export function budgetLookbackStart(now: Date = new Date()): Date {
    return new Date(now.getFullYear(), now.getMonth() - 1, 1);
}

function spentInWindow(
    budget: Budget,
    expenses: Expense[],
    window: BudgetWindow
): number {
    const from = window.start.getTime();
    const until = window.end.getTime() + MS_PER_DAY;

    return roundMoney(
        expenses
            .filter(expense => {
                if (expense.isDeleted || expense.categoryId !== budget.categoryId) {
                    return false;
                }

                const time = new Date(expense.date).getTime();
                return time >= from && time < until;
            })
            .reduce((sum, expense) => sum + expense.amount, 0)
    );
}

/** budgetId|windowKey -> amount rolled into that window. */
export function rolloverMap(
    settlements: BudgetSettlement[]
): Map<string, number> {

    const map = new Map<string, number>();

    for (const settlement of settlements) {
        if (
            settlement.action === "rollover" &&
            settlement.rolloverToKey &&
            settlement.rolledOver
        ) {
            const key = `${settlement.budgetId}|${settlement.rolloverToKey}`;
            map.set(key, roundMoney((map.get(key) ?? 0) + settlement.rolledOver));
        }
    }

    return map;
}

export interface BudgetLine {
    budget: Budget;
    /** True when today falls inside one of the budget's windows. */
    activeNow: boolean;
    windowKey: string | null;
    windowStart: Date | null;
    /** Last day of the current window (inclusive). */
    windowEnd: Date | null;
    /** Budget for the current window, including rollover. */
    windowAmount: number;
    /** Part of windowAmount carried over from the last window. */
    rolledIn: number;
    spent: number;
    /** windowAmount - spent; negative when over budget. */
    remaining: number;
    /** max(remaining, 0) while active. */
    reservedNow: number;
    /** Budget for a window later this month that has not started. */
    upcomingThisMonth: number;
}

export interface BudgetReserveSummary {
    lines: BudgetLine[];
    reservedNow: number;
    reservedByAccount: Map<string, number>;
    /** Still to be spent this month: reserved now plus later windows. */
    projectedThisMonth: number;
}

export function computeBudgetReservations(
    budgets: Budget[],
    expenses: Expense[],
    now: Date = new Date(),
    settlements: BudgetSettlement[] = []
): BudgetReserveSummary {

    const today = startOfDay(now);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const rolledInto = rolloverMap(settlements);

    const lines: BudgetLine[] = [];
    const reservedByAccount = new Map<string, number>();
    let reservedNow = 0;
    let projectedThisMonth = 0;

    for (const budget of budgets) {

        if (!budget.active) {
            continue;
        }

        const window = windowFor(budget, today);

        // A later window this month that has not started yet.
        let upcoming = 0;
        const after = nextWindow(
            budget,
            window ?? {
                key: "",
                start: today,
                end: addDays(today, -1),
                baseAmount: 0,
            }
        );

        if (after && after.start.getTime() <= monthEnd.getTime()) {
            upcoming = after.baseAmount;
        }

        const rolledIn = window
            ? rolledInto.get(`${budget.id}|${window.key}`) ?? 0
            : 0;

        const windowAmount = window
            ? roundMoney(window.baseAmount + rolledIn)
            : 0;

        const spent = window
            ? spentInWindow(budget, expenses, window)
            : 0;

        const remaining = window
            ? roundMoney(windowAmount - spent)
            : 0;

        const reserved = Math.max(remaining, 0);

        lines.push({
            budget,
            activeNow: window !== null,
            windowKey: window?.key ?? null,
            windowStart: window?.start ?? null,
            windowEnd: window?.end ?? null,
            windowAmount,
            rolledIn,
            spent,
            remaining,
            reservedNow: reserved,
            upcomingThisMonth: upcoming,
        });

        reservedNow += reserved;
        projectedThisMonth += reserved + upcoming;

        if (reserved > 0) {
            reservedByAccount.set(
                budget.accountId,
                roundMoney(
                    (reservedByAccount.get(budget.accountId) ?? 0) + reserved
                )
            );
        }
    }

    return {
        lines,
        reservedNow: roundMoney(reservedNow),
        reservedByAccount,
        projectedThisMonth: roundMoney(projectedThisMonth),
    };
}

export interface PendingSettlement {
    budget: Budget;
    window: BudgetWindow;
    /** Window budget including rollover. */
    budgetAmount: number;
    spent: number;
    leftover: number;
    /** Where a rollover would go. */
    nextWindowKey: string | null;
    /** Most a rollover may carry: one window's base budget. */
    rolloverCap: number;
}

/**
 * The last finished window of each budget that has not been settled
 * yet. Older unsettled windows are skipped on purpose: only the most
 * recent one is offered, so the list never piles up.
 */
export function getPendingSettlements(
    budgets: Budget[],
    expenses: Expense[],
    settlements: BudgetSettlement[],
    now: Date = new Date()
): PendingSettlement[] {

    const settled = new Set(
        settlements.map(s => `${s.budgetId}|${s.windowKey}`)
    );
    const rolledInto = rolloverMap(settlements);

    const result: PendingSettlement[] = [];

    for (const budget of budgets) {

        if (!budget.active) {
            continue;
        }

        const window = previousWindow(budget, now);

        if (!window) {
            continue;
        }

        // The budget did not exist during that window.
        if (window.end.getTime() < startOfDay(new Date(budget.createdAt)).getTime()) {
            continue;
        }

        if (settled.has(`${budget.id}|${window.key}`)) {
            continue;
        }

        const budgetAmount = roundMoney(
            window.baseAmount +
            (rolledInto.get(`${budget.id}|${window.key}`) ?? 0)
        );

        const spent = spentInWindow(budget, expenses, window);
        const next = nextWindow(budget, window);

        result.push({
            budget,
            window,
            budgetAmount,
            spent,
            leftover: Math.max(roundMoney(budgetAmount - spent), 0),
            nextWindowKey: next?.key ?? null,
            rolloverCap: next?.baseAmount ?? 0,
        });
    }

    return result;
}
