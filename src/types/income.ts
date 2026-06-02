export interface Income {
  id: string;
  amount: number;
  accountId: string;
  cutoffId: string;
  date: string;
  notes?: string;
  createdAt: string;
}