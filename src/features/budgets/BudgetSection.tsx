import { useState } from "react";
import type { FormEvent } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";

import { db } from "../../db/database";
import {
    useConfirmDialog,
    useToast,
} from "../../components/AppFeedback";
import type { BudgetPeriod, LeftoverAction } from "../../types/budget";

import { getAccounts } from "../accounts/account.service";
import { getCategories } from "../categories/category.service";
import { useBudgetSnapshot } from "../budget/budgetSnapshot";
import {
    createBudget,
    deleteBudget,
    updateBudget,
} from "./budget.service";

const PERIOD_LABELS: Record<BudgetPeriod, string> = {
    first_cutoff: "1st cutoff only (1–15)",
    second_cutoff: "2nd cutoff only (16–end)",
    each_cutoff: "Every cutoff (half each)",
    monthly: "Whole month",
};

const PERIOD_ORDER: BudgetPeriod[] = [
    "first_cutoff",
    "second_cutoff",
    "each_cutoff",
    "monthly",
];

const LEFTOVER_LABELS: Record<LeftoverAction, string> = {
    savings: "Move to savings",
    rollover: "Roll over to next period",
    release: "Release to Safe to Spend",
};

const LEFTOVER_ORDER: LeftoverAction[] = ["savings", "rollover", "release"];

const inputClass =
    "h-10 rounded-md border border-stone-300 bg-white px-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100";

function formatCurrency(amount: number) {
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
    }).format(amount);
}

function inactiveNote(period: BudgetPeriod) {
    return period === "first_cutoff"
        ? "Paused until the 1st of next month."
        : "Starts on the 16th.";
}

