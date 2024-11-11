import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Mail, Phone, CreditCard, Gift, Trash2, Edit2, Key } from 'lucide-react';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { EditCustomerForm } from './EditCustomerForm';
import api from '../services/api';
import toast from 'react-hot-toast';
import type { User } from '../types';
import logo from '../utils/logo.png'

export function CustomersList() {
  const [customers, setCustomers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<User | null>(null);
  const [showResetPassword, setShowResetPassword] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');

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

  const handleDelete = async (customerId: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este cliente?')) return;

    try {
      await api.post(`/customers/${customerId}/delete`);
      toast.success('Cliente eliminado');
      fetchCustomers();
    } catch (error) {
      toast.error('Error al eliminar el cliente');
    }
  };

  const handleResetPassword = async (customerId: string) => {
    try {
      await api.post(`/customers/${customerId}/reset-password`, {
        newPassword
      });
      toast.success('Contraseña actualizada');
      setShowResetPassword(null);
      setNewPassword('');
    } catch (error) {
      toast.error('Error al actualizar la contraseña');
    }
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.dni?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendEmail = () => {
    const emailSubject = '¡Ofertas especiales para ti! PERRO NEGRO | Clothing'; // Asunto del correo
    const emailBody = `
¡Hola! 🌟

¡Gracias por ser parte de la familia Perro Negro! 🎉

Tenemos algo increíble para ti: ¡descuentos exclusivos y ofertas irresistibles en nuestra nueva colección! Renueva tu estilo con nuestras prendas y accesorios con un toque único.

🛍️ **Descubre las ofertas y mucho más en nuestra tienda:**
[Enlace a tu tienda] - *Haz clic aquí para ver las promociones*

📦 **Lo que te espera:**
- Ofertas especiales en productos seleccionados
- Ropa y accesorios de última tendencia
- Descuentos solo para ti, ¡aprovecha antes de que se acaben!

Nos encantaría verte con tu nueva compra. ¿A qué esperas para aprovechar nuestras ofertas?

Visítanos y haz tu pedido ahora. ¡Te esperamos!

---

PERRO NEGRO | Clothing
STREETWEAR | OVERSIZE
La combinación de estilo y comodidad sin género
📍San Martin 556, Rio Cuarto
⏰ 09:30 a 13:00hs
⏰ 17:00 a 20:30hs
🗓 LUN a SÁB

    `;

    // Obtener las direcciones de correo electrónico de los clientes
    const emailAddresses = filteredCustomers.map((customer) => customer.email).join(',');

    // Crear el enlace mailto
    const mailtoLink = `mailto:${emailAddresses}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

    // Abrir el correo electrónico en el navegador
    window.location.href = mailtoLink;
  };

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

      <Button
        variant="primary"
        className="mb-4"
        onClick={handleSendEmail}
      >
        Enviar Correo a Clientes
      </Button>

      {editingCustomer && (
        <EditCustomerForm
          customer={editingCustomer}
          onSuccess={() => {
            fetchCustomers();
            setEditingCustomer(null);
          }}
          onCancel={() => setEditingCustomer(null)}
        />
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {filteredCustomers.map((customer) => (
          <motion.div
            key={customer.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{customer.name}</h3>
                <p className="text-sm text-gray-500">DNI: {customer.dni}</p>
              </div>
              <div className="flex -space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingCustomer(customer)}
                  icon={<Edit2 size={16} />}
                >
                  Editar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:bg-red-50"
                  onClick={() => handleDelete(customer.id)}
                  icon={<Trash2 size={16} />}
                >
                  Eliminar
                </Button>
              </div>
            </div>

            <div className="mt-4 space-y-2">
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

            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
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
                <p className="font-semibold">${customer.total_spent}</p>
              </div>
            </div>

            {showResetPassword === customer.id ? (
              <div className="space-y-2 mt-4 pt-4 border-t">
                <Input
                  type="password"
                  placeholder="Nueva contraseña"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <div className="flex space-x-2">
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleResetPassword(customer.id)}
                  >
                    Confirmar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setShowResetPassword(null);
                      setNewPassword('');
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-4"
                onClick={() => setShowResetPassword(customer.id)}
                icon={<Key size={16} />}
              >
                Cambiar Contraseña
              </Button>
            )}
          </motion.div>
        ))}
      </motion.div>

      {!loading && filteredCustomers.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No se encontraron clientes
        </div>
      )}
    </div>
  );
}
