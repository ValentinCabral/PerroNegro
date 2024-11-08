import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, CreditCard, Gift, Award, History } from 'lucide-react';
import toast from 'react-hot-toast';
import { CustomersList } from '../components/CustomersList';
import { TransactionForm } from '../components/TransactionForm';
import { LoyaltyRuleForm } from '../components/LoyaltyRuleForm';
import { RewardForm } from '../components/RewardForm';
import { RewardsList } from '../components/RewardsList';
import { RedemptionsList } from '../components/RedemptionsList';
import { Card } from '../components/ui/Card';
import api from '../services/api';
import type { LoyaltyRule, Reward, Redemption } from '../types';

const tabs = [
  { id: 'customers', label: 'Clientes', icon: Users },
  { id: 'transactions', label: 'Registrar Compras', icon: CreditCard },
  { id: 'rules', label: 'Reglas de Puntos', icon: Gift },
  { id: 'rewards', label: 'Recompensas', icon: Award },
  { id: 'redemptions', label: 'Canjes', icon: History }
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
      setRules(data);
    } catch (error) {
      toast.error('Error al cargar las reglas');
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
    } finally {
      setLoading(false);
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
                  <LoyaltyRuleForm onSuccess={fetchRules} />
                </Card>

                <Card>
                  <h2 className="text-xl font-semibold mb-4">Reglas Actuales</h2>
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="px-4 py-2 text-left">Monto Mínimo</th>
                            <th className="px-4 py-2 text-left">Monto Máximo</th>
                            <th className="px-4 py-2 text-left">Puntos Base</th>
                            <th className="px-4 py-2 text-left">Multiplicador</th>
                            <th className="px-4 py-2 text-left">Descripción</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rules.map((rule) => (
                            <motion.tr
                              key={rule.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="border-b"
                            >
                              <td className="px-4 py-2">${rule.minAmount}</td>
                              <td className="px-4 py-2">
                                {rule.maxAmount ? `$${rule.maxAmount}` : 'Sin límite'}
                              </td>
                              <td className="px-4 py-2">{rule.pointsEarned} pts</td>
                              <td className="px-4 py-2">x{rule.multiplier}</td>
                              <td className="px-4 py-2">{rule.description}</td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Card>
              </div>
            )}

            {activeTab === 'rewards' && (
              <div className="space-y-6">
                <Card>
                  <RewardForm onSuccess={fetchRewards} />
                </Card>

                <Card>
                  <h2 className="text-xl font-semibold mb-4">Recompensas Disponibles</h2>
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
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}