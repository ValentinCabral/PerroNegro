import { useState } from 'react';
import { db } from '../db/client';
import type { User, Transaction, LoyaltyRule, Reward } from '../types';

export function useDatabase() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auth operations
  const login = async (identifier: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await db.login(identifier, password);
      return data;
    } catch (err) {
      setError('Error al iniciar sesión');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: {
    dni: string;
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await db.register(userData);
      return data;
    } catch (err) {
      setError('Error al registrar usuario');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // User operations
  const getUser = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const user = await db.getUser(id);
      return user;
    } catch (err) {
      setError('Error al obtener usuario');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const customers = await db.getCustomers();
      return customers;
    } catch (err) {
      setError('Error al obtener clientes');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Transaction operations
  const getUserTransactions = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const transactions = await db.getUserTransactions(userId);
      return transactions;
    } catch (err) {
      setError('Error al obtener transacciones');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createTransaction = async (userId: string, amount: number) => {
    setLoading(true);
    setError(null);
    try {
      const transaction = await db.createTransaction(userId, amount);
      return transaction;
    } catch (err) {
      setError('Error al crear transacción');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Points operations
  const getUserPoints = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const points = await db.getUserPoints(userId);
      return points;
    } catch (err) {
      setError('Error al obtener puntos');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Loyalty rule operations
  const getLoyaltyRules = async () => {
    setLoading(true);
    setError(null);
    try {
      const rules = await db.getLoyaltyRules();
      return rules;
    } catch (err) {
      setError('Error al obtener reglas de lealtad');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createLoyaltyRule = async (rule: Omit<LoyaltyRule, 'id' | 'createdAt' | 'isActive'>) => {
    setLoading(true);
    setError(null);
    try {
      const newRule = await db.createLoyaltyRule(rule);
      return newRule;
    } catch (err) {
      setError('Error al crear regla de lealtad');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Reward operations
  const getRewards = async () => {
    setLoading(true);
    setError(null);
    try {
      const rewards = await db.getRewards();
      return rewards;
    } catch (err) {
      setError('Error al obtener recompensas');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const redeemReward = async (userId: string, rewardId: string) => {
    setLoading(true);
    setError(null);
    try {
      const transaction = await db.redeemReward(userId, rewardId);
      return transaction;
    } catch (err) {
      setError('Error al canjear recompensa');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    // Status
    loading,
    error,
    
    // Auth operations
    login,
    register,
    
    // User operations
    getUser,
    getCustomers,
    
    // Transaction operations
    getUserTransactions,
    createTransaction,
    
    // Points operations
    getUserPoints,
    
    // Loyalty rule operations
    getLoyaltyRules,
    createLoyaltyRule,
    
    // Reward operations
    getRewards,
    redeemReward
  };
}