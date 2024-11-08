import { useState, useEffect } from 'react';
import { db, type TransactionData } from '../db/client';

export function useTransactions(userId?: string) {
  const [data, setData] = useState<TransactionData>({
    transactions: [],
    loading: true,
    error: null
  });

  const fetchTransactions = async () => {
    if (!userId) {
      setData(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      setData(prev => ({ ...prev, loading: true }));
      const transactions = await db.getUserTransactions(userId);
      setData({
        transactions,
        loading: false,
        error: null
      });
    } catch (err) {
      setData({
        transactions: [],
        loading: false,
        error: 'Error al cargar las transacciones'
      });
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [userId]);

  return { ...data, refresh: fetchTransactions };
}