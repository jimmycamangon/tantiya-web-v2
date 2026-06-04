import { useLiveQuery } from "dexie-react-hooks";

import {
    Check,
    Pencil,
    Trash2,
    X
} from "lucide-react";

import {
    useConfirmDialog,
    useToast
} from "../../components/AppFeedback";

import { useState } from "react";
import { db } from "../../db/database";
import {
    softDeleteIncome,
    updateIncome,
} from "./income.service";


function formatCurrency(
    amount: number
) {
    return new Intl.NumberFormat(
        "en-PH",
        {
            style: "currency",
            currency: "PHP"
        }
    ).format(amount);
}

function formatDate(
    date: string
) {
    return new Intl.DateTimeFormat(
        "en-PH",
        {
            month: "short",
            day: "numeric",
            year: "numeric"
        }
    ).format(
        new Date(date)
    );
}

export default function IncomeList() {


    const confirm =
        useConfirmDialog();

    const toast =
        useToast();

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


    if (
        !incomesWithDetails ||
        incomesWithDetails.length === 0
    ) {
        return (
            <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm sm:p-5">

                <div className="mb-4">
                    <h2 className="text-base font-semibold text-stone-950">
                        Income History
                    </h2>

                    <p className="text-sm text-stone-500">
                        Money received across your accounts.
                    </p>
                </div>

                <div className="rounded-md border border-dashed border-stone-300 bg-stone-50 px-4 py-6 text-sm text-stone-500">
                    No income records yet.
                </div>

            </section>
        );
    }
    return (
        <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm sm:p-5">

            <div className="mb-4">
                <h2 className="text-base font-semibold text-stone-950">
                    Income History
                </h2>

                <p className="text-sm text-stone-500">
                    Money received across your accounts.
                </p>
            </div>

            <div className="divide-y divide-stone-100 overflow-hidden rounded-md border border-stone-200">
                {incomesWithDetails?.map(
                    income => (
                        <div
                            key={income.id}
                            className="px-4 py-3"
                        >
                            {editingIncomeId === income.id ? (

                                <div className="grid gap-3 lg:grid-cols-[140px_120px_1fr_auto] lg:items-center">

                                    <p className="text-stone-500">
                                        {formatDate(
                                            income.date
                                        )}
                                    </p>

                                    <input
                                        type="number"
                                        value={editAmount}
                                        onChange={(e) =>
                                            setEditAmount(
                                                e.target.value
                                            )
                                        }
                                        className="h-10 rounded-md border border-stone-300 bg-white px-3 text-sm font-semibold text-stone-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                                    />

                                    <input
                                        value={editNotes}
                                        onChange={(e) =>
                                            setEditNotes(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Notes"
                                        className="h-10 rounded-md border border-stone-300 bg-white px-3 text-sm text-stone-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                                    />

                                    <div className="flex gap-2">

                                        <button
                                            type="button"
                                            title="Save income"
                                            className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-emerald-600 text-white transition hover:bg-emerald-700"
                                            onClick={async () => {

                                                try {

                                                    await updateIncome(
                                                        income.id,
                                                        Number(
                                                            editAmount
                                                        ),
                                                        editNotes
                                                    );

                                                    toast({
                                                        type: "success",
                                                        message:
                                                            "Income updated."
                                                    });

                                                    setEditingIncomeId(
                                                        null
                                                    );

                                                } catch (error) {

                                                    toast({
                                                        type: "error",
                                                        message:
                                                            error instanceof Error
                                                                ? error.message
                                                                : "Unable to update income."
                                                    });
                                                }
                                            }}
                                        >
                                            <Check
                                                className="h-4 w-4"
                                            />
                                        </button>

                                        <button
                                            type="button"
                                            title="Cancel editing"
                                            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-stone-300 bg-white text-stone-600 transition hover:bg-stone-50 hover:text-stone-950"
                                            onClick={() =>
                                                setEditingIncomeId(
                                                    null
                                                )
                                            }
                                        >
                                            <X
                                                className="h-4 w-4"
                                            />
                                        </button>

                                    </div>

                                </div>

                            ) : (
                                <>
                                    <div className="grid gap-3 lg:grid-cols-[140px_1fr_140px_auto] lg:items-center">

                                        <p className="text-stone-500">
                                            {formatDate(
                                                income.date
                                            )}
                                        </p>

                                        <div className="min-w-0">
                                            <p className="truncate font-semibold text-stone-950">
                                                {income.accountName}
                                            </p>

                                            <p className="text-xs text-stone-500">
                                                {income.notes || "Income"}
                                            </p>
                                        </div>

                                        <p className="font-semibold text-emerald-700 lg:text-right">
                                            {formatCurrency(
                                                income.amount
                                            )}
                                        </p>

                                        <div className="flex gap-2 lg:justify-end">

                                            <button
                                                type="button"
                                                title="Edit income"
                                                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-stone-300 bg-white text-stone-600 transition hover:bg-stone-50 hover:text-stone-950"
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
                                                <Pencil
                                                    className="h-4 w-4"
                                                />
                                            </button>

                                            <button
                                                type="button"
                                                title="Delete income"
                                                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-stone-300 bg-white text-stone-600 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                                                onClick={async () => {

                                                    const confirmed =
                                                        await confirm({
                                                            title:
                                                                "Delete income?",
                                                            message:
                                                                "This will remove the income from your active history.",
                                                            confirmLabel:
                                                                "Delete",
                                                            tone:
                                                                "danger"
                                                        });

                                                    if (
                                                        !confirmed
                                                    ) {
                                                        return;
                                                    }

                                                    await softDeleteIncome(
                                                        income.id
                                                    );

                                                    toast({
                                                        type: "success",
                                                        message:
                                                            "Income deleted."
                                                    });
                                                }}
                                            >
                                                <Trash2
                                                    className="h-4 w-4"
                                                />
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}

                        </div>
                    )
                )}
            </div>

        </section>
    );
}