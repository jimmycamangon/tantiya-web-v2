import { useEffect, useState } from "react";

import type { Account } from "../../types/account";

import { getAccounts } from "../accounts/account.service";
import { createIncome } from "./income.service";



export default function AddIncomeForm() {
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

        await createIncome(
            Number(amount),
            accountId,
            notes
        );

        setAmount("");
        setNotes("");
    }

    return (
        <form onSubmit={handleSubmit}>
            <h2>Add Income</h2>

            <div>
                <label>Account</label>

                <select
                    value={accountId}
                    onChange={(e) =>
                        setAccountId(
                            e.target.value
                        )
                    }
                >
                    <option value="">
                        Select Account
                    </option>

                    {accounts.map(
                        (account) => (
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
                <label>Amount</label>

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
                <label>Notes</label>

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
                Save Income
            </button>
        </form>
    );
}