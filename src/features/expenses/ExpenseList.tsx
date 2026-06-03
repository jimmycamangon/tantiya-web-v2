import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../db/database";
import { softDeleteExpense, updateExpense } from "./expense.service";
import { useState } from "react";


export default function ExpenseList() {
    const [editingExpenseId, setEditingExpenseId] =
        useState<string | null>(null);

    const [editAmount, setEditAmount] =
        useState("");

    const [editNotes, setEditNotes] =
        useState("");

    const expensesWithDetails = useLiveQuery(async () => {

        const expenses = (
            await db.expenses.toArray()
        ).filter(expense => !expense.isDeleted);

        const categories = await db.categories.toArray();
        const accounts = await db.accounts.toArray();

        return expenses.map((expense) => ({
            ...expense,
            categoryName:
                categories.find(
                    (c) => c.id === expense.categoryId
                )?.name ?? "Unknown",

            accountName:
                accounts.find(
                    (a) => a.id === expense.accountId
                )?.name ?? "Unknown",
        }));
    }, []);

    return (
        <div>
            <h2>Expense History</h2>

            <ul>
                {expensesWithDetails?.map((expense) => (
                    <li key={expense.id}>
                        {editingExpenseId === expense.id ? (
                            <>
                                <input
                                    type="number"
                                    value={editAmount}
                                    onChange={(e) =>
                                        setEditAmount(e.target.value)
                                    }
                                />

                                <input
                                    value={editNotes}
                                    onChange={(e) =>
                                        setEditNotes(e.target.value)
                                    }
                                />

                                <button
                                    onClick={async () => {
                                        await updateExpense(
                                            expense.id,
                                            Number(editAmount),
                                            editNotes
                                        );

                                        setEditingExpenseId(null);
                                    }}
                                >
                                    Save
                                </button>

                                <button
                                    onClick={() =>
                                        setEditingExpenseId(null)
                                    }
                                >
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <>
                                {expense.date.slice(0, 10)}
                                {" | "}
                                {expense.categoryName}
                                {" | "}
                                {expense.accountName}
                                {" | "}
                                ₱{expense.amount}

                                <button
                                    onClick={() => {
                                        setEditingExpenseId(
                                            expense.id
                                        );
                                        setEditAmount(
                                            expense.amount.toString()
                                        );
                                        setEditNotes(
                                            expense.notes ?? ""
                                        );
                                    }}
                                >
                                    Edit
                                </button>

                                <button
                                    onClick={() =>
                                        softDeleteExpense(
                                            expense.id
                                        )
                                    }
                                >
                                    Delete
                                </button>
                            </>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}