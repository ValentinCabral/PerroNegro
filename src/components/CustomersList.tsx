import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Mail, Phone, CreditCard, Gift } from 'lucide-react';
import { Input } from './ui/Input';
import api from '../services/api';
import toast from 'react-hot-toast';
import type { User } from '../types';

export function CustomersList() {
  const [customers, setCustomers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/customers');
      setCustomers(data);
    } catch (error) {
      toast.error('Error al cargar los clientes');
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.dni?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Clientes Registrados</h2>
        <div className="relative w-64">
          <Input
            type="text"
            placeholder="Buscar clientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCustomers.map((customer) => (
            <motion.div
              key={customer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">{customer.name}</h3>
                  <p className="text-sm text-gray-500">DNI: {customer.dni}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <Mail size={16} className="mr-2" />
                    <span className="text-sm">{customer.email}</span>
                  </div>
                  {customer.phone && (
                    <div className="flex items-center text-gray-600">
                      <Phone size={16} className="mr-2" />
                      <span className="text-sm">{customer.phone}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="flex items-center justify-center text-yellow-500 mb-1">
                      <Gift size={20} />
                    </div>
                    <p className="text-sm text-gray-600">Puntos</p>
                    <p className="font-semibold">{customer.points}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center text-gray-700 mb-1">
                      <CreditCard size={20} />
                    </div>
                    <p className="text-sm text-gray-600">Total Gastado</p>
                    <p className="font-semibold">${customer.totalSpent}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && filteredCustomers.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No se encontraron clientes
        </div>
      )}
    </div>
  );
}