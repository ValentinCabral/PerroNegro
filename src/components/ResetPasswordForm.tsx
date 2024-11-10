import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import api from '../services/api';
import toast from 'react-hot-toast';

export function ResetPasswordForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    try {
      setLoading(true);
      await api.post('/auth/reset-password', {
        token,
        password: formData.password
      });
      toast.success('Contraseña actualizada exitosamente');
      navigate('/login');
    } catch (error) {
      toast.error('Error al restablecer la contraseña');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <p className="text-red-600">Enlace de recuperación inválido</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <Lock className="mx-auto h-12 w-12 text-black" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Restablecer Contraseña
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Ingresa tu nueva contraseña
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <Input
            label="Nueva Contraseña"
            type="password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
          />

          <Input
            label="Confirmar Contraseña"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) =>
              setFormData({ ...formData, confirmPassword: e.target.value })
            }
            required
          />

          <Button
            type="submit"
            className="w-full"
            loading={loading}
            icon={<Lock size={20} />}
          >
            Actualizar Contraseña
          </Button>
        </form>
      </div>
    </div>
  );
}