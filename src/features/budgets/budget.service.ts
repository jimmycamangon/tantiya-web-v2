import { db } from "../../db/database";
import type {
    Budget,
    BudgetPeriod,
    BudgetSettlement,
    LeftoverAction,
} from "../../types/budget";
import type { Transfer } from "../../types/transfer";
import { roundMoney } from "../../utils/money";
import { calculateAccountBalance } from "../accounts/accountBalance.service";
import type { PendingSettlement } from "./budgetReserve";

export interface LeftoverSettings {
    leftoverAction: LeftoverAction;
    savingsAccountId?: string;
}

function validateLeftover(accountId: string, settings: LeftoverSettings) {
    if (settings.leftoverAction !== "savings") {
        return;
    }

    if (!settings.savingsAccountId) {
        throw new Error(
            "Choose a savings account for leftovers (add one in Accounts if needed)."
        );
    }

    if (settings.savingsAccountId === accountId) {
        throw new Error(
            "The savings account must be different from the budget's account."
        );
    }
}

function validate(amount: number, categoryId: string, accountId: string) {
    if (!categoryId) {
        throw new Error("Choose a category");
    }

    if (!accountId) {
        throw new Error("Choose an account");
    }

    if (!(amount > 0)) {
        throw new Error("Amount must be greater than zero");
    }
}

export async function getBudgets(): Promise<Budget[]> {
    return db.budgets
        .filter(budget => budget.active)
        .toArray();
}

export async function createBudget(
    categoryId: string,
    accountId: string,
    amount: number,
    period: BudgetPeriod,
    leftover: LeftoverSettings = { leftoverAction: "savings" }
): Promise<Budget> {

    validate(amount, categoryId, accountId);
    validateLeftover(accountId, leftover);

    const existing = await db.budgets
        .where("categoryId")
        .equals(categoryId)
        .filter(budget => budget.active)
        .first();

    if (existing) {
        throw new Error(
            "This category already has a budget. Edit it instead."
        );
    }

    const budget: Budget = {
        id: crypto.randomUUID(),
        categoryId,
        accountId,
        amount,
        period,
        leftoverAction: leftover.leftoverAction,
        savingsAccountId: leftover.leftoverAction === "savings"
            ? leftover.savingsAccountId
            : undefined,
        active: true,
        createdAt: new Date().toISOString(),
    };

    await db.budgets.add(budget);

    return budget;
}

export async function updateBudget(
    budgetId: string,
    changes: Pick<Budget, "accountId" | "amount" | "period"> & LeftoverSettings
): Promise<void> {

    const budget = await db.budgets.get(budgetId);

    if (!budget) {
        throw new Error("Budget not found");
    }

    validate(changes.amount, budget.categoryId, changes.accountId);
    validateLeftover(changes.accountId, changes);

    await db.budgets.update(budgetId, {
        ...changes,
        savingsAccountId: changes.leftoverAction === "savings"
            ? changes.savingsAccountId
            : undefined,
    });
}

export async function deleteBudget(budgetId: string): Promise<void> {
    await db.budgets.update(budgetId, { active: false });
}

export async function getBudgetSettlements(): Promise<BudgetSettlement[]> {
    return db.budgetSettlements.toArray();
}

function formatWindow(pending: PendingSettlement) {
    const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
    return `${pending.window.start.toLocaleDateString("en-PH", options)}–${pending.window.end.toLocaleDateString("en-PH", options)}`;
}

/**
 * Closes a finished budget window and applies the chosen action
 * to its leftover. Saving creates a transfer to the savings account.
 */
export async function settleBudgetWindow(
    pending: PendingSettlement,
    action: LeftoverAction,
    categoryName: string,
    savingsAccountId?: string
): Promise<BudgetSettlement> {

    const { budget, window, leftover } = pending;

    if (action === "savings" && leftover > 0) {
        validateLeftover(budget.accountId, {
            leftoverAction: "savings",
            savingsAccountId,
        });
    }

    return db.transaction(
        "rw",
        [
            db.budgetSettlements,
            db.transfers,
            db.expenses,
            db.incomes,
            db.adjustments,
        ],
        async () => {

            const existing = await db.budgetSettlements
                .where("[budgetId+windowKey]")
                .equals([budget.id, window.key])
                .first();

            if (existing) {
                throw new Error("This budget period is already settled.");
            }

            const now = new Date().toISOString();

            const settlement: BudgetSettlement = {
                id: crypto.randomUUID(),
                budgetId: budget.id,
                windowKey: window.key,
                windowStart: window.start.toISOString(),
                windowEnd: window.end.toISOString(),
                budgetAmount: pending.budgetAmount,
                spent: pending.spent,
                leftover,
                action,
                settledAt: now,
            };

            if (action === "savings" && leftover > 0 && savingsAccountId) {

                const balance = await calculateAccountBalance(budget.accountId);

                if (leftover > balance) {
                    throw new Error(
                        `Not enough balance to move ${leftover.toFixed(2)} to savings.`
                    );
                }

                const transfer: Transfer = {
                    id: crypto.randomUUID(),
                    fromAccountId: budget.accountId,
                    toAccountId: savingsAccountId,
                    amount: leftover,
                    date: now,
                    notes: `${categoryName} budget leftover (${formatWindow(pending)})`,
                    isDeleted: false,
                    createdAt: now,
                };

                await db.transfers.add(transfer);

                settlement.transferId = transfer.id;
                settlement.savingsAccountId = savingsAccountId;
            }

            if (action === "rollover" && leftover > 0 && pending.nextWindowKey) {
                settlement.rolloverToKey = pending.nextWindowKey;
                settlement.rolledOver = roundMoney(
                    Math.min(leftover, pending.rolloverCap)
                );
            }

            await db.budgetSettlements.add(settlement);

            return settlement;
        }
    );
}
