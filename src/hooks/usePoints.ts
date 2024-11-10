import { useState, useEffect } from 'react';
import api from '../services/api';
import type { PointsData, Reward } from '../types'; 

export function usePoints(userId?: string) {
  const [data, setData] = useState<PointsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPoints = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data: pointsData } = await api.get(`/customers/${userId}/points`);
      const { data: nextRewards } = await api.get(`/customers/${userId}/next-rewards`);
      setData({
        // Convertir los valores a números antes de configurar el estado
        points: Number(pointsData.points),
        total_spent: Number(pointsData.total_spent),
        next_reward: nextRewards.length > 0 ? nextRewards[0] : null
      });
      setError(null);
    } catch (err) {
      console.error('Error en usePoints:', err);
      setError('Error al cargar los puntos y las próximas recompensas');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPoints();
  }, [userId]);

  return { data, loading, error, refresh: fetchPoints };
}
