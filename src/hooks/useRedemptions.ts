import { useState, useEffect } from 'react';
import api from '../services/api';
import type { Redemption } from '../types';

export function useRedemptions(userId?: string) {
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRedemptions = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.get(`/customers/${userId}/redemptions`);
      setRedemptions(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar los canjes');
      setRedemptions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRedemptions();
  }, [userId]);

  return { redemptions, loading, error, refresh: fetchRedemptions };
}