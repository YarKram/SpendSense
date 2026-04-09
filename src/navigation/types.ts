import { TransactionType } from '../types/transaction';

export type AppStackParamList = {
  MainTabs: undefined;
  AddTransaction: { defaultType?: TransactionType; editId?: string };
  Profile: undefined;
  Categories: undefined;
  Transactions: undefined;
};

export type TabParamList = {
  Home: undefined;
  Transactions: undefined;
  Analytics: undefined;
  Budgets: undefined;
  ProfileTab: undefined;
};
