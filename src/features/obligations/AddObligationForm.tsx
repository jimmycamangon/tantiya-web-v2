import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

import { useToast }
    from "../../components/AppFeedback";

import type { Account } from "../../types/account";

import type {
    FundingRule,
    RecurrenceType
} from "../../types/common";

import {
    getAccounts
} from "../accounts/account.service";

import {
    createObligation
} from "./obligation.service";

export default function AddObligationForm() {

    const [name, setName] =
        useState("");

    const [amount, setAmount] =
        useState("");

    const [dueDay, setDueDay] =
        useState("");

    const [accountId, setAccountId] =
        useState("");

    const [
        recurrenceType,
        setRecurrenceType
    ] = useState<RecurrenceType>(
        "monthly"
    );

    const [
        fundingRule,
        setFundingRule
    ] = useState<FundingRule>(
        "current_cutoff"
    );

    const [accounts, setAccounts] =
        useState<Account[]>([]);

    const toast =
        useToast();

    useEffect(() => {

        async function loadAccounts() {

            const data =
                await getAccounts();

            setAccounts(
                data
            );
        }

        loadAccounts();

    }, []);

    async function handleSubmit(
        e: React.FormEvent
    ) {

        e.preventDefault();

        if (
            !name ||
            !amount ||
            !dueDay ||
            !accountId
        ) {

            toast({
                type: "warning",
                message:
                    "Complete all required fields."
            });

            return;
        }

        try {

            await createObligation(
                name,
                Number(amount),
                recurrenceType,
                Number(dueDay),
                accountId,
                fundingRule
            );

            toast({
                type: "success",
                message:
                    "Obligation added."
            });

            setName("");
            setAmount("");
            setDueDay("");

        } catch (error) {

            toast({
                type: "error",
                message:
                    error instanceof Error
                        ? error.message
                        : "Unable to save obligation."
            });
        }
    }

    return (
        <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm sm:p-5">

            <div className="mb-4">
                <h2 className="text-base font-semibold text-stone-950">
                    Add Obligation
                </h2>

                <p className="text-sm text-stone-500">
                    Create recurring bills and future commitments.
                </p>
            </div>

            <form
                onSubmit={handleSubmit}
                className="grid gap-3 lg:grid-cols-3"
            >

                <label className="grid gap-1">
                    <span className="text-xs font-medium text-stone-500">
                        Name
                    </span>

                    <input
                        value={name}
                        onChange={(e) =>
                            setName(
                                e.target.value
                            )
                        }
                        className="h-10 rounded-md border border-stone-300 px-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                    />
                </label>

                <label className="grid gap-1">
                    <span className="text-xs font-medium text-stone-500">
                        Amount
                    </span>

                    <input
                        type="number"
                        step="0.01"
                        value={amount}
                        onChange={(e) =>
                            setAmount(
                                e.target.value
                            )
                        }
                        className="h-10 rounded-md border border-stone-300 px-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                    />
                </label>

                <label className="grid gap-1">
                    <span className="text-xs font-medium text-stone-500">
                        Due Day
                    </span>

                    <input
                        type="number"
                        min="1"
                        max="31"
                        value={dueDay}
                        onChange={(e) =>
                            setDueDay(
                                e.target.value
                            )
                        }
                        className="h-10 rounded-md border border-stone-300 px-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                    />
                </label>

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
                        className="h-10 rounded-md border border-stone-300 px-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
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
                        Recurrence
                    </span>

                    <select
                        value={recurrenceType}
                        onChange={(e) =>
                            setRecurrenceType(
                                e.target.value as RecurrenceType
                            )
                        }
                        className="h-10 rounded-md border border-stone-300 px-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                    >
                        <option value="monthly">Monthly</option>
                        <option value="weekly">Weekly</option>
                        <option value="yearly">Yearly</option>
                        <option value="one_time">One Time</option>
                    </select>
                </label>

                <label className="grid gap-1">
                    <span className="text-xs font-medium text-stone-500">
                        Funding Rule
                    </span>

                    <select
                        value={fundingRule}
                        onChange={(e) =>
                            setFundingRule(
                                e.target.value as FundingRule
                            )
                        }
                        className="h-10 rounded-md border border-stone-300 px-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                    >
                        <option value="current_cutoff">
                            Current Cutoff
                        </option>

                        <option value="previous_cutoff">
                            Previous Cutoff
                        </option>

                        <option value="split_cutoffs">
                            Split Cutoffs
                        </option>
                    </select>
                </label>

                <button
                    type="submit"
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-stone-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-800 lg:col-span-3"
                >
                    <Plus className="h-4 w-4" />
                    Save Obligation
                </button>

            </form>

        </section>
    );
}