export interface ObligationPayment {
  id: string;
  obligationId: string;
  /**
   * Identifies the recurrence period this payment covers:
   * monthly "2026-07", weekly "2026-W27", yearly "2026", one_time "once".
   */
  periodKey: string;
  amount: number;
  paidDate: string;
  /** Set when the payment also created an expense record. */
  expenseId?: string;
  createdAt: string;
}
