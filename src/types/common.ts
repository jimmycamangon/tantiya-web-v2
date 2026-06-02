export type FundingRule =
  | "previous_cutoff"
  | "current_cutoff"
  | "split_cutoffs";

export type RecurrenceType =
  | "monthly"
  | "weekly"
  | "yearly"
  | "one_time";