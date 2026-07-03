import { db } from "../../db/database";

import type { Obligation } from "../../types/obligation";
import type { ObligationPayment } from "../../types/obligationPayment";

import {
    createExpense,
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

    if (payment.expenseId) {
        await softDeleteExpense(payment.expenseId);
    }

    await db.obligationPayments.delete(payment.id);
}
