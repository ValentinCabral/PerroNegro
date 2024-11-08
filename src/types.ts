export interface User {
  id: string;
  role: 'admin' | 'customer';
  dni?: string;
  name: string;
  email: string;
  phone?: string;
  points: number;
  totalSpent: number;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'purchase' | 'redemption' | 'refund';
  amount: number;
  pointsEarned: number;
  description?: string;
  redemptionId?: string;
  createdAt: string;
}

export interface LoyaltyRule {
  id: string;
  minAmount: number;
  maxAmount?: number;
  pointsEarned: number;
  multiplier: number;
  description: string;
  isActive: boolean;
  createdAt: string;
}

export interface Reward {
  id: string;
  name: string;
  pointsCost: number;
  description: string;
  isActive: boolean;
  createdAt: string;
}

export interface Redemption {
  id: string;
  userId: string;
  rewardId: string;
  pointsCost: number;
  status: 'pending' | 'applied' | 'cancelled';
  createdAt: string;
  appliedAt?: string | null;
  cancelledAt?: string | null;
  user?: {
    id: string;
    name: string;
    email: string;
    dni?: string;
  };
  reward?: {
    name: string;
    pointsCost: number;
    description: string;
  };
  transaction?: Transaction;
}