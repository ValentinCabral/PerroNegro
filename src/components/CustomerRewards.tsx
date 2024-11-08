import React from 'react';
import { motion } from 'framer-motion';
import { History } from 'lucide-react';
import type { Reward } from '../db/models/reward';

interface CustomerRewardsProps {
  points: number;
  availableRewards: Reward[];
}

export function CustomerRewards({ points, availableRewards }: CustomerRewardsProps) {
  const nextReward = availableRewards
    .sort((a, b) => a.points_cost - b.points_cost)
    .find(reward => reward.points_cost > points);

  const pointsNeeded = nextReward ? nextReward.points_cost - points : 0;

  return (
    <div className="bg-white rounded-lg p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Próxima Recompensa</h2>
        <History size={24} />
      </div>
      {nextReward ? (
        <>
          <p className="text-sm text-gray-600 mb-2">{nextReward.name}</p>
          <p className="text-sm font-medium text-yellow-600">
            Te faltan {pointsNeeded} pts
          </p>
          <div className="relative pt-1">
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200 mt-2">
              <div
                style={{ width: `${(points / nextReward.points_cost) * 100}%` }}
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
    </div>
  );
}