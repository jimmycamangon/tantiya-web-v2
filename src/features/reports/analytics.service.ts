import {
    addDays,
    differenceInCalendarDays,
    endOfMonth,
    format,
    getDaysInMonth,
    parseISO,
    startOfMonth,
    subMonths,
} from "date-fns";

import { db } from "../../db/database";
import { roundMoney } from "../../utils/money";

import type { DateRange } from "./report.service";

/*
 * Analytics behind the Reports page: KPIs compared with the previous
 * period, daily spending pace, category changes, weekday pattern,
 * monthly income vs expenses, and plain-language insights.
 */

function dayKey(date: Date): string {
    return format(date, "yyyy-MM-dd");
}

function localKey(iso: string): string {
    return dayKey(new Date(iso));
}

function inRange(iso: string, range: DateRange): boolean {
    const key = localKey(iso);
    return key >= range.start && key <= range.end;
}

/**
 * The period to compare against. A range starting on the 1st within
 * one month compares with the same days of the previous month;
 * anything else compares with the same number of days just before it.
 */
export function previousRange(range: DateRange): DateRange {
    const start = parseISO(range.start);
    const end = parseISO(range.end);

    const sameMonth =
        start.getFullYear() === end.getFullYear() &&
        start.getMonth() === end.getMonth();

    if (start.getDate() === 1 && sameMonth) {
        const prevStart = subMonths(start, 1);
        const lastDay = Math.min(end.getDate(), getDaysInMonth(prevStart));

        return {
            start: dayKey(prevStart),
            end: dayKey(new Date(prevStart.getFullYear(), prevStart.getMonth(), lastDay)),
        };
    }

    const length = differenceInCalendarDays(end, start) + 1;

    return {
        start: dayKey(addDays(start, -length)),
        end: dayKey(addDays(start, -1)),
    };
}

export interface Kpis {
    income: number;
    expense: number;
    net: number;
    /** net / income, null when there was no income. */
    savingsRate: number | null;
    avgDailySpend: number;
    transactions: number;
}

export interface CategoryRow {
    categoryId: string;
    name: string;
    amount: number;
    prevAmount: number;
    count: number;
    share: number;
}

export interface PacePoint {
    day: number;
    /** Date in the current period. */
    date: string;
    /** Cumulative spend; null for days that have not happened yet. */
    current: number | null;
    /** Cumulative spend on the same day number of the previous period. */
    previous: number | null;
    /** Date in the previous period for the same day number. */
    previousDate: string | null;
}

export interface WeekdayRow {
    label: string;
    amount: number;
    count: number;
}

export interface MonthRow {
    month: string;
    income: number;
    expense: number;
}

export type InsightTone = "good" | "warn" | "info";

export interface Insight {
    tone: InsightTone;
    title: string;
    detail: string;
}

export interface ReportAnalytics {
    range: DateRange;
    previous: DateRange;
    kpis: Kpis;
    prevKpis: Kpis;
    categories: CategoryRow[];
    pace: PacePoint[];
    weekdays: WeekdayRow[];
    months: MonthRow[];
    insights: Insight[];
}

const peso = (amount: number) =>
    new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        maximumFractionDigits: amount >= 1000 ? 0 : 2,
    }).format(amount);

