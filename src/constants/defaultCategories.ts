import { Category } from '../types/transaction';

export const DEFAULT_EXPENSE_CATEGORIES: Omit<Category, 'id'>[] = [
  { name: 'Еда и рестораны', icon: '🍔', color: '#FF6B6B', type: 'expense', isDefault: true },
  { name: 'Продукты', icon: '🛒', color: '#FF8E53', type: 'expense', isDefault: true },
  { name: 'Транспорт', icon: '🚗', color: '#4ECDC4', type: 'expense', isDefault: true },
  { name: 'Жильё и ЖКХ', icon: '🏠', color: '#45B7D1', type: 'expense', isDefault: true },
  { name: 'Здоровье', icon: '💊', color: '#96CEB4', type: 'expense', isDefault: true },
  { name: 'Спорт и фитнес', icon: '🏋️', color: '#88D8B0', type: 'expense', isDefault: true },
  { name: 'Развлечения', icon: '🎬', color: '#FECA57', type: 'expense', isDefault: true },
  { name: 'Одежда', icon: '👗', color: '#FF9FF3', type: 'expense', isDefault: true },
  { name: 'Электроника', icon: '📱', color: '#54A0FF', type: 'expense', isDefault: true },
  { name: 'Образование', icon: '📚', color: '#5F27CD', type: 'expense', isDefault: true },
  { name: 'Путешествия', icon: '✈️', color: '#00D2D3', type: 'expense', isDefault: true },
  { name: 'Красота', icon: '💄', color: '#FF6B9D', type: 'expense', isDefault: true },
  { name: 'Подарки', icon: '🎁', color: '#C44569', type: 'expense', isDefault: true },
  { name: 'Кафе и бары', icon: '☕', color: '#786FA6', type: 'expense', isDefault: true },
  { name: 'Подписки', icon: '📺', color: '#F19066', type: 'expense', isDefault: true },
  { name: 'Прочее', icon: '💸', color: '#778CA3', type: 'expense', isDefault: true },
];

export const DEFAULT_INCOME_CATEGORIES: Omit<Category, 'id'>[] = [
  { name: 'Зарплата', icon: '💼', color: '#2ECC71', type: 'income', isDefault: true },
  { name: 'Фриланс', icon: '💻', color: '#27AE60', type: 'income', isDefault: true },
  { name: 'Бизнес', icon: '🏢', color: '#1ABC9C', type: 'income', isDefault: true },
  { name: 'Инвестиции', icon: '📈', color: '#16A085', type: 'income', isDefault: true },
  { name: 'Подарок / Перевод', icon: '🎉', color: '#3498DB', type: 'income', isDefault: true },
  { name: 'Продажа', icon: '🛍️', color: '#2980B9', type: 'income', isDefault: true },
  { name: 'Прочее', icon: '💰', color: '#8E44AD', type: 'income', isDefault: true },
];

export const ALL_DEFAULT_CATEGORIES = [
  ...DEFAULT_EXPENSE_CATEGORIES,
  ...DEFAULT_INCOME_CATEGORIES,
];
