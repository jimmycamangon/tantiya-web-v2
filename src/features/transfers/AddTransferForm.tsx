import { useEffect, useState } from "react";

import { Plus }
    from "lucide-react";

import { useToast }
    from "../../components/AppFeedback";

import type { Account } from "../../types/account";

import { getAccounts } from "../accounts/account.service";
import { createTransfer } from "./transfer.service";


export default function AddTransferForm() {

    const toast =
        useToast();

    const [fromAccountId, setFromAccountId] =
        useState("");

    const [toAccountId, setToAccountId] =
        useState("");

    const [amount, setAmount] =
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
            !fromAccountId ||
            !toAccountId ||
            !amount
        ) {

            toast({
                type: "warning",
                message:
                    "Complete all required fields."
            });

            return;
        }

        if (
            fromAccountId ===
            toAccountId
        ) {

            toast({
                type: "warning",
                message:
                    "Choose different accounts."
            });

            return;
        }

        try {

            await createTransfer(
                fromAccountId,
                toAccountId,
                Number(amount),
                notes
            );

            toast({
                type: "success",
                message:
                    "Transfer saved."
            });

            setAmount("");
            setNotes("");

        } catch (error) {

            toast({
                type: "error",
                message:
                    error instanceof Error
                        ? error.message
                        : "Unable to save transfer."
            });
        }
    }

    return (
        <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm sm:p-5">

            <div className="mb-4">
                <h2 className="text-base font-semibold text-stone-950">
                    Add Transfer
                </h2>

                <p className="text-sm text-stone-500">
                    Move funds between your accounts.
                </p>
            </div>

            <form
                onSubmit={handleSubmit}
                className="grid gap-3 lg:grid-cols-4"
            >

                <label className="grid gap-1">
                    <span className="text-xs font-medium text-stone-500">
                        From Account
                    </span>

                    <select
                        value={fromAccountId}
                        onChange={(e) =>
                            setFromAccountId(
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
                        To Account
                    </span>

                    <select
                        value={toAccountId}
                        onChange={(e) =>
                            setToAccountId(
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
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-stone-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-800 lg:col-start-4"
                >
                    <Plus
                        className="h-4 w-4"
                    />

                    Save Transfer
                </button>

            </form>

        </section>
    );
}