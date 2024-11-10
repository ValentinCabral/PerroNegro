import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { all, get, run } from '../db/index.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  const { identifier, password } = req.body;

  try {
    const user = await get(
      'SELECT * FROM users WHERE dni = ? OR email = ?',
      [identifier, identifier]
    );

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'perro-negro-secret-key',
      { expiresIn: '24h' }
    );

    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Register
router.post('/register', async (req, res) => {
  const { dni, name, email, phone, password } = req.body;

  try {
    const existingUser = await get(
      'SELECT id FROM users WHERE dni = ? OR email = ?',
      [dni, email]
    );

    if (existingUser) {
      return res.status(400).json({ error: 'Usuario ya existe' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = crypto.randomBytes(16).toString('hex');

    await run(`
      INSERT INTO users (id, role, dni, name, email, phone, password, points, total_spent)
      VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0)
    `, [userId, 'customer', dni, name, email, phone, hashedPassword]);

    const user = await get('SELECT * FROM users WHERE id = ?', [userId]);
    const { password: _, ...userWithoutPassword } = user;

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'perro-negro-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'perro-negro-secret-key');
    const user = await get('SELECT * FROM users WHERE id = ?', [decoded.id]);
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(401).json({ error: 'Token inválido' });
  }
});

export default router;