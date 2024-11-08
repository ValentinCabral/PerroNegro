import type { LoyaltyRule } from '../db/models/loyaltyRule';

export function calculatePoints(amount: number, rules: LoyaltyRule[]): number {
  let points = 0;

  // Sort rules by min_amount in descending order to check highest tiers first
  const sortedRules = [...rules].sort((a, b) => b.min_amount - a.min_amount);

  for (const rule of sortedRules) {
    if (amount >= rule.min_amount && (!rule.max_amount || amount <= rule.max_amount)) {
      // Calculate base points
      const basePoints = rule.points_earned;
      
      // Apply multiplier for amount above minimum
      const extraAmount = amount - rule.min_amount;
      const extraPoints = Math.floor((extraAmount / rule.min_amount) * basePoints * rule.multiplier);
      
      points = basePoints + extraPoints;
      break; // Use the first matching rule (highest tier)
    }
  }

  return points;
}