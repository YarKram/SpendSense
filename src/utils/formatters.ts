import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);
dayjs.locale('ru');

export function formatCurrency(amount: number, currency = 'RUB'): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: Date): string {
  return dayjs(date).format('D MMM YYYY');
}

export function formatDateShort(date: Date): string {
  return dayjs(date).format('D MMM');
}

export function formatDateFull(date: Date): string {
  return dayjs(date).format('D MMMM YYYY');
}

export function formatMonthYear(date: Date): string {
  return dayjs(date).format('MMMM YYYY');
}

export function formatMonth(date: Date): string {
  return dayjs(date).format('MMM');
}

export function formatDayOfWeek(date: Date): string {
  return dayjs(date).format('dd');
}

export function isSameDay(a: Date, b: Date): boolean {
  return dayjs(a).isSame(dayjs(b), 'day');
}

export function isSameMonth(a: Date, b: Date): boolean {
  return dayjs(a).isSame(dayjs(b), 'month');
}

export function startOfMonth(date: Date): Date {
  return dayjs(date).startOf('month').toDate();
}

export function endOfMonth(date: Date): Date {
  return dayjs(date).endOf('month').toDate();
}

export function startOfYear(date: Date): Date {
  return dayjs(date).startOf('year').toDate();
}

export function endOfYear(date: Date): Date {
  return dayjs(date).endOf('year').toDate();
}

export function subtractDays(date: Date, days: number): Date {
  return dayjs(date).subtract(days, 'day').toDate();
}

export function subtractMonths(date: Date, months: number): Date {
  return dayjs(date).subtract(months, 'month').toDate();
}
