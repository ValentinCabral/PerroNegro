import express from 'express';
import { db } from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM users WHERE role = ?',
      args: ['customer']
    });
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/search', async (req, res) => {
  try {
    const { dni } = req.query;
    const result = await db.execute({
      sql: 'SELECT * FROM users WHERE dni = ?',
      args: [dni]
    });
    res.json(result.rows[0] || null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export { router as customers };