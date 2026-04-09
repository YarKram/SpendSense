import { useEffect, useState } from 'react';
import { getCategories } from '../services/categories';
import { Category } from '../types/transaction';

export function useCategories(uid: string | undefined) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    if (!uid) return;
    setLoading(true);
    const cats = await getCategories(uid);
    setCategories(cats);
    setLoading(false);
  };

  useEffect(() => {
    reload();
  }, [uid]);

  return { categories, loading, reload };
}
