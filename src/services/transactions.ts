import api from './api';
import type { Transaction } from '../types';

export async function createTransaction(userId: string, amount: number): Promise<Transaction> {
  const { data } = await api.post('/transactions', { userId, amount });
  return data;
}

export async function getUserTransactions(userId: string): Promise<Transaction[]> {
  const { data } = await api.get(`/transactions/user/${userId}`);
  return data;
}

export async function deleteTransaction(transactionId: string): Promise<void> {
  await api.delete(`/transactions/${transactionId}`);
}