const pct = (value: number) => `${Math.round(value * 100)}%`;

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export async function getReportAnalytics(
    range: DateRange,
    now: Date = new Date()
): Promise<ReportAnalytics> {

    const previous = previousRange(range);

    const [expensesAll, incomesAll, categories, budgets, settlements] = await Promise.all([
        db.expenses.filter(e => !e.isDeleted).toArray(),
        db.incomes.filter(i => !i.isDeleted).toArray(),
        db.categories.toArray(),
        db.budgets.toArray(),
        db.budgetSettlements.toArray(),
    ]);

    const categoryName = (id: string) =>
        categories.find(c => c.id === id)?.name ?? "Unknown";

    const expenses = expensesAll.filter(e => inRange(e.date, range));
    const prevExpenses = expensesAll.filter(e => inRange(e.date, previous));
    const incomes = incomesAll.filter(i => inRange(i.date, range));
    const prevIncomes = incomesAll.filter(i => inRange(i.date, previous));

    const todayKey = dayKey(now);
    const rangeStart = parseISO(range.start);
    const rangeEnd = parseISO(range.end);
    const totalDays = differenceInCalendarDays(rangeEnd, rangeStart) + 1;

    // Days of the range that have happened (the whole range if it is past).
    const elapsedDays = todayKey >= range.end
        ? totalDays
        : todayKey < range.start
            ? 0
            : differenceInCalendarDays(now, rangeStart) + 1;

    const prevDays =
        differenceInCalendarDays(parseISO(previous.end), parseISO(previous.start)) + 1;

    const kpisFor = (
        exp: typeof expenses,
        inc: typeof incomes,
        days: number
    ): Kpis => {
        const income = roundMoney(inc.reduce((s, i) => s + i.amount, 0));
        const expense = roundMoney(exp.reduce((s, e) => s + e.amount, 0));
        const net = roundMoney(income - expense);

        return {
            income,
            expense,
            net,
            savingsRate: income > 0 ? net / income : null,
            avgDailySpend: days > 0 ? roundMoney(expense / days) : 0,
            transactions: exp.length,
        };
    };

    const kpis = kpisFor(expenses, incomes, elapsedDays);
    const prevKpis = kpisFor(prevExpenses, prevIncomes, prevDays);

    // Categories, current vs previous.
    const byCategory = new Map<string, { amount: number; prevAmount: number; count: number }>();

    for (const e of expenses) {
        const row = byCategory.get(e.categoryId) ?? { amount: 0, prevAmount: 0, count: 0 };
        row.amount += e.amount;
        row.count += 1;
        byCategory.set(e.categoryId, row);
    }

    for (const e of prevExpenses) {
        const row = byCategory.get(e.categoryId) ?? { amount: 0, prevAmount: 0, count: 0 };
        row.prevAmount += e.amount;
        byCategory.set(e.categoryId, row);
    }

    const categoryRows: CategoryRow[] = [...byCategory.entries()]
        .map(([categoryId, row]) => ({
            categoryId,
            name: categoryName(categoryId),
            amount: roundMoney(row.amount),
            prevAmount: roundMoney(row.prevAmount),
            count: row.count,
            share: kpis.expense > 0 ? row.amount / kpis.expense : 0,
        }))
        .sort((a, b) => b.amount - a.amount || b.prevAmount - a.prevAmount);

    // Daily pace: cumulative spend by day number.
    const dailyTotals = (list: typeof expenses, start: string) => {
        const totals = new Map<number, number>();
        const startDate = parseISO(start);

        for (const e of list) {
            const day = differenceInCalendarDays(new Date(e.date), startDate);
            totals.set(day, (totals.get(day) ?? 0) + e.amount);
        }

        return totals;
    };

    const currentDaily = dailyTotals(expenses, range.start);
    const prevDaily = dailyTotals(prevExpenses, previous.start);

    const pace: PacePoint[] = [];
    let runningCurrent = 0;
    let runningPrev = 0;

    for (let day = 0; day < totalDays; day++) {
        runningCurrent += currentDaily.get(day) ?? 0;
        runningPrev += prevDaily.get(day) ?? 0;

        pace.push({
            day: day + 1,
            date: dayKey(addDays(rangeStart, day)),
            current: day < elapsedDays ? roundMoney(runningCurrent) : null,
            previous: day < prevDays ? roundMoney(runningPrev) : null,
            previousDate: day < prevDays
                ? dayKey(addDays(parseISO(previous.start), day))
                : null,
        });
    }

    // Weekday pattern, Monday first.
    const weekdayTotals = Array.from({ length: 7 }, () => ({ amount: 0, count: 0 }));

    for (const e of expenses) {
        const row = weekdayTotals[new Date(e.date).getDay()];
        row.amount += e.amount;
        row.count += 1;
    }

    const weekdays: WeekdayRow[] = [1, 2, 3, 4, 5, 6, 0].map(index => ({
        label: WEEKDAYS[index].slice(0, 3),
        amount: roundMoney(weekdayTotals[index].amount),
        count: weekdayTotals[index].count,
    }));

    // Last 6 months ending with the range's last month.
    const months: MonthRow[] = [];

    for (let back = 5; back >= 0; back--) {
        const monthStart = startOfMonth(subMonths(rangeEnd, back));
        const monthRange = {
            start: dayKey(monthStart),
            end: dayKey(endOfMonth(monthStart)),
        };

        months.push({
            month: format(monthStart, "yyyy-MM"),
            income: roundMoney(
                incomesAll.filter(i => inRange(i.date, monthRange)).reduce((s, i) => s + i.amount, 0)
            ),
            expense: roundMoney(
                expensesAll.filter(e => inRange(e.date, monthRange)).reduce((s, e) => s + e.amount, 0)
            ),
        });
    }

    // Plain-language insights, most useful first.
    const insights: Insight[] = [];
    const prevLabel = `${format(parseISO(previous.start), "MMM d")}–${format(parseISO(previous.end), "MMM d")}`;

    if (kpis.expense > 0 || prevKpis.expense > 0) {
        if (prevKpis.expense > 0) {
            const change = (kpis.expense - prevKpis.expense) / prevKpis.expense;

            if (Math.abs(change) >= 0.1) {
                insights.push({
                    tone: change > 0 ? "warn" : "good",
                    title: change > 0
                        ? `Spending is up ${pct(change)}`
                        : `Spending is down ${pct(-change)}`,
                    detail: `${peso(kpis.expense)} this period vs ${peso(prevKpis.expense)} in ${prevLabel}.`,
                });
            } else {
                insights.push({
                    tone: "info",
                    title: "Spending is steady",
                    detail: `${peso(kpis.expense)} this period, close to ${peso(prevKpis.expense)} in ${prevLabel}.`,
                });
            }
        }
    }

    // Projection while the period is still running. A month-to-date
    // range ("This month") projects to the end of the month.
    const monthToDate =
        range.end === todayKey &&
        rangeStart.getDate() === 1 &&
        rangeStart.getMonth() === rangeEnd.getMonth() &&
        rangeStart.getFullYear() === rangeEnd.getFullYear();

    const projectionEnd = monthToDate ? endOfMonth(rangeStart) : rangeEnd;
    const projectionDays = differenceInCalendarDays(projectionEnd, rangeStart) + 1;

    if (elapsedDays >= 3 && elapsedDays < projectionDays && kpis.expense > 0) {
        const projected = roundMoney((kpis.expense / elapsedDays) * projectionDays);

        // Compare with the previous period scaled to the same length.
        const prevFull = monthToDate
            ? roundMoney(
                expensesAll
                    .filter(e => inRange(e.date, {
                        start: dayKey(subMonths(rangeStart, 1)),
                        end: dayKey(endOfMonth(subMonths(rangeStart, 1))),
                    }))
                    .reduce((s, e) => s + e.amount, 0)
            )
            : prevKpis.expense;

        const comparePrev = prevFull > 0
            ? ` That is ${projected > prevFull ? "more" : "less"} than ${peso(prevFull)} ${monthToDate ? "last month" : "last period"}.`
            : "";

        insights.push({
            tone: prevFull > 0 && projected > prevFull * 1.1 ? "warn" : "info",
            title: `On pace for about ${peso(projected)}`,
            detail: `At ${peso(kpis.avgDailySpend)} a day, spending would reach ${peso(projected)} by ${format(projectionEnd, "MMM d")}.${comparePrev}`,
        });
    }

    // Category movers (meaningful amounts only).
    const movers = categoryRows
        .map(row => ({ ...row, delta: row.amount - row.prevAmount }))
        .filter(row => Math.abs(row.delta) >= 200);

    const riser = [...movers].sort((a, b) => b.delta - a.delta)[0];
    const faller = [...movers].sort((a, b) => a.delta - b.delta)[0];

    if (riser && riser.delta > 0) {
        insights.push({
            tone: "warn",
            title: riser.prevAmount > 0
                ? `${riser.name} is up ${peso(riser.delta)}`
                : `New spending on ${riser.name}`,
            detail: riser.prevAmount > 0
                ? `${peso(riser.amount)} vs ${peso(riser.prevAmount)} last period (+${pct(riser.delta / riser.prevAmount)}).`
                : `${peso(riser.amount)} this period; nothing last period.`,
        });
    }

    if (faller && faller.delta < 0) {
        insights.push({
            tone: "good",
            title: `${faller.name} is down ${peso(-faller.delta)}`,
            detail: `${peso(faller.amount)} vs ${peso(faller.prevAmount)} last period.`,
        });
    }

    if (kpis.savingsRate !== null) {
        insights.push(
            kpis.net < 0
                ? {
                    tone: "warn",
                    title: `Spent ${peso(-kpis.net)} more than you earned`,
                    detail: `Income ${peso(kpis.income)}, expenses ${peso(kpis.expense)}.`,
                }
                : {
                    tone: kpis.savingsRate >= 0.2 ? "good" : "info",
                    title: `You kept ${pct(kpis.savingsRate)} of your income`,
                    detail: `${peso(kpis.net)} left from ${peso(kpis.income)} earned.${kpis.savingsRate < 0.2 ? " Aim for 20% or more." : ""}`,
                }
        );
    }

    // Busiest weekday, once there is enough data to mean something.
    if (expenses.length >= 5 && elapsedDays >= 7) {
        const top = [...weekdays].sort((a, b) => b.amount - a.amount)[0];
        const full = WEEKDAYS.find(w => w.startsWith(top.label)) ?? top.label;

        if (top.amount > 0 && kpis.expense > 0 && top.amount / kpis.expense >= 0.25) {
            insights.push({
                tone: "info",
                title: `${full}s are your biggest spending day`,
                detail: `${peso(top.amount)} (${pct(top.amount / kpis.expense)} of spending) across ${top.count} expenses.`,
            });
        }
    }

    const largest = [...expenses].sort((a, b) => b.amount - a.amount)[0];

    if (largest && expenses.length >= 3) {
        insights.push({
            tone: "info",
            title: `Biggest expense: ${peso(largest.amount)}`,
            detail: `${categoryName(largest.categoryId)}${largest.notes ? ` · ${largest.notes}` : ""} on ${format(new Date(largest.date), "MMM d")}.`,
        });
    }

    // Budget results for periods that ended inside the range.
    const closed = settlements.filter(s => inRange(s.windowEnd, range));

    if (closed.length > 0) {
        const under = closed.filter(s => s.spent <= s.budgetAmount).length;
        const saved = roundMoney(
            closed.filter(s => s.action === "savings" && s.transferId).reduce((sum, s) => sum + s.leftover, 0)
        );

        insights.push({
            tone: under === closed.length ? "good" : "warn",
            title: `Stayed within budget ${under} of ${closed.length} times`,
            detail: saved > 0
                ? `${peso(saved)} of leftovers moved to savings.`
                : "No leftovers were moved to savings.",
        });
    }

    // Budgets that keep having leftovers: suggest a smaller amount.
    for (const budget of budgets.filter(b => b.active)) {
        const recent = settlements
            .filter(s => s.budgetId === budget.id)
            .sort((a, b) => b.windowStart.localeCompare(a.windowStart))
            .slice(0, 3);

        if (recent.length === 3 && recent.every(s => s.leftover > 0)) {
            const avgLeft = roundMoney(recent.reduce((s, r) => s + r.leftover, 0) / 3);
            const avgSpent = roundMoney(recent.reduce((s, r) => s + r.spent, 0) / 3);

            insights.push({
                tone: "info",
                title: `${categoryName(budget.categoryId)} budget is more than you use`,
                detail: `Leftovers 3 periods in a row (about ${peso(avgLeft)} each). You spend about ${peso(avgSpent)}; consider lowering the budget.`,
            });
        }
    }

    return {
        range,
        previous,
        kpis,
        prevKpis,
        categories: categoryRows,
        pace,
        weekdays,
        months,
        insights,
    };
}
