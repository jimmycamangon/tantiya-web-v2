import type { FundingRule, RecurrenceType } from "./common";

export interface Obligation {
  id: string;

  name: string;

  amount: number;

  recurrenceType: RecurrenceType;

  dueDay: number;

  /**
   * Month of the year (1-12) for yearly obligations.
   * Older records may not have it; they fall back to createdAt.
   */
  dueMonth?: number;

  accountId: string;

  fundingRule: FundingRule;

  active: boolean;

  createdAt: string;
}