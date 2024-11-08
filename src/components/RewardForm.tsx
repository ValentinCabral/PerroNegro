import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Gift } from 'lucide-react';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import api from '../services/api';
import toast from 'react-hot-toast';

interface RewardFormProps {
  onSuccess?: () => void;
}

export function RewardForm({ onSuccess }: RewardFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    pointsCost: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    try {
      setLoading(true);
      await api.post('/rewards', {
        name: formData.name,
        pointsCost: parseInt(formData.pointsCost),
        description: formData.description
      });

      setFormData({
        name: '',
        pointsCost: '',
        description: ''
      });
      
      toast.success('Recompensa creada exitosamente');
      onSuccess?.();
    } catch (error) {
      toast.error('Error al crear la recompensa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-center space-x-4 mb-6">
        <Gift className="text-gray-700" size={24} />
        <h2 className="text-xl font-semibold">Nueva Recompensa</h2>
      </div>

      <div className="space-y-6">
        <Input
          label="Nombre de la Recompensa"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="ej: 10% de descuento"
          required
        />

        <Input
          label="Costo en Puntos"
          type="number"
          value={formData.pointsCost}
          onChange={(e) => setFormData({ ...formData, pointsCost: e.target.value })}
          min="0"
          required
        />

        <Input
          label="Descripción"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe los detalles de la recompensa"
          required
        />

        <Button
          type="submit"
          className="w-full"
          loading={loading}
          icon={<Gift size={20} />}
        >
          Crear Recompensa
        </Button>
      </div>
    </form>
  );
}