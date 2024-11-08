import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, CreditCard } from 'lucide-react';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import api from '../services/api';
import toast from 'react-hot-toast';
import type { User } from '../types';

interface TransactionFormProps {
  onSuccess?: () => void;
}

export function TransactionForm({ onSuccess }: TransactionFormProps) {
  const [dni, setDni] = useState('');
  const [amount, setAmount] = useState('');
  const [customer, setCustomer] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!dni.trim()) return;

    try {
      setLoading(true);
      const { data } = await api.get(`/customers/search?dni=${dni}`);
      if (data) {
        setCustomer(data);
        toast.success('Cliente encontrado');
      } else {
        setCustomer(null);
        toast.error('Cliente no encontrado');
      }
    } catch (error) {
      toast.error('Error al buscar cliente');
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer || !amount) return;

    try {
      setLoading(true);
      await api.post('/transactions', {
        userId: customer.id,
        amount: parseFloat(amount)
      });
      
      setDni('');
      setAmount('');
      setCustomer(null);
      toast.success('Compra registrada exitosamente');
      onSuccess?.();
    } catch (error) {
      toast.error('Error al registrar la compra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
      <div className="flex items-center space-x-4 mb-6">
        <CreditCard className="text-gray-700" size={24} />
        <h2 className="text-xl font-semibold">Registrar Compra</h2>
      </div>

      <div className="space-y-6">
        <div>
          <Input
            label="DNI del Cliente"
            value={dni}
            onChange={(e) => setDni(e.target.value)}
            placeholder="Ingrese el DNI"
            required
          />
          <Button
            type="button"
            variant="secondary"
            className="mt-2"
            onClick={handleSearch}
            loading={loading}
            icon={<Search size={20} />}
          >
            Buscar Cliente
          </Button>
          {customer && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 p-3 bg-green-50 text-green-700 rounded-md"
            >
              Cliente encontrado: {customer.name}
            </motion.div>
          )}
        </div>

        <Input
          label="Monto de la Compra"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          min="0"
          step="0.01"
          required
          disabled={!customer}
        />

        <Button
          type="submit"
          className="w-full"
          loading={loading}
          disabled={!customer || !amount}
          icon={<CreditCard size={20} />}
        >
          Registrar Compra
        </Button>
      </div>
    </form>
  );
}