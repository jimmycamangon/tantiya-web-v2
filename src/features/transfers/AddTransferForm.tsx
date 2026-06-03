import { useEffect, useState } from "react";

import type { Account } from "../../types/account";

import { getAccounts } from "../accounts/account.service";
import { createTransfer } from "./transfer.service";


export default function AddTransferForm() {

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

        await createTransfer(
            fromAccountId,
            toAccountId,
            Number(amount),
            notes
        );

        setAmount("");
        setNotes("");
    }

    return (
        <form onSubmit={handleSubmit}>

            <h2>
                Add Transfer
            </h2>

            <div>
                <label>
                    From Account
                </label>

                <select
                    value={fromAccountId}
                    onChange={(e) =>
                        setFromAccountId(
                            e.target.value
                        )
                    }
                >
                    <option value="">
                        Select Account
                    </option>

                    {accounts.map(
                        account => (
                            <option
                                key={account.id}
                                value={
                                    account.id
                                }
                            >
                                {account.name}
                            </option>
                        )
                    )}
                </select>
            </div>

            <div>
                <label>
                    To Account
                </label>

                <select
                    value={toAccountId}
                    onChange={(e) =>
                        setToAccountId(
                            e.target.value
                        )
                    }
                >
                    <option value="">
                        Select Account
                    </option>

                    {accounts.map(
                        account => (
                            <option
                                key={account.id}
                                value={
                                    account.id
                                }
                            >
                                {account.name}
                            </option>
                        )
                    )}
                </select>
            </div>

            <div>
                <label>
                    Amount
                </label>

                <input
                    type="number"
                    value={amount}
                    onChange={(e) =>
                        setAmount(
                            e.target.value
                        )
                    }
                />
            </div>

            <div>
                <label>
                    Notes
                </label>

                <input
                    value={notes}
                    onChange={(e) =>
                        setNotes(
                            e.target.value
                        )
                    }
                />
            </div>

            <button type="submit">
                Save Transfer
            </button>

        </form>
    );
}