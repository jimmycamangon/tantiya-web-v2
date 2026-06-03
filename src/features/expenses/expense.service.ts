import { db } from "../../db/database";
import type { Expense } from "../../types/expense";
import { getCurrentCutoff } from "../cutoffs/getCurrentCutoff";

export async function createExpense(
  amount: number,
  categoryId: string,
  accountId: string,
  notes?: string
): Promise<Expense> {

  if (amount <= 0) {
    throw new Error(
      "Amount must be greater than zero"
    );
  }
  const now = new Date();

  const cutoff = getCurrentCutoff(now);

  const expense: Expense = {
    id: crypto.randomUUID(),
    amount,
    categoryId,
    accountId,
    cutoffId: cutoff.id,
    date: now.toISOString(),
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
  notes?: string
): Promise<void> {

  if (amount <= 0) {
    throw new Error(
      "Amount must be greater than zero"
    );
  }


  await db.expenses.update(expenseId, {
    amount,
    notes,
  });
}