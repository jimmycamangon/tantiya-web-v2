import { useEffect, useState }
    from "react";
import type { FormEvent }
    from "react";
import { Zap }
    from "lucide-react";

import { useToast }
    from "../../components/AppFeedback";
import type { Account } from "../../types/account";
import type { Category } from "../../types/category";
import { getAccounts } from "../accounts/account.service";
import { getCategories } from "../categories/category.service";
import {
    resolveQuickExpense
} from "./resolveQuickExpense";
import { createExpense } from "./expense.service";

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

export default function QuickExpenseInput() {
    const [input, setInput] = useState("");

    const [accounts, setAccounts] =
        useState<Account[]>([]);

    const [categories, setCategories] =
        useState<Category[]>([]);

    const [isSaving, setIsSaving] =
        useState(false);

    const toast =
        useToast();

    useEffect(() => {
        async function loadData() {
            const accountsData =
                await getAccounts();

            const categoriesData =
                await getCategories();

            setAccounts(accountsData);
            setCategories(categoriesData);
        }

        loadData();
    }, []);

    const [preview, setPreview] = useState({
        amount: 0,
        category: "Others",
        account: "Cash",
        notes: "",
    });
    function updatePreview(text: string) {

        const resolved =
            resolveQuickExpense(
                text,
                categories,
                accounts
            );

        setPreview(resolved);
    }



    const handleSubmit = async (
        e: FormEvent
    ) => {
        e.preventDefault();

        setIsSaving(
            true
        );

        try {
            const resolved =
                resolveQuickExpense(
                    input,
                    categories,
                    accounts
                );

            const category =
                categories.find(
                    c =>
                        c.name.toLowerCase() ===
                        resolved.category.toLowerCase()
                );

            const account =
                accounts.find(
                    a =>
                        a.name.toLowerCase() ===
                        resolved.account.toLowerCase()
                );

            if (!category) {
                throw new Error(
                    `Category '${resolved.category}' not found`
                );
            }

            if (!account) {
                throw new Error(
                    `Account '${resolved.account}' not found`
                );
            }

            await createExpense(
                resolved.amount,
                category.id,
                account.id,
                resolved.notes
            );

            toast({
                type: "success",
                message: "Expense added."
            });

            setInput("");

            setPreview({
                amount: 0,
                category: "Others",
                account: "Cash",
                notes: "",
            });
        } catch (error) {
            toast({
                type: "error",
                message: error instanceof Error
                    ? error.message
                    : "Invalid input."
            });
        } finally {
            setIsSaving(
                false
            );
        }
    };


    return (
        <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
                    <Zap
                        aria-hidden="true"
                        className="h-5 w-5"
                    />
                </div>

                <div>
                    <h2 className="text-base font-semibold text-stone-950">
                        Quick Expense
                    </h2>
                    <p className="text-sm text-stone-500">
                        Type a short spending note and let Tantiya resolve the account and category.
                    </p>
                </div>
            </div>

            <form
                onSubmit={handleSubmit}
                className="space-y-4"
            >
                <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                        value={input}
                        onChange={(e) => {
                            const value = e.target.value;

                            setInput(value);

                            updatePreview(value);
                        }}
                        placeholder="e.g. 120 lunch cash food"
                        className="h-11 min-w-0 flex-1 rounded-md border border-stone-300 bg-white px-3 text-sm text-stone-950 outline-none transition placeholder:text-stone-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                    />

                    <button
                        type="submit"
                        disabled={isSaving || !input.trim()}
                        className="inline-flex h-11 items-center justify-center rounded-md bg-stone-950 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-800 disabled:bg-stone-300"
                    >
                        {isSaving
                            ? "Adding..."
                            : "Add"}
                    </button>
                </div>

                <div className="grid gap-2 sm:grid-cols-4">
                    <div className="rounded-md border border-stone-200 bg-stone-50 p-3">
                        <p className="text-xs font-medium text-stone-500">
                            Amount
                        </p>
                        <p className="mt-1 text-sm font-semibold text-stone-950">
                            {formatCurrency(preview.amount)}
                        </p>
                    </div>

                    <div className="rounded-md border border-stone-200 bg-stone-50 p-3">
                        <p className="text-xs font-medium text-stone-500">
                            Category
                        </p>
                        <p className="mt-1 truncate text-sm font-semibold text-stone-950">
                            {preview.category}
                        </p>
                    </div>

                    <div className="rounded-md border border-stone-200 bg-stone-50 p-3">
                        <p className="text-xs font-medium text-stone-500">
                            Account
                        </p>
                        <p className="mt-1 truncate text-sm font-semibold text-stone-950">
                            {preview.account}
                        </p>
                    </div>

                    <div className="rounded-md border border-stone-200 bg-stone-50 p-3">
                        <p className="text-xs font-medium text-stone-500">
                            Notes
                        </p>
                        <p className="mt-1 truncate text-sm font-semibold text-stone-950">
                            {preview.notes || "-"}
                        </p>
                    </div>
                </div>
            </form>
        </section>
    );
}
