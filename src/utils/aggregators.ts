import dayjs from 'dayjs';
import { Transaction, Category } from '../types/transaction';

export interface PeriodSummary {
  label: string;
  income: number;
  expense: number;
  balance: number;
}

export interface CategorySummary {
  categoryId: string;
  name: string;
  icon: string;
  color: string;
  total: number;
  percent: number;
}

export function getTotals(transactions: Transaction[]): {
  income: number;
  expense: number;
  balance: number;
} {
  const income = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  return { income, expense, balance: income - expense };
}

export function getMonthlyTransactions(transactions: Transaction[], date: Date): Transaction[] {
  return transactions.filter((t) => dayjs(t.date).isSame(dayjs(date), 'month'));
}

export function getLast7DaysSummary(transactions: Transaction[]): PeriodSummary[] {
  const result: PeriodSummary[] = [];
  for (let i = 6; i >= 0; i--) {
    const day = dayjs().subtract(i, 'day');
    const dayTx = transactions.filter((t) => dayjs(t.date).isSame(day, 'day'));
    const income = dayTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = dayTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    result.push({ label: day.format('dd'), income, expense, balance: income - expense });
  }
  return result;
}

export function getLast12MonthsSummary(transactions: Transaction[]): PeriodSummary[] {
  const result: PeriodSummary[] = [];
  for (let i = 11; i >= 0; i--) {
    const month = dayjs().subtract(i, 'month');
    const monthTx = transactions.filter((t) => dayjs(t.date).isSame(month, 'month'));
    const income = monthTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = monthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    result.push({ label: month.format('MMM'), income, expense, balance: income - expense });
  }
  return result;
}

export function getYearlySummary(transactions: Transaction[]): PeriodSummary[] {
  const years = new Set(transactions.map((t) => dayjs(t.date).year()));
  return Array.from(years)
    .sort()
    .map((year) => {
      const yearTx = transactions.filter((t) => dayjs(t.date).year() === year);
      const income = yearTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expense = yearTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      return { label: String(year), income, expense, balance: income - expense };
    });
}

export function getCategorySummary(
  transactions: Transaction[],
  categories: Category[],
  type: 'income' | 'expense',
): CategorySummary[] {
  const filtered = transactions.filter((t) => t.type === type);
  const total = filtered.reduce((s, t) => s + t.amount, 0);

  const byCat: Record<string, number> = {};
  filtered.forEach((t) => {
    byCat[t.categoryId] = (byCat[t.categoryId] ?? 0) + t.amount;
  });

  return Object.entries(byCat)
    .map(([catId, amount]) => {
      const cat = categories.find((c) => c.id === catId);
      return {
        categoryId: catId,
        name: cat?.name ?? 'Неизвестно',
        icon: cat?.icon ?? '❓',
        color: cat?.color ?? '#999',
        total: amount,
        percent: total > 0 ? (amount / total) * 100 : 0,
      };
    })
    .sort((a, b) => b.total - a.total);
}

export function getAverageDailyExpense(transactions: Transaction[]): number {
  const expenses = transactions.filter((t) => t.type === 'expense');
  if (expenses.length === 0) return 0;
  const dates = new Set(expenses.map((t) => dayjs(t.date).format('YYYY-MM-DD')));
  const total = expenses.reduce((s, t) => s + t.amount, 0);
  return total / dates.size;
}
