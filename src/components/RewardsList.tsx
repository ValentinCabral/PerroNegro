import React from 'react';
import { motion } from 'framer-motion';
import { Gift, Trash2 } from 'lucide-react';
import { Button } from './ui/Button';
import api from '../services/api';
import toast from 'react-hot-toast';
import type { Reward } from '../types';

interface RewardsListProps {
  rewards: Reward[];
  userPoints?: number;
  isAdmin?: boolean;
  userId: string; 
  onRewardDelete?: () => void;
  onRewardRedeem?: () => void;
}

export function RewardsList({ 
  rewards, 
  userPoints = 0, 
  isAdmin = false,
  userId,
  onRewardDelete,
  onRewardRedeem
}: RewardsListProps) {
  const handleDelete = async (rewardId: string) => {
    try {
      await api.delete(`/rewards/${rewardId}`);
      toast.success('Recompensa eliminada');
      onRewardDelete?.();
    } catch (error) {
      toast.error('Error al eliminar la recompensa');
    }
  };

  const handleRedeem = async (rewardId: string, userId: string) => {
    try {
      await api.post('/rewards/redeem', { rewardId, userId});
      toast.success('¡Recompensa canjeada exitosamente!');
      onRewardRedeem?.();
    } catch (error) {
      toast.error('Error al canjear la recompensa');
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {rewards.map((reward) => (
        <motion.div
          key={reward.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-3">
              <Gift className="text-yellow-500" size={24} />
              <h3 className="text-lg font-semibold">{reward.name}</h3>
            </div>
            <span className="bg-yellow-100 text-yellow-800 text-sm font-medium px-2.5 py-0.5 rounded">
              {reward.points_cost} pts
            </span>
          </div>

          <p className="text-gray-600 mb-4">{reward.description}</p>

          {isAdmin ? (
            <Button
              variant="outline"
              className="w-full text-red-600 border-red-600 hover:bg-red-50"
              onClick={() => handleDelete(reward.id)}
              icon={<Trash2 size={20} />}
            >
              Eliminar
            </Button>
          ) : (
            <div className="space-y-2">
              <div className="relative pt-1">
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                  <div
                    style={{ 
                      width: `${Math.min((userPoints / reward.points_cost) * 100, 100)}%` 
                    }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-yellow-400"
                  />
                </div>
              </div>
              <Button
                className="w-full"
                disabled={userPoints < reward.points_cost}
                onClick={() => handleRedeem(reward.id, userId)} // Pasa userId como segundo argumento
                icon={<Gift size={20} />}
              >
                {userPoints >= reward.points_cost 
                  ? 'Canjear Recompensa' 
                  : `Te faltan ${reward.points_cost - userPoints} pts`}
              </Button>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
