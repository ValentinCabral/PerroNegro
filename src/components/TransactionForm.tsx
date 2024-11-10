import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, CreditCard, Trash2, User } from 'lucide-react';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import api from '../services/api';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';
import type { User as UserType, Transaction } from '../types';

interface TransactionFormProps {
  onSuccess?: () => void;
}

export function TransactionForm({ onSuccess }: TransactionFormProps) {
  const [dni, setDni] = useState('');
  const [amount, setAmount] = useState('');
  const [customer, setCustomer] = useState<UserType | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const handleSearch = async () => {
    if (!dni.trim()) return;

    try {
      setSearchLoading(true);
      const { data: customerData } = await api.get(`/customers/search?dni=${dni}`);
      
      if (customerData) {
        setCustomer(customerData);
        const { data: transactionsData } = await api.get(`/transactions/user/${customerData.id}`);
        setTransactions(transactionsData);
        toast.success('Cliente encontrado');
      } else {
        setCustomer(null);
        setTransactions([]);
        toast.error('Cliente no encontrado');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Error al buscar cliente');
      setCustomer(null);
      setTransactions([]);
    } finally {
      setSearchLoading(false);
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
      
      // Refresh transactions
      const { data: transactionsData } = await api.get(`/transactions/user/${customer.id}`);
      setTransactions(transactionsData);
      
      // Refresh customer data
      const { data: customerData } = await api.get(`/customers/search?dni=${dni}`);
      setCustomer(customerData);
      
      setAmount('');
      toast.success('Compra registrada exitosamente');
      onSuccess?.();
    } catch (error) {
      console.error('Transaction error:', error);
      toast.error('Error al registrar la compra');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (!window.confirm('¿Estás seguro de eliminar esta transacción?')) return;

    try {
      await api.delete(`/transactions/${transactionId}`);
      
      if (customer) {
        // Refresh transactions
        const { data: transactionsData } = await api.get(`/transactions/user/${customer.id}`);
        setTransactions(transactionsData);
        
        // Refresh customer data
        const { data: customerData } = await api.get(`/customers/search?dni=${dni}`);
        setCustomer(customerData);
      }
      
      toast.success('Transacción eliminada');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Error al eliminar la transacción');
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy HH:mm');
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Input
          placeholder="Buscar por DNI"
          value={dni}
          onChange={(e) => setDni(e.target.value)}
          className="max-w-xs"
        />
        <Button
          onClick={handleSearch}
          loading={searchLoading}
          icon={<Search size={20} />}
        >
          Buscar
        </Button>
      </div>

      {customer && (
        <Card className="bg-green-50 border border-green-200">
          <div className="flex items-center space-x-4">
            <User className="text-green-600" size={24} />
            <div>
              <h3 className="font-semibold">{customer.name}</h3>
              <p className="text-sm text-green-600">
                Puntos actuales: {customer.points} | Total gastado: ${customer.total_spent}
              </p>
            </div>
          </div>
        </Card>
      )}

      {customer && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Monto de la Compra"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
            step="0.01"
            required
          />

          <Button
            type="submit"
            loading={loading}
            icon={<CreditCard size={20} />}
            className="w-full"
          >
            Registrar Compra
          </Button>
        </form>
      )}

      {customer && transactions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Historial de Transacciones</h3>
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-4 rounded-lg shadow-md border border-gray-100"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">${transaction.amount}</p>
                    <p className="text-sm text-gray-600">
                      {formatDate(transaction.created_at)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Puntos: {transaction.points_earned}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="text-red-600 border-red-600 hover:bg-red-50"
                    onClick={() => handleDeleteTransaction(transaction.id)}
                    icon={<Trash2 size={20} />}
                  >
                    Eliminar
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}