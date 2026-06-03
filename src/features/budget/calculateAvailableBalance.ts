import type { Account }
    from "../../types/account";

import type { Obligation }
    from "../../types/obligation";

import {
    calculateAccountBalance
} from "../accounts/accountBalance.service";

import {
    calculateReservedAmount
} from "../obligations/calculateReservedAmount";

export async function calculateAvailableBalance(
    accounts: Account[],
    obligations: Obligation[]
): Promise<number> {

    let totalBalance = 0;

    for (const account of accounts) {

        const balance =
            await calculateAccountBalance(
                account.id
            );

        totalBalance += balance;
    }

    const reservedAmount =
        calculateReservedAmount(
            obligations
        );

    return (
        totalBalance -
        reservedAmount
    );
}