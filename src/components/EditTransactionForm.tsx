import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Check, X } from 'lucide-react';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import type { Transaction } from '../types';

interface EditTransactionFormProps {
  transaction: Transaction;
  onSave: (amount: number) => Promise<void>;
  onCancel: () => void;
}

export function EditTransactionForm({
  transaction,
  onSave,
  onCancel
}: EditTransactionFormProps) {
  const [amount, setAmount] = useState(transaction.amount.toString());
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    try {
      setLoading(true);
      await onSave(parseFloat(amount));
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
      <Input
        label="Monto de la Compra"
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        min="0"
        step="0.01"
        required
        icon={<CreditCard size={20} />}
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