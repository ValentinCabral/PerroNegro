import { useState, useEffect } from 'react';
import api from '../services/api';
import type { Reward } from '../types';

export function useRewards() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  const fetchRewards = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/rewards`);
      setRewards(response.data.map((reward: Reward) => ({
        id: reward.id,
        name: reward.name,
        points_cost: reward.points_cost,
        description: reward.description,
        is_active: reward.is_active,
        created_at: reward.created_at
      })));
      setError(null);
    } catch (err) {
      console.error('Error en useRewards:', err);
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
