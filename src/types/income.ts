export interface Income {
  id: string;
  amount: number;
  accountId: string;
  cutoffId: string;
  date: string;
  notes?: string;
  isDeleted?: boolean;
  createdAt: string;
}