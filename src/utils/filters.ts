import dayjs from 'dayjs';
import { Transaction, TransactionFilters } from '../types/transaction';

export function filterTransactions(
  transactions: Transaction[],
  filters: TransactionFilters,
): Transaction[] {
  let result = [...transactions];

  if (filters.type && filters.type !== 'all') {
    result = result.filter((t) => t.type === filters.type);
  }

  if (filters.dateFrom) {
    result = result.filter((t) => dayjs(t.date).isAfter(dayjs(filters.dateFrom).subtract(1, 'ms')));
  }

  if (filters.dateTo) {
    result = result.filter((t) => dayjs(t.date).isBefore(dayjs(filters.dateTo).add(1, 'day')));
  }

  if (filters.categoryIds && filters.categoryIds.length > 0) {
    result = result.filter((t) => filters.categoryIds!.includes(t.categoryId));
  }

  if (filters.tags && filters.tags.length > 0) {
    result = result.filter((t) => filters.tags!.some((tag) => t.tags.includes(tag)));
  }

  if (filters.amountMin !== undefined) {
    result = result.filter((t) => t.amount >= filters.amountMin!);
  }

  if (filters.amountMax !== undefined) {
    result = result.filter((t) => t.amount <= filters.amountMax!);
  }

  if (filters.searchText && filters.searchText.trim() !== '') {
    const lower = filters.searchText.toLowerCase();
    result = result.filter(
      (t) => t.note.toLowerCase().includes(lower) || t.tags.some((tag) => tag.toLowerCase().includes(lower)),
    );
  }

  const sortBy = filters.sortBy ?? 'date';
  const sortOrder = filters.sortOrder ?? 'desc';

  result.sort((a, b) => {
    let diff = 0;
    if (sortBy === 'date') {
      diff = new Date(a.date).getTime() - new Date(b.date).getTime();
    } else {
      diff = a.amount - b.amount;
    }
    return sortOrder === 'asc' ? diff : -diff;
  });

  return result;
}

export function groupTransactionsByDate(transactions: Transaction[]): { date: string; data: Transaction[] }[] {
  const groups: Record<string, Transaction[]> = {};

  transactions.forEach((t) => {
    const key = dayjs(t.date).format('YYYY-MM-DD');
    if (!groups[key]) groups[key] = [];
    groups[key].push(t);
  });

  return Object.entries(groups)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, data]) => ({ date, data }));
}

export function getAllTags(transactions: Transaction[]): string[] {
  const tags = new Set<string>();
  transactions.forEach((t) => t.tags.forEach((tag) => tags.add(tag)));
  return Array.from(tags).sort();
}
