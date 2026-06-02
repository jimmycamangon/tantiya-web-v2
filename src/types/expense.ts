export interface Expense {
  id: string;
  amount: number;
  categoryId: string;
  accountId: string;
  cutoffId: string;
  date: string;
  notes?: string;
  createdAt: string;
}