export default function BudgetSection() {

    const toast = useToast();
    const confirm = useConfirmDialog();
    const snapshot = useBudgetSnapshot();

    const accounts = useLiveQuery(() => getAccounts(), []) ?? [];
    const categories = useLiveQuery(() => getCategories(), []) ?? [];
    const allCategories = useLiveQuery(() => db.categories.toArray(), []) ?? [];

    const [categoryId, setCategoryId] = useState("");
    const [accountId, setAccountId] = useState("");
    const [amount, setAmount] = useState("");
    const [period, setPeriod] = useState<BudgetPeriod>("first_cutoff");
    const [leftoverAction, setLeftoverAction] = useState<LeftoverAction>("savings");
    const [savingsAccountId, setSavingsAccountId] = useState("");

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editAmount, setEditAmount] = useState("");
    const [editAccountId, setEditAccountId] = useState("");
    const [editPeriod, setEditPeriod] = useState<BudgetPeriod>("monthly");
    const [editLeftover, setEditLeftover] = useState<LeftoverAction>("savings");
    const [editSavingsId, setEditSavingsId] = useState("");

    const lines = snapshot?.budgetLines ?? [];
    const settlements = snapshot?.settlements ?? [];

    const totalSaved = settlements
        .filter(s => s.action === "savings" && s.transferId)
        .reduce((sum, s) => sum + s.leftover, 0);

    const historyFor = (budgetId: string) =>
        settlements
            .filter(s => s.budgetId === budgetId)
            .sort((a, b) => b.windowStart.localeCompare(a.windowStart))
            .slice(0, 3);

    const categoryName = (id: string) =>
        allCategories.find(category => category.id === id)?.name ?? "Unknown";

    const accountName = (id: string) =>
        accounts.find(account => account.id === id)?.name ?? "Unknown account";

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();

        try {
            await createBudget(categoryId, accountId, Number(amount), period, {
                leftoverAction,
                savingsAccountId,
            });

            toast({ type: "success", message: "Budget added." });

            setCategoryId("");
            setAmount("");
        } catch (error) {
            toast({
                type: "error",
                message: error instanceof Error
                    ? error.message
                    : "Unable to save budget.",
            });
        }
    }

    async function handleSaveEdit(budgetId: string) {
        try {
            await updateBudget(budgetId, {
                amount: Number(editAmount),
                accountId: editAccountId,
                period: editPeriod,
                leftoverAction: editLeftover,
                savingsAccountId: editSavingsId,
            });

            toast({ type: "success", message: "Budget updated." });
            setEditingId(null);
        } catch (error) {
            toast({
                type: "error",
                message: error instanceof Error
                    ? error.message
                    : "Unable to update budget.",
            });
        }
    }

    return (
        <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm sm:p-5">

            <div className="mb-4">
                <h2 className="text-base font-semibold text-stone-950">
                    Spending Budgets
                </h2>

                <p className="text-sm text-stone-500">
                    For costs with no fixed due date, like gas or groceries.
                    Money is set aside while the budget is active, and expenses
                    in its category use it up.
                </p>

                {totalSaved > 0 && (
                    <p
                        data-testid="budget-total-saved"
                        className="mt-2 inline-flex rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-800"
                    >
                        Saved from budget leftovers: {formatCurrency(totalSaved)}
                    </p>
                )}
            </div>

            <form
                onSubmit={handleSubmit}
                className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
            >
                <label className="grid gap-1">
                    <span className="text-xs font-medium text-stone-500">
                        Category
                    </span>

                    <select
                        value={categoryId}
                        onChange={e => setCategoryId(e.target.value)}
                        className={inputClass}
                    >
                        <option value="">Select Category</option>
                        {categories.map(category => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="grid gap-1">
                    <span className="text-xs font-medium text-stone-500">
                        Set aside in
                    </span>

                    <select
                        value={accountId}
                        onChange={e => setAccountId(e.target.value)}
                        className={inputClass}
                    >
                        <option value="">Select Account</option>
                        {accounts.map(account => (
                            <option key={account.id} value={account.id}>
                                {account.name}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="grid gap-1">
                    <span className="text-xs font-medium text-stone-500">
                        Monthly amount
                    </span>

                    <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        className={inputClass}
                    />
                </label>

                <label className="grid gap-1">
                    <span className="text-xs font-medium text-stone-500">
                        When you spend it
                    </span>

                    <select
                        value={period}
                        onChange={e => setPeriod(e.target.value as BudgetPeriod)}
                        className={inputClass}
                    >
                        {PERIOD_ORDER.map(value => (
                            <option key={value} value={value}>
                                {PERIOD_LABELS[value]}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="grid gap-1 lg:col-span-2">
                    <span className="text-xs font-medium text-stone-500">
                        Leftover at the end of the period
                    </span>

                    <select
                        value={leftoverAction}
                        onChange={e => setLeftoverAction(e.target.value as LeftoverAction)}
                        className={inputClass}
                    >
                        {LEFTOVER_ORDER.map(value => (
                            <option key={value} value={value}>
                                {LEFTOVER_LABELS[value]}
                            </option>
                        ))}
                    </select>
                </label>

                {leftoverAction === "savings" && (
                    <label className="grid gap-1 lg:col-span-2">
                        <span className="text-xs font-medium text-stone-500">
                            Savings account
                        </span>

                        <select
                            value={savingsAccountId}
                            onChange={e => setSavingsAccountId(e.target.value)}
                            className={inputClass}
                        >
                            <option value="">Select Account</option>
                            {accounts
                                .filter(account => account.id !== accountId)
                                .map(account => (
                                    <option key={account.id} value={account.id}>
                                        {account.name}
                                    </option>
                                ))}
                        </select>
                    </label>
                )}

                <button
                    type="submit"
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-stone-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-800 sm:col-span-2 lg:col-span-4"
                >
                    <Plus className="h-4 w-4" />
                    Save Budget
                </button>
            </form>

            <div className="mt-5">
                {lines.length === 0 ? (
                    <div className="rounded-md border border-dashed border-stone-300 bg-stone-50 px-4 py-6 text-sm text-stone-500">
                        No spending budgets yet.
                    </div>
                ) : (
                    <ul className="divide-y divide-stone-100 overflow-hidden rounded-md border border-stone-200">
                        {lines.map(line => {
                            const { budget } = line;
                            const isEditing = editingId === budget.id;
                            const usedPercent = line.windowAmount > 0
                                ? Math.min(100, (line.spent / line.windowAmount) * 100)
                                : 0;
                            const over = line.remaining < 0;

                            return (
                                <li
                                    key={budget.id}
                                    data-testid="budget-row"
                                    className="grid gap-3 p-4"
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-2">
                                        <div>
                                            <p className="font-semibold text-stone-950">
                                                {categoryName(budget.categoryId)}
                                            </p>
                                            <p className="text-xs text-stone-500">
                                                {formatCurrency(budget.amount)} / month
                                                {" · "}
                                                {PERIOD_LABELS[budget.period]}
                                                {" · "}
                                                {accountName(budget.accountId)}
                                            </p>
                                            <p className="text-xs text-stone-500">
                                                Leftover: {LEFTOVER_LABELS[budget.leftoverAction ?? "savings"]}
                                                {(budget.leftoverAction ?? "savings") === "savings" &&
                                                    budget.savingsAccountId &&
                                                    ` → ${accountName(budget.savingsAccountId)}`}
                                            </p>
                                        </div>

                                        {!isEditing && (
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    title="Edit budget"
                                                    className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-stone-200 text-stone-600 transition hover:bg-stone-50"
                                                    onClick={() => {
                                                        setEditingId(budget.id);
                                                        setEditAmount(String(budget.amount));
                                                        setEditAccountId(budget.accountId);
                                                        setEditPeriod(budget.period);
                                                        setEditLeftover(budget.leftoverAction ?? "savings");
                                                        setEditSavingsId(budget.savingsAccountId ?? "");
                                                    }}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>

                                                <button
                                                    type="button"
                                                    title="Delete budget"
                                                    className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-stone-200 text-red-600 transition hover:bg-red-50"
                                                    onClick={async () => {
                                                        const ok = await confirm({
                                                            title: "Delete budget?",
                                                            message: `Money will no longer be set aside for ${categoryName(budget.categoryId)}. Past expenses are kept.`,
                                                            confirmLabel: "Delete",
                                                            tone: "danger",
                                                        });

                                                        if (ok) {
                                                            await deleteBudget(budget.id);
                                                            toast({ type: "success", message: "Budget deleted." });
                                                        }
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {isEditing ? (
                                        <div className="grid gap-2 sm:grid-cols-3">
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={editAmount}
                                                onChange={e => setEditAmount(e.target.value)}
                                                className={inputClass}
                                            />

                                            <select
                                                value={editAccountId}
                                                onChange={e => setEditAccountId(e.target.value)}
                                                className={inputClass}
                                            >
                                                {accounts.map(account => (
                                                    <option key={account.id} value={account.id}>
                                                        {account.name}
                                                    </option>
                                                ))}
                                            </select>

                                            <select
                                                value={editPeriod}
                                                onChange={e => setEditPeriod(e.target.value as BudgetPeriod)}
                                                className={inputClass}
                                            >
                                                {PERIOD_ORDER.map(value => (
                                                    <option key={value} value={value}>
                                                        {PERIOD_LABELS[value]}
                                                    </option>
                                                ))}
                                            </select>

                                            <select
                                                aria-label="Leftover action"
                                                value={editLeftover}
                                                onChange={e => setEditLeftover(e.target.value as LeftoverAction)}
                                                className={inputClass}
                                            >
                                                {LEFTOVER_ORDER.map(value => (
                                                    <option key={value} value={value}>
                                                        {LEFTOVER_LABELS[value]}
                                                    </option>
                                                ))}
                                            </select>

                                            {editLeftover === "savings" ? (
                                                <select
                                                    aria-label="Savings account"
                                                    value={editSavingsId}
                                                    onChange={e => setEditSavingsId(e.target.value)}
                                                    className={inputClass}
                                                >
                                                    <option value="">Savings account…</option>
                                                    {accounts
                                                        .filter(account => account.id !== editAccountId)
                                                        .map(account => (
                                                            <option key={account.id} value={account.id}>
                                                                {account.name}
                                                            </option>
                                                        ))}
                                                </select>
                                            ) : (
                                                <span />
                                            )}

                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    title="Save budget"
                                                    className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-emerald-600 text-white transition hover:bg-emerald-700"
                                                    onClick={() => handleSaveEdit(budget.id)}
                                                >
                                                    <Check className="h-4 w-4" />
                                                </button>

                                                <button
                                                    type="button"
                                                    title="Cancel edit"
                                                    className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-stone-200 text-stone-600 transition hover:bg-stone-50"
                                                    onClick={() => setEditingId(null)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ) : line.activeNow ? (
                                        <div className="grid gap-1">
                                            <div className="h-2 overflow-hidden rounded-full bg-stone-100">
                                                <div
                                                    className={`h-full rounded-full ${over ? "bg-red-500" : "bg-emerald-500"}`}
                                                    style={{ width: `${usedPercent}%` }}
                                                />
                                            </div>

                                            <p className="text-xs text-stone-600">
                                                Spent {formatCurrency(line.spent)} of {formatCurrency(line.windowAmount)}
                                                {" · "}
                                                {over ? (
                                                    <span className="font-semibold text-red-600">
                                                        Over by {formatCurrency(-line.remaining)}
                                                    </span>
                                                ) : (
                                                    <span className="font-semibold text-emerald-700">
                                                        {formatCurrency(line.remaining)} left
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-stone-500">
                                            {inactiveNote(budget.period)}
                                            {line.upcomingThisMonth > 0 &&
                                                ` ${formatCurrency(line.upcomingThisMonth)} will be set aside.`}
                                        </p>
                                    )}

                                    {line.rolledIn > 0 && line.activeNow && (
                                        <p className="text-xs text-emerald-700">
                                            Includes {formatCurrency(line.rolledIn)} rolled over from last period.
                                        </p>
                                    )}

                                    {historyFor(budget.id).length > 0 && (
                                        <ul className="grid gap-0.5 text-xs text-stone-500">
                                            {historyFor(budget.id).map(s => {
                                                const range = `${new Date(s.windowStart).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}–${new Date(s.windowEnd).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}`;
                                                const outcome = s.leftover <= 0
                                                    ? (s.spent > s.budgetAmount
                                                        ? `over by ${formatCurrency(s.spent - s.budgetAmount)}`
                                                        : "used in full")
                                                    : s.action === "savings"
                                                        ? `${formatCurrency(s.leftover)} saved`
                                                        : s.action === "rollover"
                                                            ? `${formatCurrency(s.rolledOver ?? 0)} rolled over`
                                                            : `${formatCurrency(s.leftover)} released`;

                                                return (
                                                    <li key={s.id}>
                                                        {range}: spent {formatCurrency(s.spent)} of {formatCurrency(s.budgetAmount)} · {outcome}
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </section>
    );
}
