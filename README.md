# 💸 SpendSense

Умный менеджер личных финансов — учёт доходов и расходов с аналитикой, бюджетами и авторизацией через Google.

## Стек

- **React Native + Expo SDK 54**
- **Firebase** (Authentication + Firestore)
- **React Navigation v7** (bottom tabs + native stack)
- **react-native-gifted-charts** (bar, pie, line charts)
- **dayjs** (работа с датами)

## Функциональность

- Авторизация через Google — у каждого пользователя своя учётка
- Добавление доходов и расходов с категориями, тегами и заметками
- Фильтрация операций по сумме, тегам, категориям, периоду
- Аналитика: графики за неделю / месяц / год
- Бюджеты по категориям с прогресс-барами
- Экспорт данных в CSV

## Настройка

### 1. Firebase

1. Создайте проект на [firebase.google.com](https://firebase.google.com)
2. Включите **Authentication** → Google
3. Включите **Firestore Database**
4. Скачайте `google-services.json` (Android) и положите в корень проекта
5. Заполните конфиг в `src/services/firebase.ts`

### 2. Google Sign-In

Укажите **Web Client ID** из Google Cloud Console в `src/services/auth.ts`

### 3. Запуск

```bash
npm install
npx expo start --dev-client
```

### 4. Сборка для Play Market

```bash
npx eas build --platform android
```

## Структура

```
src/
├── components/     # Переиспользуемые компоненты
├── constants/      # Тема, дефолтные категории
├── hooks/          # useTransactions, useCategories, useBudgets
├── navigation/     # AppNavigator, types
├── screens/        # Все экраны
├── services/       # Firebase, Auth, Firestore CRUD
├── store/          # AuthContext
├── types/          # TypeScript типы
└── utils/          # Форматирование, фильтрация, агрегация
```
