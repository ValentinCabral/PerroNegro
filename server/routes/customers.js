import express from 'express';
import bcrypt from 'bcryptjs';
import { all, get, run } from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all customers
router.get('/', authenticateToken, async (req, res) => {
  try {
    const customers = await all(`
      SELECT id, role, dni, name, email, phone, points, total_spent, created_at
      FROM users 
      WHERE role = 'customer'
      ORDER BY created_at DESC
    `);
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los clientes' });
  }
});

// Search customer by DNI
router.get('/search', authenticateToken, async (req, res) => {
  const { dni } = req.query;
  
  try {
    const customer = await get(`
      SELECT id, role, dni, name, email, phone, points, total_spent
      FROM users 
      WHERE dni = ? AND role = 'customer'
    `, [dni]);

    if (!customer) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar el cliente' });
  }
});

// Get customer information by ID
router.get('/:customerId', authenticateToken, async (req, res) => {
  const customerId = req.params.customerId;
  try {
    const customer = await get(`
      SELECT id, role, dni, name, email, phone, points, total_spent
      FROM users
      WHERE id = ? AND role = 'customer'
    `, [customerId]);

    if (!customer) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el cliente' });
  }
});

// Get customer transactions
router.get('/:customerId/transactions', authenticateToken, async (req, res) => {
  const customerId = req.params.customerId;
  try {
    const transactions = await all(`
      SELECT * FROM transactions 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `, [customerId]);

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las transacciones' });
  }
});

// Get customer points and total spent
router.get('/:customerId/points', authenticateToken, async (req, res) => {
  const customerId = req.params.customerId;
  try {
    const customerData = await get(`
      SELECT points, total_spent FROM users 
      WHERE id = ? AND role = 'customer'
    `, [customerId]);

    if (!customerData) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    res.json(customerData);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los puntos y el total gastado' });
  }
});

// Get possible next rewards for customer
router.get('/:customerId/next-rewards', authenticateToken, async (req, res) => {
  const customerId = req.params.customerId;
  try {
    const customer = await get(`
      SELECT points FROM users WHERE id = ? AND role = 'customer'
    `, [customerId]);

    if (!customer) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    // Lógica para calcular las próximas recompensas posibles
    const nextRewards = await all(`
      SELECT * FROM rewards 
      WHERE is_active = 1 AND points_cost <= ?
      ORDER BY points_cost ASC
    `, [customer.points]);

    res.json(nextRewards);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las próximas recompensas' });
  }
});

// Update customer
router.post('/:id/update', authenticateToken, async (req, res) => {
  const { name, email, phone, dni } = req.body;
  const customerId = req.params.id;

  try {
    // Check if email or dni already exists
    if (email || dni) {
      const existing = await get(`
        SELECT id FROM users 
        WHERE (email = ? OR dni = ?) AND id != ?
      `, [email, dni, customerId]);

      if (existing) {
        return res.status(400).json({ error: 'Email o DNI ya existe' });
      }
    }

    const updates = [];
    const values = [];

    if (name) {
      updates.push('name = ?');
      values.push(name);
    }
    if (email) {
      updates.push('email = ?');
      values.push(email);
    }
    if (phone) {
      updates.push('phone = ?');
      values.push(phone);
    }
    if (dni) {
      updates.push('dni = ?');
      values.push(dni);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No se proporcionaron datos para actualizar' });
    }

    values.push(customerId);
    const query = `
      UPDATE users 
      SET ${updates.join(', ')} 
      WHERE id = ? AND role = 'customer'
    `;

    const result = await run(query, values);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    const updatedCustomer = await get(
      'SELECT id, role, dni, name, email, phone, points, total_spent FROM users WHERE id = ?',
      [customerId]
    );
    res.json(updatedCustomer);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el cliente' });
  }
});

// Reset customer password (admin only)
router.post('/:id/reset-password', authenticateToken, async (req, res) => {
  const { newPassword } = req.body;
  const customerId = req.params.id;

  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const result = await run(
      'UPDATE users SET password = ? WHERE id = ? AND role = "customer"',
      [hashedPassword, customerId]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    res.json({ message: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la contraseña' });
  }
});

// Delete customer
router.post('/:id/delete', authenticateToken, async (req, res) => {
  try {
    const result = await run(
      'DELETE FROM users WHERE id = ? AND role = "customer"',
      [req.params.id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    res.json({ message: 'Cliente eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el cliente' });
  }
});

export default router;
