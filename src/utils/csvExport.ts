import { Transaction } from '../types/transaction';
import { Category } from '../types/transaction';
import dayjs from 'dayjs';

export function transactionsToCsv(transactions: Transaction[], categories: Category[]): string {
  const header = ['Дата', 'Тип', 'Категория', 'Сумма', 'Теги', 'Заметка'].join(';');

  const rows = transactions.map((t) => {
    const cat = categories.find((c) => c.id === t.categoryId);
    return [
      dayjs(t.date).format('DD.MM.YYYY'),
      t.type === 'income' ? 'Доход' : 'Расход',
      cat?.name ?? '',
      t.amount,
      t.tags.join(', '),
      t.note.replace(/;/g, ','),
    ].join(';');
  });

  return [header, ...rows].join('\n');
}
