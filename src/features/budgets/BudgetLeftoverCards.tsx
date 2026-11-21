import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { PiggyBank } from "lucide-react";

import { db } from "../../db/database";
import { useToast } from "../../components/AppFeedback";
import type { LeftoverAction } from "../../types/budget";

import { useBudgetSnapshot } from "../budget/budgetSnapshot";
import { getAccounts } from "../accounts/account.service";
import type { PendingSettlement } from "./budgetReserve";
import { settleBudgetWindow } from "./budget.service";

function formatCurrency(amount: number) {
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
    }).format(amount);
}

function formatRange(start: Date, end: Date) {
    const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
    return `${start.toLocaleDateString("en-PH", options)}–${end.toLocaleDateString("en-PH", options)}`;
}

const ACTION_LABELS: Record<LeftoverAction, string> = {
    savings: "Move to savings",
    rollover: "Roll over",
    release: "Release",
};

function LeftoverCard({
    pending,
    categoryName,
}: {
    pending: PendingSettlement;
    categoryName: string;
}) {
    const toast = useToast();
    const accounts = useLiveQuery(() => getAccounts(), []) ?? [];

    const { budget, leftover } = pending;
    const defaultAction: LeftoverAction = budget.leftoverAction ?? "savings";

    const [savingsAccountId, setSavingsAccountId] =
        useState(budget.savingsAccountId ?? "");
    const [busy, setBusy] = useState(false);

    const savingsOptions = accounts.filter(account => account.id !== budget.accountId);
    const over = pending.spent - pending.budgetAmount;

    // Default first, then the others.
    const actions: LeftoverAction[] = [
        defaultAction,
        ...(["savings", "rollover", "release"] as LeftoverAction[])
            .filter(action => action !== defaultAction),
    ];

    async function settle(action: LeftoverAction) {
        setBusy(true);

        try {
            await settleBudgetWindow(pending, action, categoryName, savingsAccountId);

            const savingsName = accounts.find(a => a.id === savingsAccountId)?.name;

            toast({
                type: "success",
                message: leftover <= 0
                    ? `${categoryName} budget closed.`
                    : action === "savings"
                        ? `${formatCurrency(leftover)} moved to ${savingsName ?? "savings"}.`
                        : action === "rollover"
                            ? `${formatCurrency(Math.min(leftover, pending.rolloverCap))} added to your next ${categoryName} budget.`
                            : `${formatCurrency(leftover)} released to Safe to Spend.`,
            });
        } catch (error) {
            toast({
                type: "error",
                message: error instanceof Error
                    ? error.message
                    : "Unable to settle budget.",
            });
        } finally {
            setBusy(false);
        }
    }

    return (
        <section
            data-testid="leftover-card"
            className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 shadow-sm"
        >
            <div className="flex items-start gap-3">
                <PiggyBank className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />

                <div className="grid flex-1 gap-2">
                    <div>
                        <p className="font-semibold text-stone-950">
                            {categoryName} budget, {formatRange(pending.window.start, pending.window.end)}
                        </p>

                        <p className="text-sm text-stone-600">
                            Spent {formatCurrency(pending.spent)} of {formatCurrency(pending.budgetAmount)}
                            {" · "}
                            {leftover > 0 ? (
                                <span className="font-semibold text-emerald-700">
                                    {formatCurrency(leftover)} left
                                </span>
                            ) : over > 0 ? (
                                <span className="font-semibold text-red-600">
                                    Over by {formatCurrency(over)}
                                </span>
                            ) : (
                                <span className="font-semibold text-stone-700">
                                    Used exactly
                                </span>
                            )}
                        </p>
                    </div>

                    {leftover > 0 ? (
                        <div className="flex flex-wrap items-center gap-2">
                            <select
                                aria-label="Savings account"
                                value={savingsAccountId}
                                onChange={e => setSavingsAccountId(e.target.value)}
                                className="h-9 rounded-md border border-stone-300 bg-white px-2 text-sm"
                            >
                                <option value="">Savings account…</option>
                                {savingsOptions.map(account => (
                                    <option key={account.id} value={account.id}>
                                        {account.name}
                                    </option>
                                ))}
                            </select>

                            {actions.map((action, index) => (
                                <button
                                    key={action}
                                    type="button"
                                    disabled={busy}
                                    onClick={() => settle(action)}
                                    className={index === 0
                                        ? "h-9 rounded-md bg-emerald-700 px-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-60"
                                        : "h-9 rounded-md border border-stone-300 bg-white px-3 text-sm font-medium text-stone-700 transition hover:bg-stone-50 disabled:opacity-60"}
                                >
                                    {ACTION_LABELS[action]}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div>
                            <button
                                type="button"
                                disabled={busy}
                                onClick={() => settle("release")}
                                className="h-9 rounded-md border border-stone-300 bg-white px-3 text-sm font-medium text-stone-700 transition hover:bg-stone-50 disabled:opacity-60"
                            >
                                Got it
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

/** One card per finished budget window waiting for a leftover decision. */
export default function BudgetLeftoverCards() {

    const snapshot = useBudgetSnapshot();
    const categories = useLiveQuery(() => db.categories.toArray(), []) ?? [];

    const pending = snapshot?.pendingSettlements ?? [];

    if (pending.length === 0) {
        return null;
    }

    return (
        <div className="grid gap-3">
            {pending.map(item => (
                <LeftoverCard
                    key={`${item.budget.id}-${item.window.key}`}
                    pending={item}
                    categoryName={
                        categories.find(c => c.id === item.budget.categoryId)?.name ?? "Budget"
                    }
                />
            ))}
        </div>
    );
}
