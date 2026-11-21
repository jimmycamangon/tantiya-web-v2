import { db } from "../../db/database";
import type { Expense } from "../../types/expense";
import { getCurrentCutoff } from "../cutoffs/getCurrentCutoff";
import { calculateAccountBalance } from "../accounts/accountBalance.service";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(amount);
}

// Tables read by calculateAccountBalance plus the expenses table we write to,
// so the balance check and the write happen atomically.
const balanceTables = [
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
  const spendable = balance + alreadyDeducted;

  if (amount > spendable) {
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

  await db.transaction("rw", balanceTables, async () => {
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
  notes?: string
): Promise<void> {

  if (amount <= 0) {
    throw new Error(
      "Amount must be greater than zero"
    );
  }

  await db.transaction("rw", balanceTables, async () => {
    const existing = await db.expenses.get(expenseId);

    if (!existing) {
      throw new Error("Expense not found");
    }

    // Only check when the amount grows; lowering an expense is always allowed.
    if (amount > existing.amount && !existing.isDeleted) {
      await assertSufficientBalance(
        existing.accountId,
        amount,
        existing.amount
      );
    }

    await db.expenses.update(expenseId, {
      amount,
      notes,
    });
  });
}
