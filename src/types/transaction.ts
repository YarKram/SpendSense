export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  tags: string[];
  note: string;
  date: Date;
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType | 'both';
  isDefault: boolean;
}

export interface Budget {
  categoryId: string;
  amount: number;
  period: 'month';
  currency: string;
}

export interface TransactionFilters {
  dateFrom?: Date;
  dateTo?: Date;
  type?: TransactionType | 'all';
  categoryIds?: string[];
  tags?: string[];
  amountMin?: number;
  amountMax?: number;
  searchText?: string;
  sortBy?: 'date' | 'amount';
  sortOrder?: 'asc' | 'desc';
}
