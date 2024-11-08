import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    
    const result = await db.execute({
      sql: 'SELECT * FROM users WHERE email = ? OR dni = ?',
      args: [identifier, identifier]
    });
    
    const user = result.rows[0];
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ user, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { dni, name, email, phone, password } = req.body;
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await db.execute({
      sql: `INSERT INTO users (id, role, dni, name, email, phone, password, points, total_spent)
            VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0)`,
      args: [crypto.randomUUID(), 'customer', dni, name, email, phone, hashedPassword]
    });

    const user = {
      id: result.lastInsertRowid,
      role: 'customer',
      dni,
      name,
      email,
      phone,
      points: 0,
      total_spent: 0
    };

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({ user, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export { router as auth };