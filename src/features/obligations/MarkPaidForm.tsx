import { useEffect, useState } from "react";

import { useToast } from "../../components/AppFeedback";

import type { Category } from "../../types/category";
import type { Obligation } from "../../types/obligation";

import { db } from "../../db/database";

import { markObligationPaid } from "./obligationPayment.service";

interface MarkPaidFormProps {
    obligation: Obligation;
    onClose: () => void;
}

export default function MarkPaidForm({
    obligation,
    onClose,
}: MarkPaidFormProps) {

    const [amount, setAmount] = useState(
        obligation.amount.toString()
    );

    const [recordExpense, setRecordExpense] =
        useState(true);

    const [categoryId, setCategoryId] = useState("");

    const [categories, setCategories] = useState<
        Category[]
    >([]);

    const [isSaving, setIsSaving] = useState(false);

    const toast = useToast();

    useEffect(() => {

        async function loadCategories() {
            const data = await db.categories
                .filter(category => !category.archived)
                .toArray();

            setCategories(data);
        }

        loadCategories();
    }, []);

    async function handleSubmit() {

        const parsedAmount = Number(amount);

        if (
            !Number.isFinite(parsedAmount) ||
            parsedAmount <= 0
        ) {
            toast({
                type: "warning",
                message: "Enter a valid amount.",
            });
            return;
        }

        if (recordExpense && !categoryId) {
            toast({
                type: "warning",
                message:
                    "Select a category for the expense.",
            });
            return;
        }

        setIsSaving(true);

        try {
            await markObligationPaid(obligation, {
                amount: parsedAmount,
                categoryId: recordExpense
                    ? categoryId
                    : undefined,
            });

            toast({
                type: "success",
                message: `${obligation.name} marked as paid.`,
            });

            onClose();
        } catch (error) {
            toast({
                type: "error",
                message:
                    error instanceof Error
                        ? error.message
                        : "Unable to mark as paid.",
            });
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="mt-3 space-y-3 rounded-md border border-emerald-200 bg-emerald-50/50 p-3">
            <div>
                <p className="text-sm font-semibold text-stone-950">
                    Mark as paid
                </p>
                <p className="text-xs text-stone-500">
                    Records the payment for this period
                    {recordExpense
                        ? " and logs it as an expense."
                        : "."}
                </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1">
                    <span className="text-xs font-medium text-stone-500">
                        Amount paid
                    </span>
                    <input
                        type="number"
                        step="0.01"
                        value={amount}
                        onChange={e =>
                            setAmount(e.target.value)
                        }
                        className="h-10 rounded-md border border-stone-300 bg-white px-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                    />
                </label>

                {recordExpense && (
                    <label className="grid gap-1">
                        <span className="text-xs font-medium text-stone-500">
                            Expense category
                        </span>
                        <select
                            value={categoryId}
                            onChange={e =>
                                setCategoryId(
                                    e.target.value
                                )
                            }
                            className="h-10 rounded-md border border-stone-300 bg-white px-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                        >
                            <option value="">
                                Select Category
                            </option>
                            {categories.map(category => (
                                <option
                                    key={category.id}
                                    value={category.id}
                                >
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </label>
                )}
            </div>

            <label className="flex items-center gap-2 text-sm text-stone-700">
                <input
                    type="checkbox"
                    checked={recordExpense}
                    onChange={e =>
                        setRecordExpense(e.target.checked)
                    }
                    className="h-4 w-4 rounded border-stone-300 accent-emerald-600"
                />
                Also record as an expense
            </label>

            <div className="flex gap-2">
                <button
                    type="button"
                    disabled={isSaving}
                    onClick={handleSubmit}
                    className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-60"
                >
                    Confirm payment
                </button>

                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-50"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}
