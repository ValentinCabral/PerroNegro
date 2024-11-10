import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, CreditCard } from 'lucide-react';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import api from '../services/api';
import toast from 'react-hot-toast';
import type { User as UserType } from '../types';

interface EditCustomerFormProps {
  customer: UserType;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function EditCustomerForm({ customer, onSuccess, onCancel }: EditCustomerFormProps) {
  const [formData, setFormData] = useState({
    name: customer.name,
    email: customer.email,
    phone: customer.phone || '',
    dni: customer.dni || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    try {
      setLoading(true);
      await api.post(`/customers/${customer.id}/update`, formData);
      toast.success('Cliente actualizado exitosamente');
      onSuccess?.();
    } catch (error: any) {
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('Error al actualizar el cliente');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Nombre Completo"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          icon={<User size={20} />}
          required
        />

        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          icon={<Mail size={20} />}
          required
        />

        <Input
          label="Teléfono"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          icon={<Phone size={20} />}
        />

        <Input
          label="DNI"
          value={formData.dni}
          onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
          icon={<CreditCard size={20} />}
        />
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          loading={loading}
          icon={<User size={20} />}
        >
          Actualizar Cliente
        </Button>
      </div>
    </motion.form>
  );
}