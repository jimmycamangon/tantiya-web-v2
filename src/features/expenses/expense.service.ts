import { db } from "../../db/database";
import type { Expense } from "../../types/expense";
import { getCurrentCutoff } from "../cutoffs/getCurrentCutoff";
import { toDateKey, toEntryDate } from "../../utils/entryDate";

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

  await db.expenses.add(expense);

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

  const expense = await db.expenses.get(expenseId);

  if (!expense) {
    throw new Error("Expense not found");
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
}