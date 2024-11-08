import React from 'react';
import { CreditCard, Gift, History } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { usePoints } from '../hooks/usePoints';
import { useTransactions } from '../hooks/useTransactions';
import { useRewards } from '../hooks/useRewards';
import { useRedemptions } from '../hooks/useRedemptions';
import { Card } from '../components/ui/Card';
import { RewardsList } from '../components/RewardsList';
import { RedemptionsList } from '../components/RedemptionsList';
import { format } from 'date-fns';

export function Customer() {
  const { user } = useAuth();
  const { data: pointsData, loading: pointsLoading, refresh: refreshPoints } = usePoints(user?.id);
  const { transactions, loading: transactionsLoading } = useTransactions(user?.id);
  const { rewards, loading: rewardsLoading } = useRewards();
  const { redemptions, loading: redemptionsLoading, refresh: refreshRedemptions } = useRedemptions(user?.id);

  if (pointsLoading || transactionsLoading || rewardsLoading || redemptionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-black to-gray-800 text-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Puntos Disponibles</h2>
              <Gift className="text-yellow-400" size={24} />
            </div>
            <p className="text-3xl font-bold">{pointsData?.points || 0} pts</p>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Total Gastado</h2>
              <CreditCard size={24} />
            </div>
            <p className="text-3xl font-bold">${pointsData?.totalSpent || 0}</p>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Próxima Recompensa</h2>
              <History size={24} />
            </div>
            {pointsData?.nextReward ? (
              <>
                <p className="text-sm text-gray-600 mb-2">{pointsData.nextReward.name}</p>
                <p className="text-sm font-medium text-yellow-600">
                  Te faltan {pointsData.nextReward.pointsNeeded} pts
                </p>
                <div className="relative pt-1">
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200 mt-2">
                    <div
                      style={{ width: `${pointsData.nextReward.progress}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-yellow-400"
                    ></div>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-600">
                ¡Tienes puntos suficientes para canjear recompensas!
              </p>
            )}
          </Card>
        </div>

        <Card className="mb-8">
          <h2 className="text-xl font-semibold mb-6">Recompensas Disponibles</h2>
          <RewardsList
            rewards={rewards}
            userPoints={pointsData?.points || 0}
            onRewardRedeem={() => {
              refreshPoints();
              refreshRedemptions();
            }}
          />
        </Card>

        <Card className="mb-8">
          <h2 className="text-xl font-semibold mb-6">Mis Canjes</h2>
          <RedemptionsList redemptions={redemptions} />
        </Card>

        <Card>
          <h2 className="text-xl font-semibold mb-4">Historial de Transacciones</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">Fecha</th>
                  <th className="px-4 py-2 text-left">Tipo</th>
                  <th className="px-4 py-2 text-left">Monto</th>
                  <th className="px-4 py-2 text-left">Puntos</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <motion.tr
                    key={transaction.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-t"
                  >
                    <td className="px-4 py-2">
                      {format(new Date(transaction.createdAt), 'dd/MM/yyyy')}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          transaction.type === 'purchase'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {transaction.type === 'purchase' ? 'Compra' : 'Canje'}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {transaction.type === 'purchase' ? `$${transaction.amount}` : '-'}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={
                          transaction.pointsEarned >= 0 ? 'text-green-600' : 'text-red-600'
                        }
                      >
                        {transaction.pointsEarned >= 0 ? '+' : ''}
                        {transaction.pointsEarned} pts
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}