import api from './api';
import type { LoyaltyRule } from '../types';

interface ApiLoyaltyRule {
  id: string;
  min_amount: number;
  max_amount: number | null;
  points_earned: number;
  multiplier: number;
  description: string;
  is_active: boolean;
  created_at: string;
}

function transformRule(rule: ApiLoyaltyRule): LoyaltyRule {
  return {
    id: rule.id,
    minAmount: rule.min_amount,
    maxAmount: rule.max_amount,
    pointsEarned: rule.points_earned,
    multiplier: rule.multiplier,
    description: rule.description,
    isActive: rule.is_active,
    createdAt: rule.created_at
  };
}

export async function createLoyaltyRule(data: {
  minAmount: number;
  maxAmount?: number;
  pointsEarned: number;
  multiplier: number;
  description: string;
}): Promise<LoyaltyRule> {
  const { data: response } = await api.post<ApiLoyaltyRule>('/loyalty-rules', {
    min_amount: data.minAmount,
    max_amount: data.maxAmount,
    points_earned: data.pointsEarned,
    multiplier: data.multiplier,
    description: data.description
  });
  return transformRule(response);
}

export async function getLoyaltyRules(): Promise<LoyaltyRule[]> {
  const { data } = await api.get<ApiLoyaltyRule[]>('/loyalty-rules');
  return data.map(transformRule);
}