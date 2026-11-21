import { db } from "../../db/database";
import type { Expense } from "../../types/expense";
import { getCurrentCutoff } from "../cutoffs/getCurrentCutoff";
import { toDateKey, toEntryDate } from "../../utils/entryDate";
import { roundMoney } from "../../utils/money";
import { calculateAccountBalance } from "../accounts/accountBalance.service";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(amount);
}

// Tables read by calculateAccountBalance plus the expenses table we write to,
// so the balance check and the write happen atomically. Any outer transaction
// that calls createExpense/updateExpense must include all of these tables.
export const expenseBalanceTables = [
  db.expenses,
  db.incomes,
  db.transfers,
  db.adjustments,
  db.accounts,
];

async function assertSufficientBalance(
  accountId: string,
  amount: number,
  // Amount already counted against this account (when editing an expense).
  alreadyDeducted = 0
): Promise<void> {
  const balance = await calculateAccountBalance(accountId);
  const spendable = roundMoney(balance + alreadyDeducted);

  if (roundMoney(amount) > spendable) {
    const account = await db.accounts.get(accountId);
    const name = account?.name ?? "this account";

    throw new Error(
      spendable <= 0
        ? `Not enough balance: ${name} has ${formatCurrency(spendable)}.`
        : `Not enough balance: ${name} only has ${formatCurrency(spendable)} available.`
    );
  }
}

export async function createExpense(
  amount: number,
  categoryId: string,
  accountId: string,
  notes?: string,
  dateKey?: string
): Promise<Expense> {

  if (amount <= 0) {
    throw new Error(
      "Amount must be greater than zero"
    );
  }
  const now = new Date();

  const entryDate = toEntryDate(dateKey);

  if (entryDate > now) {
    throw new Error(
      "Date cannot be in the future"
    );
  }

  const cutoff = getCurrentCutoff(entryDate);

  const expense: Expense = {
    id: crypto.randomUUID(),
    amount,
    categoryId,
    accountId,
    cutoffId: cutoff.id,
    date: entryDate.toISOString(),
    notes,
    isDeleted: false,
    createdAt: now.toISOString(),
  };

  await db.transaction("rw", expenseBalanceTables, async () => {
    await assertSufficientBalance(accountId, amount);
    await db.expenses.add(expense);
  });

  return expense;
}


export async function softDeleteExpense(
  expenseId: string
): Promise<void> {
  await db.expenses.update(expenseId, {
    isDeleted: true,
  });
}

export async function updateExpense(
  expenseId: string,
  amount: number,
  notes?: string,
  dateKey?: string
): Promise<void> {

  if (amount <= 0) {
    throw new Error(
      "Amount must be greater than zero"
    );
  }

  await db.transaction("rw", expenseBalanceTables, async () => {
    const expense = await db.expenses.get(expenseId);

    if (!expense) {
      throw new Error("Expense not found");
    }

    // Only check when the amount grows; lowering an expense is always allowed.
    if (amount > expense.amount && !expense.isDeleted) {
      await assertSufficientBalance(
        expense.accountId,
        amount,
        expense.amount
      );
    }

    const updates: Partial<Expense> = {
      amount,
      notes,
    };

    // Only touch the date when it actually changed, so the
    // original time of day is kept for unchanged entries.
    if (dateKey && dateKey !== toDateKey(expense.date)) {
      const entryDate = toEntryDate(dateKey);

      if (entryDate > new Date()) {
        throw new Error(
          "Date cannot be in the future"
        );
      }

      updates.date = entryDate.toISOString();
      updates.cutoffId = getCurrentCutoff(entryDate).id;
    }

    await db.expenses.update(expenseId, updates);
  });
}
