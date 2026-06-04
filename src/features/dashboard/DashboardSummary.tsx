import { useEffect, useState }
    from "react";

import { getAccounts }
    from "../accounts/account.service";

import { getObligations }
    from "../obligations/obligation.service";

import {
    calculateAccountBalance
} from "../accounts/accountBalance.service";

import {
    calculateReservedAmount
} from "../obligations/calculateReservedAmount";

import { useLiveQuery }
    from "dexie-react-hooks";

function formatCurrency(
    amount: number
) {
    return new Intl.NumberFormat(
        "en-PH",
        {
            style: "currency",
            currency: "PHP"
        }
    ).format(
        amount
    );
}

export default function DashboardSummary() {

    const [actualBalance,
        setActualBalance] =
        useState(0);

    const obligations =
        useLiveQuery(
            () => getObligations(),
            []
        );

    const reservedAmount =
        calculateReservedAmount(
            obligations ?? []
        );

    useEffect(() => {

        async function loadBalance() {

            const accounts =
                await getAccounts();

            let totalBalance = 0;

            for (
                const account
                of accounts
            ) {

                const balance =
                    await calculateAccountBalance(
                        account.id
                    );

                totalBalance +=
                    balance;
            }

            setActualBalance(
                totalBalance
            );
        }

        loadBalance();

    }, [obligations]);

    const availableBalance =
        actualBalance -
        reservedAmount;

    const stats = [
        {
            label: "Actual Balance",
            value: actualBalance,
            tone: "text-stone-950"
        },
        {
            label: "Reserved Amount",
            value: reservedAmount,
            tone: "text-amber-700"
        },
        {
            label: "Available To Spend",
            value: availableBalance,
            tone: availableBalance >= 0
                ? "text-emerald-700"
                : "text-red-700"
        }
    ];

    return (
        <div className="grid gap-4 md:grid-cols-3">
            {stats.map(
                stat => (
                    <section
                        key={stat.label}
                        className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm"
                    >
                        <p className="text-sm font-medium text-stone-500">
                            {stat.label}
                        </p>
                        <p className={`mt-3 text-2xl font-semibold ${stat.tone}`}>
                            {formatCurrency(stat.value)}
                        </p>
                    </section>
                )
            )}
        </div>
    );
}
