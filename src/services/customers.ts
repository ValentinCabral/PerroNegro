import api from './api';
import type { Customer } from '../types';

export async function getCustomers(): Promise<Customer[]> {
  const { data } = await api.get('/customers');
  return data;
}

export async function getCustomerByDni(dni: string): Promise<Customer> {
  const { data } = await api.get(`/customers/dni/${dni}`);
  return data;
}