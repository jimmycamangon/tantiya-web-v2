import { useEffect, useState } from "react";

import { Plus }
    from "lucide-react";

import {
    useToast
} from "../../components/AppFeedback";

import type { Account } from "../../types/account";

import { getAccounts } from "../accounts/account.service";
import { createIncome } from "./income.service";



export default function AddIncomeForm() {

    const toast =
        useToast();

    const [amount, setAmount] =
        useState("");

    const [accountId, setAccountId] =
        useState("");

    const [notes, setNotes] =
        useState("");

    const [accounts, setAccounts] =
        useState<Account[]>([]);

    useEffect(() => {
        async function loadAccounts() {
            const data =
                await getAccounts();

            setAccounts(data);
        }

        loadAccounts();
    }, []);

    async function handleSubmit(
        e: React.FormEvent
    ) {

        e.preventDefault();

        if (
            !accountId ||
            !amount
        ) {

            toast({
                type: "warning",
                message:
                    "Choose an account and amount."
            });

            return;
        }

        try {

            await createIncome(
                Number(amount),
                accountId,
                notes
            );

            toast({
                type: "success",
                message:
                    "Income saved."
            });

            setAmount("");
            setNotes("");

        } catch (error) {

            toast({
                type: "error",
                message:
                    error instanceof Error
                        ? error.message
                        : "Unable to save income."
            });
        }
    }

    return (
        <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm sm:p-5">

            <div className="mb-4">
                <h2 className="text-base font-semibold text-stone-950">
                    Add Income
                </h2>

                <p className="text-sm text-stone-500">
                    Record money received from salary, allowances, or other sources.
                </p>
            </div>

            <form
                onSubmit={handleSubmit}
                className="grid gap-3 lg:grid-cols-3"
            >

                <label className="grid gap-1">
                    <span className="text-xs font-medium text-stone-500">
                        Account
                    </span>

                    <select
                        value={accountId}
                        onChange={(e) =>
                            setAccountId(
                                e.target.value
                            )
                        }
                        className="h-10 rounded-md border border-stone-300 bg-white px-3 text-sm text-stone-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                    >
                        <option value="">
                            Select Account
                        </option>

                        {accounts.map(
                            account => (
                                <option
                                    key={account.id}
                                    value={account.id}
                                >
                                    {account.name}
                                </option>
                            )
                        )}
                    </select>
                </label>

                <label className="grid gap-1">
                    <span className="text-xs font-medium text-stone-500">
                        Amount
                    </span>

                    <input
                        type="number"
                        value={amount}
                        onChange={(e) =>
                            setAmount(
                                e.target.value
                            )
                        }
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
                        onChange={(e) =>
                            setNotes(
                                e.target.value
                            )
                        }
                        placeholder="Optional"
                        className="h-10 rounded-md border border-stone-300 bg-white px-3 text-sm text-stone-950 outline-none transition placeholder:text-stone-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                    />
                </label>

                <button
                    type="submit"
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-stone-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-800 lg:col-start-3"
                >
                    <Plus
                        className="h-4 w-4"
                    />

                    Save Income
                </button>

            </form>

        </section>
    );
}