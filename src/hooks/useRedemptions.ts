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
      const { data } = await api.get('/rewards/redemptions');
      // Mapeo de la data
      setRedemptions(data.map((redemption: Redemption) => ({
        id: redemption.id,
        user_id: redemption.user_id,
        reward_id: redemption.reward_id,
        points_cost: redemption.points_cost,
        status: redemption.status,
        created_at: redemption.created_at,
        applied_at: redemption.applied_at,
        cancelled_at: redemption.cancelled_at,
        user: {
          id: redemption.user?.id || '', // Agregar '' como valor por defecto
          name: redemption.user?.name || '', // Agregar '' como valor por defecto
          email: redemption.user?.email || '', // Agregar '' como valor por defecto
          dni: redemption.user?.dni
        },
        reward: {
          name: redemption.reward?.name || '', // Agregar '' como valor por defecto
          points_cost: redemption.reward?.points_cost || 0, // Agregar 0 como valor por defecto
          description: redemption.reward?.description || '', // Agregar '' como valor por defecto
        },
        transaction: redemption.transaction // Conservar la estructura existente
      })));
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
