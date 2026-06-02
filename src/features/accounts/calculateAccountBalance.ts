import { db } from "../../db/database";

export async function calculateAccountBalance(
  accountId: string
): Promise<number> {

  const adjustments = await db.adjustments
    .where("accountId")
    .equals(accountId)
    .toArray();

  const expenses = await db.expenses
    .where("accountId")
    .equals(accountId)
    .toArray();

  const adjustmentTotal = adjustments.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  const expenseTotal = expenses
    .filter(expense => !expense.isDeleted)
    .reduce(
      (sum, expense) => sum + expense.amount,
      0
    );

  return adjustmentTotal - expenseTotal;
}