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

    return (
        <div>

            <h2>
                Dashboard
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

        </div>
    );
}