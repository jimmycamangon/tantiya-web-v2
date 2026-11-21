import { Receipt } from "lucide-react";
import { Link } from "react-router-dom";

import { useLiveQuery } from "dexie-react-hooks";

import { db } from "../../db/database";
import { useBudgetSnapshot }
    from "../budget/budgetSnapshot";

interface ReservedItem {
    key: string;
    name: string;
    note: string;
    warn: boolean;
    amount: number;
}

function formatCurrency(
    amount: number
) {
    return new Intl.NumberFormat(
        "en-PH",
        {
            style: "currency",
            currency: "PHP"
        }
    ).format(
        amount
    );
}

function formatDue(date: Date) {
    return date.toLocaleDateString(
        "en-PH",
        { month: "short", day: "numeric" }
    );
}

export default function DashboardSummary() {

    const snapshot =
        useBudgetSnapshot();

    const actualBalance =
        snapshot?.actualBalance ?? 0;

    const reservedAmount =
        snapshot?.reservedNow ?? 0;

    const safeToSpend =
        snapshot?.safeToSpend ?? 0;

    const afterBills =
        snapshot?.afterBillsThisMonth ?? 0;

    const categories =
        useLiveQuery(() => db.categories.toArray(), []);

    const categoryName = (id: string) =>
        categories?.find(category => category.id === id)?.name ?? "Budget";

    const reservedLines: ReservedItem[] = [
        ...(snapshot?.lines ?? [])
            .filter(line => line.reservedNow > 0)
            .map(line => ({
                key: `bill-${line.obligation.id}-${line.periodKey}`,
                name: line.obligation.name,
                note: line.overdue
                    ? "overdue"
                    : `due ${formatDue(line.dueDate)}`,
                warn: line.overdue,
                amount: line.reservedNow,
            })),
        ...(snapshot?.budgetLines ?? [])
            .filter(line => line.activeNow)
            .map(line => ({
                key: `budget-${line.budget.id}`,
                name: `${categoryName(line.budget.categoryId)} budget`,
                note: line.remaining < 0
                    ? `over by ${formatCurrency(-line.remaining)}`
                    : "left",
                warn: line.remaining < 0,
                amount: line.reservedNow,
            })),
    ];

    return (
        <div className="grid gap-4 md:grid-cols-3">

            <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
                <p className="text-sm font-medium text-stone-500">
                    Actual Balance
                </p>

                <p className="mt-3 text-2xl font-semibold text-stone-950">
                    {formatCurrency(actualBalance)}
                </p>

                <p className="mt-1 text-xs text-stone-500">
                    All active accounts combined.
                </p>
            </section>

            <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-stone-500">
                        Reserved for Bills & Budgets
                    </p>

                    <Link
                        to="/obligations"
                        className="text-xs font-medium text-amber-700 hover:text-amber-800"
                    >
                        View bills
                    </Link>
                </div>

                <p className="mt-3 text-2xl font-semibold text-amber-700">
                    {formatCurrency(reservedAmount)}
                </p>

                {reservedLines.length === 0 ? (
                    <p className="mt-1 text-xs text-stone-500">
                        Nothing to set aside this cutoff.
                    </p>
                ) : (
                    <ul className="mt-2 grid gap-1 text-xs text-stone-600">
                        {reservedLines.slice(0, 4).map(line => (
                            <li
                                key={line.key}
                                className="flex justify-between gap-2"
                            >
                                <span className="truncate">
                                    {line.name}
                                    <span className={line.warn
                                        ? "text-red-600"
                                        : "text-stone-400"}
                                    >
                                        {" · "}
                                        {line.note}
                                    </span>
                                </span>

                                <span className="shrink-0 font-medium">
                                    {formatCurrency(line.amount)}
                                </span>
                            </li>
                        ))}

                        {reservedLines.length > 4 && (
                            <li className="text-stone-400">
                                +{reservedLines.length - 4} more
                            </li>
                        )}
                    </ul>
                )}
            </section>

            <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-stone-500">
                        Safe To Spend
                    </p>

                    <Link
                        to="/expenses"
                        className="inline-flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700"
                    >
                        <Receipt className="h-4 w-4" />
                        Add Expense
                    </Link>
                </div>

                <p className={`mt-3 text-2xl font-semibold ${safeToSpend >= 0
                    ? "text-emerald-700"
                    : "text-red-700"}`}
                >
                    {formatCurrency(safeToSpend)}
                </p>

                <p className="mt-1 text-xs text-stone-500">
                    After all bills & budgets this month:{" "}
                    <span className={`font-semibold ${afterBills >= 0
                        ? "text-stone-700"
                        : "text-red-600"}`}
                    >
                        {formatCurrency(afterBills)}
                    </span>
                </p>
            </section>

        </div>
    );
}
