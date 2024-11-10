import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import api from '../services/api';
import toast from 'react-hot-toast';

interface LoyaltyRuleFormProps {
  onSuccess?: () => void;
}

export function LoyaltyRuleForm({ onSuccess }: LoyaltyRuleFormProps) {
  const [formData, setFormData] = useState({
    minAmount: '',
    maxAmount: '',
    pointsEarned: '',
    multiplier: '1',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    try {
      setLoading(true);
      await api.post('/loyalty-rules', {
        minAmount: parseFloat(formData.minAmount),
        maxAmount: formData.maxAmount ? parseFloat(formData.maxAmount) : undefined,
        pointsEarned: parseInt(formData.pointsEarned),
        multiplier: parseFloat(formData.multiplier),
        description: formData.description
      });

      setFormData({
        minAmount: '',
        maxAmount: '',
        pointsEarned: '',
        multiplier: '1',
        description: ''
      });
      
      toast.success('Regla creada exitosamente');
      onSuccess?.();
    } catch (error) {
      toast.error('Error al crear la regla');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Monto Mínimo ($)"
          type="number"
          value={formData.minAmount}
          onChange={(e) => setFormData({ ...formData, minAmount: e.target.value })}
          min="0"
          step="0.01"
          required
        />

        <Input
          label="Monto Máximo ($)"
          type="number"
          value={formData.maxAmount}
          onChange={(e) => setFormData({ ...formData, maxAmount: e.target.value })}
          min="0"
          step="0.01"
          placeholder="Opcional"
        />

        <Input
          label="Puntos Base"
          type="number"
          value={formData.pointsEarned}
          onChange={(e) => setFormData({ ...formData, pointsEarned: e.target.value })}
          min="0"
          required
        />

        <Input
          label="Multiplicador"
          type="number"
          value={formData.multiplier}
          onChange={(e) => setFormData({ ...formData, multiplier: e.target.value })}
          min="1"
          step="0.1"
          required
        />
      </div>

      <Input
        label="Descripción"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        required
      />

      <Button
        type="submit"
        className="w-full"
        loading={loading}
        icon={<Plus size={20} />}
      >
        Crear Regla
      </Button>
    </motion.form>
  );
}