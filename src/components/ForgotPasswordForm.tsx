import React, { useState } from 'react';
import { Mail, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import api from '../services/api';
import toast from 'react-hot-toast';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setLoading(true);
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('Correo de recuperación enviado');
    } catch (error) {
      toast.error('Error al enviar el correo de recuperación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <Mail className="mx-auto h-12 w-12 text-black" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Recuperar Contraseña
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Ingresa tu correo electrónico para recibir instrucciones
          </p>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="bg-green-50 text-green-800 p-4 rounded-md">
              <p>Hemos enviado las instrucciones a tu correo electrónico.</p>
              <p className="text-sm mt-2">
                Revisa tu bandeja de entrada y sigue los pasos indicados.
              </p>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={16} className="mr-2" />
              Volver al inicio de sesión
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <Input
              label="Correo Electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
            />

            <Button
              type="submit"
              className="w-full"
              loading={loading}
              icon={<Mail size={20} />}
            >
              Enviar Instrucciones
            </Button>

            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft size={16} className="mr-2" />
                Volver al inicio de sesión
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}