import { db } from "../../db/database";
import type { Expense } from "../../types/expense";
import { getCurrentCutoff } from "../cutoffs/getCurrentCutoff";

export async function createExpense(
  amount: number,
  categoryId: string,
  accountId: string,
  notes?: string
): Promise<Expense> {
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