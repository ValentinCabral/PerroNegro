import { useState, useEffect } from 'react';
import api from '../services/api';
import type { Transaction } from '../types';

export function useTransactions(userId?: string) {
  const [transactions, setTransactions] = useState<Transaction[]>([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await api.get(`/customers/${userId}/transactions`);
      setTransactions(response.data.map((transaction: Transaction) => ({
        id: transaction.id, 
        amount: Number(transaction.amount), 
        points_earned: Number(transaction.points_earned),
        created_at: transaction.created_at 
      })));
      setError(null);
    } catch (err) {
      console.error('Error en useTransactions:', err);
      setError('Error al cargar las transacciones');
      setTransactions([]); // Actualiza el estado con un array vacío en caso de error
      setLoading(false); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [userId]);

  return { transactions, loading, error, refresh: fetchTransactions };
}
