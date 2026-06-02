import { db } from "../../db/database";

export async function calculateAccountBalance(
  accountId: string
): Promise<number> {
  const adjustments = await db.adjustments
    .where("accountId")
    .equals(accountId)
    .toArray();

  const adjustmentTotal = adjustments.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  return adjustmentTotal;
}