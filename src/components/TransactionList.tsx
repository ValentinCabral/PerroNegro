import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Trash2, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from './ui/Button';
import { EditTransactionForm } from './EditTransactionForm';
import type { Transaction } from '../types';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => Promise<void>;
  onEdit: (id: string, amount: number) => Promise<void>;
}

export function TransactionList({ transactions, onDelete, onEdit }: TransactionListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
    } catch {
      return 'Fecha inválida';
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {transactions.map((transaction) => (
          <motion.div
            key={transaction.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-100"
          >
            {editingId === transaction.id ? (
              <EditTransactionForm
                transaction={transaction}
                onSave={async (amount) => {
                  await onEdit(transaction.id, amount);
                  setEditingId(null);
                }}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="text-gray-400" size={20} />
                    <span className="font-medium text-lg">
                      {formatAmount(transaction.amount)}
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        transaction.type === 'purchase'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {transaction.type === 'purchase' ? 'Compra' : 'Canje'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 space-y-0.5">
                    <p>{formatDate(transaction.created_at)}</p>
                    <p className="font-medium">
                      Puntos: {' '}
                      <span className={transaction.points_earned >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {transaction.points_earned >= 0 ? '+' : ''}
                        {transaction.points_earned} pts
                      </span>
                    </p>
                    {transaction.description && (
                      <p className="text-gray-600">{transaction.description}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingId(transaction.id)}
                    icon={<Edit2 size={16} />}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => onDelete(transaction.id)}
                    icon={<Trash2 size={16} />}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {transactions.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No hay transacciones registradas
        </div>
      )}
    </div>
  );
}