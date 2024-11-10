import express from 'express';
import crypto from 'crypto';
import { all, get, run } from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all loyalty rules
router.get('/', authenticateToken, async (req, res) => {
  try {
    const rules = await all(
      'SELECT * FROM loyalty_rules WHERE is_active = 1 ORDER BY min_amount DESC'
    );
    res.json(rules);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las reglas' });
  }
});

// Create loyalty rule
router.post('/', authenticateToken, async (req, res) => {
  const { minAmount, maxAmount, pointsEarned, multiplier, description } = req.body;
  const ruleId = crypto.randomBytes(16).toString('hex');

  try {
    await run(`
      INSERT INTO loyalty_rules (id, min_amount, max_amount, points_earned, multiplier, description)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [ruleId, minAmount, maxAmount, pointsEarned, multiplier, description]);

    const rule = await get('SELECT * FROM loyalty_rules WHERE id = ?', [ruleId]);
    res.json(rule);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la regla' });
  }
});

// Update loyalty rule
router.patch('/:id', authenticateToken, async (req, res) => {
  const { minAmount, maxAmount, pointsEarned, multiplier, description } = req.body;
  const ruleId = req.params.id;

  try {
    const updates = [];
    const values = [];

    if (minAmount !== undefined) {
      updates.push('min_amount = ?');
      values.push(minAmount);
    }
    if (maxAmount !== undefined) {
      updates.push('max_amount = ?');
      values.push(maxAmount);
    }
    if (pointsEarned !== undefined) {
      updates.push('points_earned = ?');
      values.push(pointsEarned);
    }
    if (multiplier !== undefined) {
      updates.push('multiplier = ?');
      values.push(multiplier);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No se proporcionaron datos para actualizar' });
    }

    values.push(ruleId);
    const query = `
      UPDATE loyalty_rules 
      SET ${updates.join(', ')} 
      WHERE id = ? AND is_active = 1
    `;

    const result = await run(query, values);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Regla no encontrada' });
    }

    const updatedRule = await get('SELECT * FROM loyalty_rules WHERE id = ?', [ruleId]);
    res.json(updatedRule);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la regla' });
  }
});

// Delete loyalty rule
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await run(
      'UPDATE loyalty_rules SET is_active = 0 WHERE id = ?',
      [req.params.id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Regla no encontrada' });
    }

    res.json({ message: 'Regla eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la regla' });
  }
});

export default router;