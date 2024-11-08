import api from '../services/api';
import type { User, Transaction, LoyaltyRule, Reward } from '../types';

export interface PointsData {
  points: number;
  totalSpent: number;
  nextReward?: {
    name: string;
    pointsNeeded: number;
    progress: number;
  };
}

export interface TransactionData {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
}

class ApiClient {
  // Auth
  async login(identifier: string, password: string) {
    const { data } = await api.post<{ user: User; token: string }>('/auth/login', {
      identifier,
      password
    });
    return data;
  }

  async register(userData: {
    dni: string;
    name: string;
    email: string;
    phone: string;
    password: string;
  }) {
    const { data } = await api.post<{ user: User; token: string }>('/auth/register', userData);
    return data;
  }

  // Users
  async getUser(id: string) {
    const { data } = await api.get<User>(`/users/${id}`);
    return data;
  }

  async getCustomers() {
    const { data } = await api.get<User[]>('/customers');
    return data;
  }

  // Transactions
  async getUserTransactions(userId: string) {
    const { data } = await api.get<Transaction[]>(`/customers/${userId}/transactions`);
    return data;
  }

  async createTransaction(userId: string, amount: number) {
    const { data } = await api.post<Transaction>('/transactions', { userId, amount });
    return data;
  }

  // Points
  async getUserPoints(userId: string) {
    const { data } = await api.get<PointsData>(`/customers/${userId}/points`);
    return data;
  }

  // Loyalty Rules
  async getLoyaltyRules() {
    const { data } = await api.get<LoyaltyRule[]>('/loyalty-rules');
    return data;
  }

  async createLoyaltyRule(rule: Omit<LoyaltyRule, 'id' | 'createdAt' | 'isActive'>) {
    const { data } = await api.post<LoyaltyRule>('/loyalty-rules', rule);
    return data;
  }

  // Rewards
  async getRewards() {
    const { data } = await api.get<Reward[]>('/rewards');
    return data;
  }

  async redeemReward(userId: string, rewardId: string) {
    const { data } = await api.post<Transaction>('/rewards/redeem', { userId, rewardId });
    return data;
  }
}

export const db = new ApiClient();