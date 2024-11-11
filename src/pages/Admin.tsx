import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, CreditCard, Gift, Award, History, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { CustomersList } from '../components/CustomersList';
import { TransactionForm } from '../components/TransactionForm';
import { LoyaltyRuleForm } from '../components/LoyaltyRuleForm';
import { RewardForm } from '../components/RewardForm';
import { RewardsList } from '../components/RewardsList';
import { RedemptionsList } from '../components/RedemptionsList';
import { RulesList } from '../components/RulesList';
import { Card } from '../components/ui/Card';
import { ErrorBoundary } from '../components/ErrorBoundary';
import api from '../services/api';
import type { LoyaltyRule, Reward, Redemption } from '../types';

const tabs = [
  { id: 'customers', label: 'Clientes', icon: Users },
  { id: 'transactions', label: 'Registrar Compras', icon: CreditCard },
  { id: 'rules', label: 'Reglas de Puntos', icon: Gift },
  { id: 'rewards', label: 'Recompensas', icon: Award },
  { id: 'redemptions', label: 'Canjes', icon: History },
  { id: 'backup', label: 'Backup', icon: Download } // Nueva pestaña para el backup
];

export function Admin() {
  const [activeTab, setActiveTab] = useState('customers');
  const [rules, setRules] = useState<LoyaltyRule[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'rules') fetchRules();
    if (activeTab === 'rewards') fetchRewards();
    if (activeTab === 'redemptions') fetchRedemptions();
  }, [activeTab]);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/loyalty-rules');
      const transformedRules = data.map((rule: any) => ({
        id: rule.id,
        minAmount: rule.min_amount,
        maxAmount: rule.max_amount,
        pointsEarned: rule.points_earned,
        multiplier: rule.multiplier,
        description: rule.description,
        isActive: rule.is_active,
        createdAt: rule.created_at
      }));
      setRules(transformedRules);
    } catch (error) {
      toast.error('Error al cargar las reglas');
      setRules([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRewards = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/rewards');
      setRewards(data);
    } catch (error) {
      toast.error('Error al cargar las recompensas');
      setRewards([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRedemptions = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/rewards/redemptions');
      setRedemptions(data);
    } catch (error) {
      toast.error('Error al cargar los canjes');
      setRedemptions([]);
    } finally {
      setLoading(false);
    }
  };

  const downloadBackup = async () => {
    try {
      const response = await api.get('/backup', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'database-backup.sqlite');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success('Backup descargado exitosamente');
    } catch (error) {
      toast.error('Error al descargar el backup');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold mb-8"
        >
          Panel de Administración
        </motion.h1>

        <div className="mb-8">
          <nav className="flex space-x-4 overflow-x-auto pb-2">
            {tabs.map(({ id, label, icon: Icon }) => (
              <motion.button
                key={id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === id
                    ? 'bg-black text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon size={20} />
                <span>{label}</span>
              </motion.button>
            ))}
          </nav>
        </div>

        <ErrorBoundary>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'customers' && (
                <Card>
                  <CustomersList />
                </Card>
              )}
              {activeTab === 'transactions' && (
                <Card>
                  <TransactionForm onSuccess={() => toast.success('Compra registrada exitosamente')} />
                </Card>
              )}
              {activeTab === 'rules' && (
                <div className="space-y-6">
                  <Card>
                    <h2 className="text-xl font-semibold mb-6">Nueva Regla de Puntos</h2>
                    <LoyaltyRuleForm onSuccess={fetchRules} />
                  </Card>
                  <Card>
                    <h2 className="text-xl font-semibold mb-6">Reglas Actuales</h2>
                    {loading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                      </div>
                    ) : (
                      <RulesList rules={rules} onRuleChange={fetchRules} />
                    )}
                  </Card>
                </div>
              )}
              {activeTab === 'rewards' && (
                <div className="space-y-6">
                  <Card>
                    <h2 className="text-xl font-semibold mb-6">Nueva Recompensa</h2>
                    <RewardForm onSuccess={fetchRewards} />
                  </Card>
                  <Card>
                    <h2 className="text-xl font-semibold mb-6">Recompensas Disponibles</h2>
                    {loading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                      </div>
                    ) : (
                      <RewardsList 
                        rewards={rewards} 
                        isAdmin 
                        onRewardDelete={fetchRewards}
                      />
                    )}
                  </Card>
                </div>
              )}
              {activeTab === 'redemptions' && (
                <Card>
                  <h2 className="text-xl font-semibold mb-6">Historial de Canjes</h2>
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                      </div>
                  ) : (
                    <RedemptionsList 
                      redemptions={redemptions} 
                      isAdmin 
                      onStatusChange={fetchRedemptions}
                    />
                  )}
                </Card>
              )}
              {activeTab === 'backup' && (
                <Card>
                  <h2 className="text-xl font-semibold mb-6">Descargar Backup</h2>
                  <button
                    onClick={downloadBackup}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Descargar Backup
                  </button>
                </Card>
              )}
            </motion.div>
          </AnimatePresence>
        </ErrorBoundary>
      </div>
    </div>
  );
}
