import { useEffect, useState } from 'react';
import { subscribeToTransactions } from '../services/transactions';
import { Transaction } from '../types/transaction';

export function useTransactions(uid: string | undefined) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsub = subscribeToTransactions(uid, (txs) => {
      setTransactions(txs);
      setLoading(false);
    });

    return unsub;
  }, [uid]);

  return { transactions, loading };
}
