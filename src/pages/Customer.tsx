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
import { TransactionList } from '../components/TransactionList';


export function Customer() {
  const { user } = useAuth();
  const { data: pointsData, loading: pointsLoading, refresh: refreshPoints } = usePoints(user?.id);
  const { transactions, loading: transactionsLoading } = useTransactions(user?.id);
  const { rewards, loading: rewardsLoading } = useRewards();
  const { redemptions, loading: redemptionsLoading, refresh: refreshRedemptions } = useRedemptions(user?.id);

  // Verificar si todos los datos se han cargado
  if (pointsLoading || transactionsLoading || rewardsLoading || redemptionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Si hay algún error al cargar los datos
  if (!pointsData || !transactions || !rewards || !redemptions) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Error al cargar datos del cliente. Intenta actualizar la página.</p>
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
            <p className="text-3xl font-bold">${pointsData?.total_spent || 0}</p>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Próxima Recompensa</h2>
              <History size={24} />
            </div>
            {pointsData?.next_reward ? (
              <>
                <p className="text-sm text-gray-600 mb-2">{pointsData.next_reward.name}</p>
                <p className="text-sm font-medium text-yellow-600">
                  Te faltan {
                    pointsData.points >= pointsData.next_reward.points_cost
                      ? 0
                      : pointsData.next_reward.points_cost - pointsData.points
                  } pts
                </p>
                <div className="relative pt-1">
                  <div
                    className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200 mt-2"
                    style={{
                      width: `${
                        pointsData.points >= pointsData.next_reward.points_cost
                          ? 100
                          : (pointsData.points / pointsData.next_reward.points_cost) * 100
                      }%`
                    }}
                  >
                    <div className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-yellow-400" />
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-600">
                ¡No hay una próxima recompensa disponible!
              </p>
            )}
          </Card>
        </div>

        <Card className="mb-8">
          <h2 className="text-xl font-semibold mb-6">Recompensas Disponibles</h2>
          {user && ( // Verifica si user existe
            <RewardsList
            rewards={rewards}
            userPoints={pointsData?.points || 0}
            userId={user.id} // Sólo pasa userId si user existe
            onRewardRedeem={() => {
            refreshPoints();
            refreshRedemptions();
          }}
        />
      )}
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
                      {transaction.created_at} 
                    </td>
                    <td className="px-4 py-2">
                      {`$${transaction.amount}`}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={
                          transaction.points_earned >= 0 ? 'text-green-600' : 'text-red-600'
                        }
                      >
                        {transaction.pointsEarned >= 0 ? '+' : ''}
                        {transaction.points_earned >= 0 ? transaction.points_earned : '0'} pts
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        {/* <Card>
          <h2 className="text-xl font-semibold mb-4">Historial de Transacciones</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">Fecha</th>
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
                      {transaction.created_at} 
                    </td>
                    <td className="px-4 py-2">
                      {transaction.type === 'purchase' ? `$${transaction.amount}` : '-'}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={
                          transaction.points_earned >= 0 ? 'text-green-600' : 'text-red-600'
                        }
                      >
                        {transaction.points_earned >= 0 ? '+' : ''}
                        {transaction.points_earned} pts
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card> */}
      </div>
    </div>
  );
}
