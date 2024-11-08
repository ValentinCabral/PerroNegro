import { useState, useEffect } from 'react';
import { db, type PointsData } from '../db/client';

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
      const pointsData = await db.getUserPoints(userId);
      setData(pointsData);
      setError(null);
    } catch (err) {
      setError('Error al cargar los puntos');
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