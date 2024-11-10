export interface User {
  id: string;
  role: 'admin' | 'customer';
  dni?: string;
  name: string;
  email: string;
  phone?: string;
  points: number;
  total_spent: number;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'purchase' | 'redemption' | 'refund';
  amount: number;
  pointsEarned: number;
  description?: string;
  redemption_id?: string;
  created_at: string;
}

export interface LoyaltyRule {
  id: string;
  minAmount: number;
  maxAmount?: number | null;
  pointsEarned: number;
  multiplier: number;
  description: string;
  is_active: boolean;
  created_at: string;
}

export interface Reward {
  id: string;
  name: string;
  points_cost: number;
  description: string;
  is_active: boolean;
  created_at: string;
  progress?: number; // Agrega el campo progress aquí
}


export interface Redemption {
  id: string;
  user_id: string;
  reward_id: string;
  points_cost: number;
  status: 'pending' | 'applied' | 'cancelled';
  created_at: string;
  applied_at?: string | null;
  cancelled_at?: string | null;
  user?: {
    id: string;
    name: string;
    email: string;
    dni?: string;
  };
  reward?: {
    name: string;
    points_cost: number;
    description: string;
  };
  transaction?: Transaction;
}

export interface PointsData {
  points: number;
  total_spent: number;
  next_reward?: {
    id: string;
    name: string;
    description: string;
    points_cost: number;
  } | null;
}

export interface Transaction {
  id: string;
  amount: number;
  points_earned: number;
  created_at: string;
}
