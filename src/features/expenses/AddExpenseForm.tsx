import { useEffect, useState } from "react";

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
        e: React.FormEvent
    ) => {
        e.preventDefault();

        if (
            !accountId ||
            !categoryId ||
            !amount
        ) {
            return;
        }

        await createExpense(
            Number(amount),
            categoryId,
            accountId,
            notes
        );

        setAccountId("");
        setCategoryId("");
        setAmount("");
        setNotes("");
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Add Expense</h2>

            <div>
                <label>Account</label>
                <select
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
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
            </div>

            <div>
                <label>Category</label>
                <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
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
            </div>

            <div>
                <label>Amount</label>
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />
            </div>

            <div>
                <label>Notes</label>
                <input
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                />
            </div>

            <button type="submit">
                Save Expense
            </button>
        </form>
    );
}