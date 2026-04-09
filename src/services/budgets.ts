import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
} from 'firebase/firestore';
import { db } from './firebase';
import { Budget } from '../types/transaction';

function budgetsRef(uid: string) {
  return collection(db, 'users', uid, 'budgets');
}

export async function getBudgets(uid: string): Promise<Budget[]> {
  const snap = await getDocs(budgetsRef(uid));
  return snap.docs.map((d) => ({ categoryId: d.id, ...d.data() } as Budget));
}

export async function setBudget(uid: string, budget: Budget): Promise<void> {
  await setDoc(doc(budgetsRef(uid), budget.categoryId), {
    amount: budget.amount,
    period: budget.period,
    currency: budget.currency,
  });
}

export async function deleteBudget(uid: string, categoryId: string): Promise<void> {
  await deleteDoc(doc(budgetsRef(uid), categoryId));
}
