import { useState, useEffect } from "react";

import { useLiveQuery }
    from "dexie-react-hooks";

import {
    getObligations,
    deactivateObligation,
    updateObligation
} from "./obligation.service";

import {
    getDaysUntilDue
} from "./getDaysUntilDue";

import {
    getObligationStatus
} from "./getObligationStatus";

import {
    calculateReservedAmount
} from "./calculateReservedAmount";

import {
    calculateAvailableBalance
} from "../budget/calculateAvailableBalance";

import {
    getAccounts
} from "../accounts/account.service";

import {
    calculateAccountBalance
} from "../accounts/accountBalance.service";




export default function ObligationList() {

    const obligations =
        useLiveQuery(
            () => getObligations(),
            []
        );
    const [
        editingObligationId,
        setEditingObligationId
    ] = useState("");

    const [editName,
        setEditName] =
        useState("");

    const [editAmount,
        setEditAmount] =
        useState("");

    const [editDueDay,
        setEditDueDay] =
        useState("");

    useEffect(() => {

        async function loadBalance() {



            const accounts =
                await getAccounts();
            console.log(accounts);


            let totalBalance = 0;

            for (const account of accounts) {

                const balance =
                    await calculateAccountBalance(
                        account.id
                    );

                totalBalance += balance;
            }

            setActualBalance(
                totalBalance
            );

            const available =
                await calculateAvailableBalance(
                    accounts,
                    obligations ?? []
                );

            setAvailableBalance(
                available
            );
        }

        loadBalance();

    }, [obligations]);

    const reservedAmount =
        calculateReservedAmount(
            obligations ?? []
        );

    const [availableBalance,
        setAvailableBalance] =
        useState(0);

    const [actualBalance,
        setActualBalance] =
        useState(0);

    return (
        <div>

            <h2>
                Obligations
            </h2>

            <div>
                Actual Balance:
                ₱{actualBalance}
            </div>

            <div>
                Reserved Amount:
                ₱{reservedAmount}
            </div>

            <div>
                Available To Spend:
                ₱{availableBalance}
            </div>

            <ul>

                {obligations?.map(
                    obligation => {

                        const daysUntilDue =
                            getDaysUntilDue(
                                obligation.dueDay
                            );

                        const status =
                            getObligationStatus(
                                daysUntilDue
                            );

                        return (
                            <li
                                key={
                                    obligation.id
                                }
                            >

                                {
                                    editingObligationId ===
                                        obligation.id
                                        ? (
                                            <>
                                                <input
                                                    value={
                                                        editName
                                                    }
                                                    onChange={(e) =>
                                                        setEditName(
                                                            e.target.value
                                                        )
                                                    }
                                                />

                                                <input
                                                    type="number"
                                                    value={
                                                        editAmount
                                                    }
                                                    onChange={(e) =>
                                                        setEditAmount(
                                                            e.target.value
                                                        )
                                                    }
                                                />

                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="31"
                                                    value={
                                                        editDueDay
                                                    }
                                                    onChange={(e) =>
                                                        setEditDueDay(
                                                            e.target.value
                                                        )
                                                    }
                                                />

                                                <button
                                                    onClick={async () => {

                                                        await updateObligation(
                                                            obligation.id,
                                                            {
                                                                name:
                                                                    editName,

                                                                amount:
                                                                    Number(
                                                                        editAmount
                                                                    ),

                                                                dueDay:
                                                                    Number(
                                                                        editDueDay
                                                                    )
                                                            }
                                                        );

                                                        setEditingObligationId(
                                                            ""
                                                        );
                                                    }}
                                                >
                                                    Save
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        setEditingObligationId(
                                                            ""
                                                        )
                                                    }
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        )
                                        : (
                                            <>
                                                {obligation.name}
                                                {" | "}
                                                ₱{obligation.amount}
                                                {" | "}
                                                {
                                                    obligation.recurrenceType
                                                }
                                                {" | "}
                                                Due Day: {
                                                    obligation.dueDay
                                                }
                                                {" | "}
                                                {
                                                    obligation.fundingRule
                                                }
                                                {" | "}
                                                Due in {
                                                    daysUntilDue
                                                } days
                                                {" | "}
                                                Status: {status}

                                                <button
                                                    onClick={() => {

                                                        setEditingObligationId(
                                                            obligation.id
                                                        );

                                                        setEditName(
                                                            obligation.name
                                                        );

                                                        setEditAmount(
                                                            obligation.amount.toString()
                                                        );

                                                        setEditDueDay(
                                                            obligation.dueDay.toString()
                                                        );
                                                    }}
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    onClick={() => {

                                                        const confirmed =
                                                            confirm(
                                                                `Delete '${obligation.name}'?`
                                                            );

                                                        if (
                                                            !confirmed
                                                        ) {
                                                            return;
                                                        }

                                                        deactivateObligation(
                                                            obligation.id
                                                        );
                                                    }}
                                                >
                                                    Delete
                                                </button>
                                            </>
                                        )
                                }

                            </li>
                        );
                    }
                )}

            </ul>
        </div>
    );
}