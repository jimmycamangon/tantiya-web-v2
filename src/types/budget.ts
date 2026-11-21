/**
 * When a spending budget is active and money is set aside for it.
 *
 * - each_cutoff:   half the monthly amount in each semi-monthly cutoff
 * - first_cutoff:  the full amount, only from the 1st to the 15th
 * - second_cutoff: the full amount, only from the 16th to month end
 * - monthly:       the full amount for the whole month
 */
export type BudgetPeriod =
  | "each_cutoff"
  | "first_cutoff"
  | "second_cutoff"
  | "monthly";

/**
 * What happens to money left in a budget when its window ends.
 *
 * - savings:  transferred to a savings account
 * - rollover: added to the budget's next window
 * - release:  goes back to Safe to Spend
 */
export type LeftoverAction = "savings" | "rollover" | "release";

/**
 * A spending envelope for variable costs with no due date
 * (gas, groceries, load). Expenses in its category draw it down.
 */
export interface Budget {
  id: string;
  categoryId: string;
  /** Account the money is set aside in. */
  accountId: string;
  /** Amount per month. */
  amount: number;
  period: BudgetPeriod;
  /** Defaults to "savings" when missing (older records). */
  leftoverAction?: LeftoverAction;
  /** Where leftovers go when leftoverAction is "savings". */
  savingsAccountId?: string;
  active: boolean;
  createdAt: string;
}

/**
 * The outcome of one finished budget window: what was budgeted,
 * spent and left, and what was done with the leftover.
 */
export interface BudgetSettlement {
  id: string;
  budgetId: string;
  /** Window this settlement closes, e.g. "2026-11-1" (cutoff) or "2026-11" (month). */
  windowKey: string;
  windowStart: string;
  windowEnd: string;
  /** Budget for the window, including any amount rolled in. */
  budgetAmount: number;
  spent: number;
  /** max(budgetAmount - spent, 0) */
  leftover: number;
  action: LeftoverAction;
  /** Window that receives the leftover when action is "rollover". */
  rolloverToKey?: string;
  /** Amount actually carried over (capped). */
  rolledOver?: number;
  /** Transfer created when action is "savings". */
  transferId?: string;
  savingsAccountId?: string;
  settledAt: string;
}
