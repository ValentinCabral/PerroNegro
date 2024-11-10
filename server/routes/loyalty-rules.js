import express from 'express';
import pool from '../db/index.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Create loyalty rule
router.post('/', [authenticateToken, requireAdmin], async (req, res) => {
  const { minAmount, maxAmount, pointsEarned, multiplier, description } = req.body;

  try {
    const result = await pool.query(`
      INSERT INTO loyalty_rules (min_amount, max_amount, points_earned, multiplier, description)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [minAmount, maxAmount, pointsEarned, multiplier, description]);

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la regla' });
  }
});

// Update loyalty rule
router.patch('/:id', [authenticateToken, requireAdmin], async (req, res) => {
  const { id } = req.params;
  const { minAmount, maxAmount, pointsEarned, multiplier, description } = req.body;

  try {
    const result = await pool.query(`
      UPDATE loyalty_rules 
      SET min_amount = $1, max_amount = $2, points_earned = $3, 
          multiplier = $4, description = $5
      WHERE id = $6 AND is_active = true
      RETURNING *
    `, [minAmount, maxAmount, pointsEarned, multiplier, description, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Regla no encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la regla' });
  }
});

// Soft delete loyalty rule
router.delete('/:id', [authenticateToken, requireAdmin], async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`
      UPDATE loyalty_rules 
      SET is_active = false 
      WHERE id = $1 AND is_active = true
      RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Regla no encontrada' });
    }

    res.json({ message: 'Regla eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la regla' });
  }
});

export default router;