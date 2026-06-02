import type { FundingRule, RecurrenceType } from "./common";

export interface Obligation {
  id: string;
  name: string;
  amount: number;
  recurrenceType: RecurrenceType;
  dueDate: string;
  accountId: string;
  fundingRule: FundingRule;
  active: boolean;
  createdAt: string;
}