import { useLiveQuery } from "dexie-react-hooks";

import { db } from "../../db/database";
import { roundMoney } from "../../utils/money";

import { getAccounts } from "../accounts/account.service";
import { calculateAccountBalance } from "../accounts/accountBalance.service";
import { getObligations } from "../obligations/obligation.service";
import { getPaidPeriodKeys } from "../obligations/obligationPayment.service";
import {
    computeReservations,
    type ReservationLine,
} from "../obligations/obligationReserve";
import {
    getBudgetSettlements,
    getBudgets,
} from "../budgets/budget.service";
import {
    budgetLookbackStart,
    computeBudgetReservations,
    getPendingSettlements,
    type BudgetLine,
    type PendingSettlement,
} from "../budgets/budgetReserve";
import type { BudgetSettlement } from "../../types/budget";

export interface BudgetSnapshot {
    /** Sum of all active account balances. */
    actualBalance: number;
    balanceByAccount: Map<string, number>;

    /** Unpaid obligation occurrences (bills). */
    lines: ReservationLine[];
    /** Spending budgets (envelopes). */
    budgetLines: BudgetLine[];
    /** Finished budget windows waiting for a leftover decision. */
    pendingSettlements: PendingSettlement[];
    /** All past budget windows with their outcome. */
    settlements: BudgetSettlement[];

    reservedForBills: number;
    reservedForBudgets: number;
    /** Bills + budgets that must be set aside today. */
    reservedNow: number;
    reservedByAccount: Map<string, number>;

    /** actualBalance minus what must already be set aside. */
    safeToSpend: number;
    /** actualBalance minus every unpaid bill and budget this month. */
    afterBillsThisMonth: number;
    /** Bills + budgets still to pay or spend this month. */
    projectedObligations: number;
}

function mergeByAccount(
    a: Map<string, number>,
    b: Map<string, number>
): Map<string, number> {
    const result = new Map(a);

    for (const [accountId, amount] of b) {
        result.set(
            accountId,
            roundMoney((result.get(accountId) ?? 0) + amount)
        );
    }

    return result;
}

async function loadReserves() {

    const [obligations, paidPeriodKeys, budgets, recentExpenses, settlements] =
        await Promise.all([
            getObligations(),
            getPaidPeriodKeys(),
            getBudgets(),
            db.expenses
                .where("date")
                .aboveOrEqual(budgetLookbackStart().toISOString())
                .toArray(),
            getBudgetSettlements(),
        ]);

    const now = new Date();

    const bills = computeReservations(obligations, paidPeriodKeys, now);
    const envelopes = computeBudgetReservations(
        budgets,
        recentExpenses,
        now,
        settlements
    );
    const pendingSettlements = getPendingSettlements(
        budgets,
        recentExpenses,
        settlements,
        now
    );

    return { bills, envelopes, pendingSettlements, settlements };
}

export async function getBudgetSnapshot(): Promise<BudgetSnapshot> {

    const [accounts, { bills, envelopes, pendingSettlements, settlements }] = await Promise.all([
        getAccounts(),
        loadReserves(),
    ]);

    const balanceByAccount = new Map<string, number>();
    let actualBalance = 0;

    for (const account of accounts) {
        const balance = await calculateAccountBalance(account.id);
        balanceByAccount.set(account.id, balance);
        actualBalance += balance;
    }

    actualBalance = roundMoney(actualBalance);

    const reservedNow = roundMoney(
        bills.reservedNow + envelopes.reservedNow
    );

    const projectedObligations = roundMoney(
        bills.projectedObligations + envelopes.projectedThisMonth
    );

    return {
        actualBalance,
        balanceByAccount,
        lines: bills.lines,
        budgetLines: envelopes.lines,
        pendingSettlements,
        settlements,
        reservedForBills: bills.reservedNow,
        reservedForBudgets: envelopes.reservedNow,
        reservedNow,
        reservedByAccount: mergeByAccount(
            bills.reservedByAccount,
            envelopes.reservedByAccount
        ),
        safeToSpend: roundMoney(actualBalance - reservedNow),
        afterBillsThisMonth: roundMoney(actualBalance - projectedObligations),
        projectedObligations,
    };
}

/** Live budget numbers; re-computes whenever any money table changes. */
export function useBudgetSnapshot(): BudgetSnapshot | undefined {
    return useLiveQuery(() => getBudgetSnapshot(), []);
}

export interface ReserveConflict {
    accountName: string;
    /** Money in the account not set aside for bills or budgets. */
    freeAmount: number;
    reservedAmount: number;
    /** Bills and budgets holding money in this account. */
    reservedFor: string[];
}

/**
 * Returns details when spending `amount` from `accountId` would dip
 * into money reserved for bills or other budgets; null when it is fine.
 *
 * `categoryId`: an expense in a budgeted category may use what is left
 * of that budget, since that is what the money was set aside for.
 * `alreadyDeducted`: the old amount when editing an expense.
 */
export async function getReserveConflict(
    accountId: string,
    amount: number,
    alreadyDeducted = 0,
    categoryId?: string
): Promise<ReserveConflict | null> {

    const [account, balance, { bills, envelopes }, categories] =
        await Promise.all([
            db.accounts.get(accountId),
            calculateAccountBalance(accountId),
            loadReserves(),
            db.categories.toArray(),
        ]);

    const ownBudget = envelopes.lines.find(
        line =>
            line.budget.categoryId === categoryId &&
            line.budget.accountId === accountId
    );

    const blockingBudgets = envelopes.lines.filter(
        line =>
            line !== ownBudget &&
            line.reservedNow > 0 &&
            line.budget.accountId === accountId
    );

    const blockingBills = bills.lines.filter(
        line =>
            line.reservedNow > 0 &&
            line.obligation.accountId === accountId
    );

    const reservedAmount = roundMoney(
        blockingBills.reduce((sum, line) => sum + line.reservedNow, 0) +
        blockingBudgets.reduce((sum, line) => sum + line.reservedNow, 0)
    );

    if (reservedAmount <= 0) {
        return null;
    }

    const spendable = roundMoney(balance + alreadyDeducted);
    const freeAmount = roundMoney(spendable - reservedAmount);

    // Going past the full balance is blocked by the expense service;
    // this only covers the gap between free money and the balance.
    if (amount <= freeAmount || amount > spendable) {
        return null;
    }

    const categoryName = (id: string) =>
        categories.find(category => category.id === id)?.name ?? "a budget";

    const reservedFor = [
        ...new Set([
            ...blockingBills.map(line => line.obligation.name),
            ...blockingBudgets.map(
                line => `${categoryName(line.budget.categoryId)} budget`
            ),
        ]),
    ];

    return {
        accountName: account?.name ?? "this account",
        freeAmount: Math.max(freeAmount, 0),
        reservedAmount,
        reservedFor,
    };
}
