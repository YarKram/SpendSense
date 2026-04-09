import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import { Category } from '../types/transaction';
import { ALL_DEFAULT_CATEGORIES } from '../constants/defaultCategories';

function categoriesRef(uid: string) {
  return collection(db, 'users', uid, 'categories');
}

export async function seedDefaultCategories(uid: string): Promise<void> {
  const existing = await getDocs(categoriesRef(uid));
  if (existing.size > 0) return;

  const batch = writeBatch(db);
  ALL_DEFAULT_CATEGORIES.forEach((cat) => {
    const ref = doc(categoriesRef(uid));
    batch.set(ref, cat);
  });
  await batch.commit();
}

export async function getCategories(uid: string): Promise<Category[]> {
  const snap = await getDocs(query(categoriesRef(uid), orderBy('name')));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Category));
}

export async function addCategory(uid: string, data: Omit<Category, 'id'>): Promise<string> {
  const ref = await addDoc(categoriesRef(uid), data);
  return ref.id;
}

export async function updateCategory(uid: string, id: string, data: Partial<Omit<Category, 'id'>>): Promise<void> {
  await updateDoc(doc(categoriesRef(uid), id), data);
}

export async function deleteCategory(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(categoriesRef(uid), id));
}
