export interface Transfer {
  id: string;

  fromAccountId: string;
  toAccountId: string;

  amount: number;

  date: string;

  notes?: string;

  isDeleted?: boolean;

  createdAt: string;
}