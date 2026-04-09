import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import { Transaction } from '../types/transaction';

function txRef(uid: string) {
  return collection(db, 'users', uid, 'transactions');
}

function toFirestore(tx: Omit<Transaction, 'id'>) {
  return {
    ...tx,
    date: Timestamp.fromDate(tx.date),
    createdAt: Timestamp.fromDate(tx.createdAt),
  };
}

function fromFirestore(id: string, data: Record<string, any>): Transaction {
  return {
    id,
    amount: data.amount,
    type: data.type,
    categoryId: data.categoryId,
    tags: data.tags ?? [],
    note: data.note ?? '',
    date: (data.date as Timestamp).toDate(),
    createdAt: (data.createdAt as Timestamp).toDate(),
  };
}

export function subscribeToTransactions(
  uid: string,
  callback: (transactions: Transaction[]) => void,
): Unsubscribe {
  const q = query(txRef(uid), orderBy('date', 'desc'));
  return onSnapshot(q, (snap) => {
    const transactions = snap.docs.map((d) => fromFirestore(d.id, d.data()));
    callback(transactions);
  });
}

export async function addTransaction(uid: string, tx: Omit<Transaction, 'id'>): Promise<string> {
  const ref = await addDoc(txRef(uid), toFirestore(tx));
  return ref.id;
}

export async function updateTransaction(
  uid: string,
  id: string,
  data: Partial<Omit<Transaction, 'id'>>,
): Promise<void> {
  const payload: Record<string, any> = { ...data };
  if (data.date) payload.date = Timestamp.fromDate(data.date);
  if (data.createdAt) payload.createdAt = Timestamp.fromDate(data.createdAt);
  await updateDoc(doc(txRef(uid), id), payload);
}

export async function deleteTransaction(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(txRef(uid), id));
}
