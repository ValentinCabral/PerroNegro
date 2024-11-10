import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Gift } from 'lucide-react';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import api from '../services/api';
import toast from 'react-hot-toast';
import type { LoyaltyRule } from '../types';

interface EditLoyaltyRuleFormProps {
  rule: LoyaltyRule;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function EditLoyaltyRuleForm({
  rule,
  onSuccess,
  onCancel
}: EditLoyaltyRuleFormProps) {
  const [formData, setFormData] = useState({
    minAmount: rule.minAmount.toString(),
    maxAmount: rule.maxAmount?.toString() || '',
    pointsEarned: rule.pointsEarned.toString(),
    multiplier: rule.multiplier.toString(),
    description: rule.description
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    try {
      setLoading(true);
      await api.patch(`/loyalty-rules/${rule.id}`, {
        minAmount: parseFloat(formData.minAmount),
        maxAmount: formData.maxAmount ? parseFloat(formData.maxAmount) : null,
        pointsEarned: parseInt(formData.pointsEarned),
        multiplier: parseFloat(formData.multiplier),
        description: formData.description
      });
      toast.success('Regla actualizada exitosamente');
      onSuccess?.();
    } catch (error) {
      toast.error('Error al actualizar la regla');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('¿Estás seguro de eliminar esta regla?')) {
      return;
    }

    try {
      setLoading(true);
      await api.delete(`/loyalty-rules/${rule.id}`);
      toast.success('Regla eliminada exitosamente');
      onSuccess?.();
    } catch (error) {
      toast.error('Error al eliminar la regla');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
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

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          className="text-red-600 border-red-600 hover:bg-red-50"
          onClick={handleDelete}
          loading={loading}
        >
          Eliminar Regla
        </Button>

        <div className="space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={loading}
            icon={<Gift size={20} />}
          >
            Actualizar Regla
          </Button>
        </div>
      </div>
    </motion.form>
  );
}