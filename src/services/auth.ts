import api from './api';
import type { User } from '../types';

export async function loginUser(identifier: string, password: string): Promise<User> {
  try {
    const { data } = await api.post('/auth/login', { identifier, password });
    localStorage.setItem('token', data.token);
    return data.user;
  } catch (error) {
    throw new Error('Credenciales inválidas');
  }
}

export async function registerUser(data: {
  dni: string;
  name: string;
  email: string;
  phone: string;
  password: string;
}): Promise<User> {
  try {
    const response = await api.post('/auth/register', data);
    localStorage.setItem('token', response.data.token);
    return response.data.user;
  } catch (error) {
    throw new Error('Error al registrar usuario');
  }
}

export function logout() {
  localStorage.removeItem('token');
}