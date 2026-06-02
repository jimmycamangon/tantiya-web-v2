export interface Adjustment {
  id: string;
  accountId: string;
  amount: number;
  reason?: string;
  date: string;
  createdAt: string;
}