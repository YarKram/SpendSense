import { useEffect, useState } from 'react';
import { getBudgets } from '../services/budgets';
import { Budget } from '../types/transaction';

export function useBudgets(uid: string | undefined) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    if (!uid) return;
    setLoading(true);
    const data = await getBudgets(uid);
    setBudgets(data);
    setLoading(false);
  };

  useEffect(() => {
    reload();
  }, [uid]);

  return { budgets, loading, reload };
}
