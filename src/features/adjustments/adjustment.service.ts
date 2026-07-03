import { db } from "../../db/database";

import type { Adjustment } from "../../types/adjustment";

import { calculateAccountBalance } from "../accounts/accountBalance.service";

/**
 * Reconciles an account to a real-world balance.
 * Computes the delta between the target balance and the
 * current calculated balance, then records it as an adjustment.
 */
export async function adjustAccountToBalance(
    accountId: string,
    targetBalance: number,
    reason?: string
): Promise<Adjustment> {

    const currentBalance =
        await calculateAccountBalance(accountId);

    const delta = targetBalance - currentBalance;

    if (delta === 0) {
        throw new Error(
            "The account balance already matches this amount."
        );
    }

    const adjustment: Adjustment = {
        id: crypto.randomUUID(),
        accountId,
        amount: delta,
        reason: reason?.trim() || "Balance correction",
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
    };

    await db.adjustments.add(adjustment);

    return adjustment;
}

export interface AdjustmentWithAccount extends Adjustment {
    accountName: string;
}

export async function getAdjustments(): Promise<
    AdjustmentWithAccount[]
> {

    const adjustments = await db.adjustments.toArray();

    const accounts = await db.accounts.toArray();

    return adjustments
        .map(adjustment => {
            const account = accounts.find(
                a => a.id === adjustment.accountId
            );

            return {
                ...adjustment,
                accountName: account?.name ?? "Unknown",
            };
        })
        .sort((a, b) =>
            b.date.localeCompare(a.date)
        );
}

export async function deleteAdjustment(
    id: string
): Promise<void> {
    await db.adjustments.delete(id);
}
