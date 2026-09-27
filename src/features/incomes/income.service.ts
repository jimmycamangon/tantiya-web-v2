import { db } from "../../db/database";
import type { Income } from "../../types/income";
import { getCurrentCutoff } from "../cutoffs/getCurrentCutoff";
import { toDateKey, toEntryDate } from "../../utils/entryDate";

export async function createIncome(
    amount: number,
    accountId: string,
    notes?: string,
    dateKey?: string
): Promise<Income> {

    if (amount <= 0) {
        throw new Error(
            "Amount must be greater than zero"
        );
    }

    const now = new Date();

    const entryDate =
        toEntryDate(dateKey);

    if (entryDate > now) {
        throw new Error(
            "Date cannot be in the future"
        );
    }

    const cutoff =
        getCurrentCutoff(entryDate);

    const income: Income = {
        id: crypto.randomUUID(),
        amount,
        accountId,
        cutoffId: cutoff.id,
        date: entryDate.toISOString(),
        notes,
        isDeleted: false,
        createdAt: now.toISOString(),
    };

    await db.incomes.add(income);

    return income;
}

export async function softDeleteIncome(
  incomeId: string
): Promise<void> {
  await db.incomes.update(
    incomeId,
    {
      isDeleted: true,
    }
  );
}

export async function updateIncome(
  incomeId: string,
  amount: number,
  notes?: string,
  dateKey?: string
): Promise<void> {

  if (amount <= 0) {
    throw new Error(
      "Amount must be greater than zero"
    );
  }

  const income = await db.incomes.get(incomeId);

  if (!income) {
    throw new Error("Income not found");
  }

  const updates: Partial<Income> = {
    amount,
    notes,
  };

  // Only touch the date when it actually changed, so the
  // original time of day is kept for unchanged entries.
  if (dateKey && dateKey !== toDateKey(income.date)) {
    const entryDate = toEntryDate(dateKey);

    if (entryDate > new Date()) {
      throw new Error(
        "Date cannot be in the future"
      );
    }

    updates.date = entryDate.toISOString();
    updates.cutoffId = getCurrentCutoff(entryDate).id;
  }

  await db.incomes.update(incomeId, updates);
}