import { db } from "../../db/database";

export async function getAccountBalance(
  accountId: string
): Promise<number> {
  const adjustments = await db.adjustments
    .where("accountId")
    .equals(accountId)
    .toArray();

  const totalAdjustments = adjustments.reduce(
    (sum, adjustment) => sum + adjustment.amount,
    0
  );

  return totalAdjustments;
}