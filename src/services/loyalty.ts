import api from './api';
import type { LoyaltyRule } from '../types';

export async function createLoyaltyRule(data: {
  minAmount: number;
  maxAmount?: number;
  pointsEarned: number;
  multiplier: number;
  description: string;
}): Promise<LoyaltyRule> {
  const { data: response } = await api.post('/loyalty-rules', data);
  return response;
}

export async function getLoyaltyRules(): Promise<LoyaltyRule[]> {
  const { data } = await api.get('/loyalty-rules');
  return data;
}