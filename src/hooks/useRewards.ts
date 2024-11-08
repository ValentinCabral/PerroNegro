import { useState, useEffect } from 'react';
import { db } from '../db/client';
import type { Reward } from '../types';

export function useRewards() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRewards = async () => {
    try {
      setLoading(true);
      const data = await db.getRewards();
      setRewards(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar las recompensas');
      setRewards([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRewards();
  }, []);

  return { rewards, loading, error, refresh: fetchRewards };
}