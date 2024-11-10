import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import type { LoyaltyRule } from '../types';

interface EditRuleFormProps {
  rule: LoyaltyRule;
  onSave: (data: Partial<LoyaltyRule>) => Promise<void>;
  onCancel: () => void;
}

export function EditRuleForm({ rule, onSave, onCancel }: EditRuleFormProps) {
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
      await onSave({
        minAmount: parseFloat(formData.minAmount),
        maxAmount: formData.maxAmount ? parseFloat(formData.maxAmount) : null,
        pointsEarned: parseInt(formData.pointsEarned),
        multiplier: parseFloat(formData.multiplier),
        description: formData.description
      });
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
      className="space-y-4"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          icon={<X size={20} />}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          loading={loading}
          icon={<Check size={20} />}
        >
          Guardar
        </Button>
      </div>
    </motion.form>
  );
}