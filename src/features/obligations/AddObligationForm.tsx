import { useEffect, useState } from "react";

import type { Account } from "../../types/account";
import type {
    FundingRule,
    RecurrenceType
} from "../../types/common";

import { getAccounts }
    from "../accounts/account.service";

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

        await createObligation(
            name,
            Number(amount),
            recurrenceType,
            Number(dueDay),
            accountId,
            fundingRule
        );
        setName("");
        setAmount("");
        setDueDay("");
    }

    return (
        <form onSubmit={handleSubmit}>

            <h2>
                Add Obligation
            </h2>

            <input
                placeholder="Name"
                value={name}
                onChange={(e) =>
                    setName(
                        e.target.value
                    )
                }
            />

            <input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) =>
                    setAmount(
                        e.target.value
                    )
                }
            />

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
            />

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

            <select
                value={recurrenceType}
                onChange={(e) =>
                    setRecurrenceType(
                        e.target.value as RecurrenceType
                    )
                }
            >
                <option value="monthly">
                    Monthly
                </option>

                <option value="weekly">
                    Weekly
                </option>

                <option value="yearly">
                    Yearly
                </option>

                <option value="one_time">
                    One Time
                </option>
            </select>

            <select
                value={fundingRule}
                onChange={(e) =>
                    setFundingRule(
                        e.target.value as FundingRule
                    )
                }
            >
                <option
                    value="current_cutoff"
                >
                    Current Cutoff
                </option>

                <option
                    value="previous_cutoff"
                >
                    Previous Cutoff
                </option>

                <option
                    value="split_cutoffs"
                >
                    Split Cutoffs
                </option>
            </select>

            <button type="submit">
                Save
            </button>

        </form>
    );
}