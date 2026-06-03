import { useLiveQuery } from "dexie-react-hooks";
import { useState } from "react";
import { db } from "../../db/database";
import {
    softDeleteIncome,
    updateIncome,
} from "./income.service";


export default function IncomeList() {

    const [editingIncomeId, setEditingIncomeId] =
        useState<string | null>(null);

    const [editAmount, setEditAmount] =
        useState("");

    const [editNotes, setEditNotes] =
        useState("");

    const incomesWithDetails =
        useLiveQuery(async () => {

            const incomes = (
                await db.incomes.toArray()
            ).filter(
                income => !income.isDeleted
            );

            const accounts =
                await db.accounts.toArray();

            return incomes.map(income => ({
                ...income,

                accountName:
                    accounts.find(
                        a =>
                            a.id ===
                            income.accountId
                    )?.name ?? "Unknown"
            }));

        }, []);

    return (
        <div>
            <h2>Income History</h2>

            <ul>
                {incomesWithDetails?.map(
                    income => (
                        <li key={income.id}>
                            {editingIncomeId === income.id ? (
                                <>
                                    <input
                                        type="number"
                                        value={editAmount}
                                        onChange={(e) =>
                                            setEditAmount(
                                                e.target.value
                                            )
                                        }
                                    />

                                    <input
                                        value={editNotes}
                                        onChange={(e) =>
                                            setEditNotes(
                                                e.target.value
                                            )
                                        }
                                    />

                                    <button
                                        onClick={async () => {
                                            await updateIncome(
                                                income.id,
                                                Number(editAmount),
                                                editNotes
                                            );

                                            setEditingIncomeId(
                                                null
                                            );
                                        }}
                                    >
                                        Save
                                    </button>

                                    <button
                                        onClick={() =>
                                            setEditingIncomeId(
                                                null
                                            )
                                        }
                                    >
                                        Cancel
                                    </button>
                                </>
                            ) : (
                                <>
                                    {income.date.slice(0, 10)}
                                    {" | "}
                                    {income.accountName}
                                    {" | "}
                                    ₱{income.amount}
                                    {" | "}
                                    {income.notes}

                                    <button
                                        onClick={() => {
                                            setEditingIncomeId(
                                                income.id
                                            );

                                            setEditAmount(
                                                income.amount.toString()
                                            );

                                            setEditNotes(
                                                income.notes ?? ""
                                            );
                                        }}
                                    >
                                        Edit
                                    </button>

                                    <button
                                        onClick={() =>
                                            softDeleteIncome(
                                                income.id
                                            )
                                        }
                                    >
                                        Delete
                                    </button>
                                </>
                            )}
                        </li>
                    )
                )}
            </ul>
        </div>
    );
}