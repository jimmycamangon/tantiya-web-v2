import { db } from "../../db/database";

import type { Obligation } from "../../types/obligation";
import type { ObligationPayment } from "../../types/obligationPayment";

import {
    createExpense,
    expenseBalanceTables,
    softDeleteExpense,
} from "../expenses/expense.service";

import {
    getObligationDueInfo,
} from "./obligationSchedule";

/** obligationId -> set of paid period keys */
export async function getPaidPeriodKeys(): Promise<
    Map<string, Set<string>>
> {

    const payments =
        await db.obligationPayments.toArray();

    const map = new Map<string, Set<string>>();

    for (const payment of payments) {
        let keys = map.get(payment.obligationId);

        if (!keys) {
            keys = new Set();
            map.set(payment.obligationId, keys);
        }

        keys.add(payment.periodKey);
    }

    return map;
}

export interface MarkPaidOptions {
    amount: number;
    /** When set, an expense is also recorded against this category. */
    categoryId?: string;
}

export async function markObligationPaid(
    obligation: Obligation,
    options: MarkPaidOptions
): Promise<ObligationPayment> {

    if (options.amount <= 0) {
        throw new Error(
            "Amount must be greater than zero"
        );
    }

    const paidMap = await getPaidPeriodKeys();

    const paidKeys =
        paidMap.get(obligation.id) ?? new Set<string>();

    const dueInfo = getObligationDueInfo(
        obligation,
        paidKeys
    );

    if (paidKeys.has(dueInfo.periodKey)) {
        throw new Error(
            "This obligation is already paid for this period."
        );
    }

    // All writes succeed together or none do, so a failed
    // payment never leaves an orphan expense behind.
    return db.transaction(
        "rw",
        // createExpense runs a nested balance-check transaction, so every
        // table it reads must be part of this outer transaction too.
        [...expenseBalanceTables, db.obligationPayments, db.obligations],
        async () => {

            let expenseId: string | undefined;

            if (options.categoryId) {
                const expense = await createExpense(
                    options.amount,
                    options.categoryId,
                    obligation.accountId,
                    `${obligation.name} (obligation)`
                );

                expenseId = expense.id;
            }

            const payment: ObligationPayment = {
                id: crypto.randomUUID(),
                obligationId: obligation.id,
                periodKey: dueInfo.periodKey,
                amount: options.amount,
                paidDate: new Date().toISOString(),
                expenseId,
                createdAt: new Date().toISOString(),
            };

            await db.obligationPayments.add(payment);

            if (obligation.recurrenceType === "one_time") {
                await db.obligations.update(obligation.id, {
                    active: false,
                });
            }

            return payment;
        }
    );
}

/**
 * Removes the payment for a period and soft-deletes
 * the linked expense, if one was created.
 */
export async function unmarkObligationPaid(
    obligationId: string,
    periodKey: string
): Promise<void> {

    const payment = await db.obligationPayments
        .where("obligationId")
        .equals(obligationId)
        .filter(p => p.periodKey === periodKey)
        .first();

    if (!payment) {
        return;
    }

    await removePayment(payment);
}

/**
 * Undoes the most recent payment of an obligation,
 * including one made in advance for a future period.
 */
export async function undoLatestObligationPayment(
    obligationId: string
): Promise<void> {

    const payments = await db.obligationPayments
        .where("obligationId")
        .equals(obligationId)
        .toArray();

    const latest = payments.sort((a, b) =>
        b.createdAt.localeCompare(a.createdAt)
    )[0];

    if (!latest) {
        return;
    }

    await removePayment(latest);
}

/** Deletes a payment and soft-deletes its linked expense together. */
async function removePayment(
    payment: ObligationPayment
): Promise<void> {

    await db.transaction(
        "rw",
        [db.expenses, db.obligationPayments],
        async () => {
            if (payment.expenseId) {
                await softDeleteExpense(payment.expenseId);
            }

            await db.obligationPayments.delete(payment.id);
        }
    );
}