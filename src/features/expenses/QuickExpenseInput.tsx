import { useEffect, useState } from "react";

import type { Account } from "../../types/account";
import type { Category } from "../../types/category";
import { getAccounts } from "../accounts/account.service";
import { getCategories } from "../categories/category.service";
import {
    resolveQuickExpense
} from "./resolveQuickExpense";
import { createExpense } from "./expense.service";


export default function QuickExpenseInput() {
    const [input, setInput] = useState("");

    const [accounts, setAccounts] =
        useState<Account[]>([]);

    const [categories, setCategories] =
        useState<Category[]>([]);


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
        e: React.FormEvent
    ) => {
        e.preventDefault();

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
            setInput("");

            setPreview({
                amount: 0,
                category: "Others",
                account: "Cash",
                notes: "",
            });
        } catch (error) {
            alert(
                error instanceof Error
                    ? error.message
                    : "Invalid input"
            );
        }
    };


    return (
        <form onSubmit={handleSubmit}>
            <h2>Quick Expense</h2>

            <input
                value={input}
                onChange={(e) => {
                    const value = e.target.value;

                    setInput(value);

                    updatePreview(value);
                }}
            />

            <div>
                <h3>Preview</h3>

                <div>
                    Amount: {preview.amount}
                </div>

                <div>
                    Category: {preview.category}
                </div>

                <div>
                    Account: {preview.account}
                </div>

                <div>
                    Notes: {preview.notes}
                </div>
            </div>
            <button type="submit">
                Add
            </button>
        </form>
    );
}