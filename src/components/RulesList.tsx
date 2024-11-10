import React from 'react';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { Button } from './ui/Button';
import api from '../services/api';
import toast from 'react-hot-toast';
import type { LoyaltyRule } from '../types';

interface RulesListProps {
  rules: LoyaltyRule[];
  onRuleChange: () => void;
}

export function RulesList({ rules, onRuleChange }: RulesListProps) {
  const handleDelete = async (ruleId: string) => {
    try {
      await api.delete(`/loyalty-rules/${ruleId}`);
      toast.success('Regla eliminada');
      onRuleChange();
    } catch (error) {
      toast.error('Error al eliminar la regla');
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  const getRangeText = (rule: LoyaltyRule) => {
    if (!rule?.minAmount) return 'Monto no especificado';
    
    const minFormatted = formatAmount(rule.minAmount);
    if (!rule.maxAmount) return `${minFormatted} o más`;
    
    const maxFormatted = formatAmount(rule.maxAmount);
    return `${minFormatted} - ${maxFormatted}`;
  };

  if (!Array.isArray(rules)) {
    return (
      <div className="text-center py-8 text-gray-500">
        Error al cargar las reglas
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {rules.map((rule) => (
        <motion.div
          key={rule.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-3 flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {rule.description || 'Sin descripción'}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Rango de Compra</p>
                  <p className="text-base text-gray-900">{getRangeText(rule)}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Puntos Base</p>
                  <p className="text-base text-gray-900">
                    {rule.pointsEarned?.toLocaleString() || 0} pts
                  </p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Multiplicador</p>
                  <p className="text-base text-gray-900">
                    x{rule.multiplier?.toLocaleString() || 1}
                  </p>
                </div>
              </div>
            </div>
            
            <Button
              variant="outline"
              className="ml-4 text-red-600 border-red-600 hover:bg-red-50"
              onClick={() => handleDelete(rule.id)}
              icon={<Trash2 size={20} />}
            >
              Eliminar
            </Button>
          </div>
        </motion.div>
      ))}

      {rules.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No hay reglas configuradas
        </div>
      )}
    </div>
  );
}