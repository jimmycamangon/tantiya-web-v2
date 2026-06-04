import { useEffect, useState }
    from "react";
import type { FormEvent }
    from "react";
import { Plus }
    from "lucide-react";

import { useToast }
    from "../../components/AppFeedback";
import type { Account } from "../../types/account";
import type { Category } from "../../types/category";

import { getAccounts } from "../accounts/account.service";
import { getCategories } from "../categories/category.service";

import { createExpense } from "./expense.service";

export default function AddExpenseForm() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);

    const [accountId, setAccountId] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [amount, setAmount] = useState("");
    const [notes, setNotes] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const toast =
        useToast();

    useEffect(() => {
        async function loadData() {
            const accountsData = await getAccounts();
            const categoriesData = await getCategories();

            setAccounts(accountsData);
            setCategories(categoriesData);
        }

        loadData();
    }, []);


    const handleSubmit = async (
        e: FormEvent
    ) => {
        e.preventDefault();

        if (
            !accountId ||
            !categoryId ||
            !amount
        ) {
            toast({
                type: "warning",
                message: "Choose an account, category, and amount."
            });

            return;
        }

        setIsSaving(
            true
        );

        try {
            await createExpense(
                Number(amount),
                categoryId,
                accountId,
                notes
            );

            toast({
                type: "success",
                message: "Expense saved."
            });

            setAccountId("");
            setCategoryId("");
            setAmount("");
            setNotes("");
        } catch (error) {
            toast({
                type: "error",
                message: error instanceof Error
                    ? error.message
                    : "Unable to save expense."
            });
        } finally {
            setIsSaving(
                false
            );
        }
    };

    return (
        <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4">
                <h2 className="text-base font-semibold text-stone-950">
                    Add Expense
                </h2>
                <p className="text-sm text-stone-500">
                    Use this when you want to choose exact fields manually.
                </p>
            </div>

            <form
                onSubmit={handleSubmit}
                className="grid gap-3 lg:grid-cols-4"
            >
                <label className="grid gap-1">
                    <span className="text-xs font-medium text-stone-500">
                        Account
                    </span>
                    <select
                        value={accountId}
                        onChange={(e) => setAccountId(e.target.value)}
                        className="h-10 rounded-md border border-stone-300 bg-white px-3 text-sm text-stone-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                    >
                        <option value="">Select Account</option>

                        {accounts.map((account) => (
                            <option
                                key={account.id}
                                value={account.id}
                            >
                                {account.name}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="grid gap-1">
                    <span className="text-xs font-medium text-stone-500">
                        Category
                    </span>
                    <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="h-10 rounded-md border border-stone-300 bg-white px-3 text-sm text-stone-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                    >
                        <option value="">Select Category</option>

                        {categories.map((category) => (
                            <option
                                key={category.id}
                                value={category.id}
                            >
                                {category.name}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="grid gap-1">
                    <span className="text-xs font-medium text-stone-500">
                        Amount
                    </span>
                    <input
                        type="number"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="h-10 rounded-md border border-stone-300 bg-white px-3 text-sm text-stone-950 outline-none transition placeholder:text-stone-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                    />
                </label>

                <label className="grid gap-1">
                    <span className="text-xs font-medium text-stone-500">
                        Notes
                    </span>
                    <input
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Optional"
                        className="h-10 rounded-md border border-stone-300 bg-white px-3 text-sm text-stone-950 outline-none transition placeholder:text-stone-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                    />
                </label>

                <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-stone-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-800 disabled:bg-stone-300 lg:col-start-4"
                >
                    <Plus
                        aria-hidden="true"
                        className="h-4 w-4"
                    />
                    {isSaving
                        ? "Saving..."
                        : "Save Expense"}
                </button>
            </form>
        </section>
    );
}
