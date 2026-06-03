import { db } from "../../db/database";
import type { Income } from "../../types/income";
import { getCurrentCutoff } from "../cutoffs/getCurrentCutoff";

export async function createIncome(
    amount: number,
    accountId: string,
    notes?: string
): Promise<Income> {

    if (amount <= 0) {
        throw new Error(
            "Amount must be greater than zero"
        );
    }

    const now = new Date();

    const cutoff =
        getCurrentCutoff(now);

    const income: Income = {
        id: crypto.randomUUID(),
        amount,
        accountId,
        cutoffId: cutoff.id,
        date: now.toISOString(),
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
  notes?: string
): Promise<void> {

  if (amount <= 0) {
    throw new Error(
      "Amount must be greater than zero"
    );
  }

  await db.incomes.update(
    incomeId,
    {
      amount,
      notes,
    }
  );
}