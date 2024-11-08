import React from 'react';
import { motion } from 'framer-motion';
import { Gift, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from './ui/Button';
import api from '../services/api';
import toast from 'react-hot-toast';
import type { Redemption } from '../types';

interface RedemptionsListProps {
  redemptions: Redemption[];
  isAdmin?: boolean;
  onStatusChange?: () => void;
}

export function RedemptionsList({ 
  redemptions, 
  isAdmin = false,
  onStatusChange 
}: RedemptionsListProps) {
  const handleStatusChange = async (redemptionId: string, status: 'applied' | 'cancelled') => {
    try {
      await api.patch(`/rewards/redemptions/${redemptionId}/status`, { status });
      toast.success(`Estado actualizado a: ${
        status === 'applied' ? 'Aplicado' : 'Cancelado'
      }`);
      onStatusChange?.();
    } catch (error) {
      toast.error('Error al actualizar el estado');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'applied':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'cancelled':
        return <XCircle className="text-red-500" size={20} />;
      default:
        return <Clock className="text-yellow-500" size={20} />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'applied':
        return 'Aplicado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return 'Pendiente';
    }
  };

  return (
    <div className="space-y-6">
      {redemptions.map((redemption) => (
        <motion.div
          key={redemption.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-3">
              <Gift className="text-yellow-500" size={24} />
              <div>
                <h3 className="text-lg font-semibold">{redemption.reward?.name}</h3>
                <p className="text-sm text-gray-500">
                  {redemption.reward?.description}
                </p>
              </div>
            </div>
            <span className="bg-yellow-100 text-yellow-800 text-sm font-medium px-2.5 py-0.5 rounded">
              {redemption.pointsCost} pts
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600">Fecha de Canje</p>
              <p className="font-medium">
                {format(new Date(redemption.createdAt), 'dd/MM/yyyy HH:mm')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Estado</p>
              <div className="flex items-center space-x-2">
                {getStatusIcon(redemption.status)}
                <span className="font-medium">{getStatusText(redemption.status)}</span>
              </div>
            </div>
          </div>

          {isAdmin && redemption.status === 'pending' && (
            <div className="flex space-x-4 mt-4">
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => handleStatusChange(redemption.id, 'applied')}
                icon={<CheckCircle size={20} />}
              >
                Marcar como Aplicado
              </Button>
              <Button
                variant="outline"
                className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
                onClick={() => handleStatusChange(redemption.id, 'cancelled')}
                icon={<XCircle size={20} />}
              >
                Cancelar Canje
              </Button>
            </div>
          )}

          {isAdmin && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-600">Cliente</p>
              <div className="flex items-center space-x-2">
                <span className="font-medium">{redemption.user?.name}</span>
                <span className="text-gray-400">|</span>
                <span className="text-sm text-gray-600">{redemption.user?.dni}</span>
              </div>
            </div>
          )}
        </motion.div>
      ))}

      {redemptions.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No hay canjes registrados
        </div>
      )}
    </div>
  );
}