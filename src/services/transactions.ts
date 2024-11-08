import api from './api';
import type { Transaction } from '../types';

export async function createTransaction(userId: number, amount: number): Promise<Transaction> {
  const { data } = await api.post('/transactions', { userId, amount });
  return data;
}

export async function getUserTransactions(userId: number): Promise<Transaction[]> {
  const { data } = await api.get(`/customers/${userId}/transactions`);
  return data;
}