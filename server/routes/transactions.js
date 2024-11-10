import express from 'express';
import crypto from 'crypto';
import { all, get, run, runTransaction } from '../db/index.js'; // Importa runTransaction
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get user transactions
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const transactions = await all(`
      SELECT * FROM transactions 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `, [req.params.userId]);
    
    res.json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Error al obtener las transacciones' });
  }
});

// Create transaction
// router.post('/', authenticateToken, async (req, res) => {
//   const { userId, amount } = req.body;

//   try {
//     // Get applicable loyalty rule
//     const rules = await all(`
//       SELECT * FROM loyalty_rules 
//       WHERE is_active = 1 
//         AND min_amount <= ?
//         AND (max_amount IS NULL OR max_amount >= ?)
//       ORDER BY min_amount DESC 
//       LIMIT 1
//     `, [amount, amount]);

//     const rule = rules[0];
//     let pointsEarned = 0;

//     if (rule) {
//       const basePoints = rule.points_earned;
//       const extraAmount = amount - rule.min_amount;
//       const extraPoints = Math.floor((extraAmount / rule.min_amount) * basePoints * rule.multiplier);
//       pointsEarned = basePoints + extraPoints;
//     }

//     // Start transaction
//     await run('BEGIN TRANSACTION');

//     // Create transaction
//     const transactionId = crypto.randomBytes(16).toString('hex');
//     await run(`
//       INSERT INTO transactions (id, user_id, type, amount, points_earned, description)
//       VALUES (?, ?, ?, ?, ?, ?)
//     `, [transactionId, userId, 'purchase', amount, pointsEarned, `Compra por $${amount}`]);

//     // Update user points and total spent
//     await run(`
//       UPDATE users 
//       SET points = points + ?, total_spent = total_spent + ?
//       WHERE id = ?
//     `, [pointsEarned, amount, userId]);

//     await run('COMMIT');

//     const transaction = await get('SELECT * FROM transactions WHERE id = ?', [transactionId]);
//     res.json(transaction);
//   } catch (error) {
//     await run('ROLLBACK');
//     console.error('Transaction error:', error);
//     res.status(500).json({ error: 'Error al crear la transacción' });
//   }
// });
router.post('/', authenticateToken, async (req, res) => {
  const { userId, amount } = req.body;

  try {
    // Get applicable loyalty rule
    const rules = await all(`
      SELECT * FROM loyalty_rules 
      WHERE is_active = 1 
        AND min_amount <= ?
        AND (max_amount IS NULL OR max_amount >= ?)
      ORDER BY min_amount DESC 
      LIMIT 1
    `, [amount, amount]);

    const rule = rules[0];
    let pointsEarned = 0;

    if (rule) {
      const basePoints = rule.points_earned;
      const extraAmount = amount - rule.min_amount;
      const extraPoints = Math.floor((extraAmount / rule.min_amount) * basePoints * rule.multiplier);
      pointsEarned = basePoints + extraPoints;
    }

    // Ejecuta las sentencias dentro de una transacción
    const results = await runTransaction([
      {
        query: `
          INSERT INTO transactions (id, user_id, type, amount, points_earned, description)
          VALUES (?, ?, ?, ?, ?, ?)
        `,
        params: [
          crypto.randomBytes(16).toString('hex'), 
          userId, 
          'purchase', 
          amount, 
          pointsEarned, 
          `Compra por $${amount}`
        ]
      },
      {
        query: `
          UPDATE users 
          SET points = points + ?, total_spent = total_spent + ?
          WHERE id = ?
        `,
        params: [pointsEarned, amount, userId]
      }
    ]);

    // Si la transacción se completa correctamente
    if (results.length === 2 && results[0].changes === 1 && results[1].changes === 1) {
      const transactionId = results[0].id;
      const transaction = await get('SELECT * FROM transactions WHERE id = ?', [transactionId]);
      res.json(transaction);
    } else {
      // Si alguna de las sentencias falla, lanza un error
      throw new Error('Error al crear la transacción');
    }
  } catch (error) {
    console.error('Transaction error:', error);
    res.status(500).json({ error: 'Error al crear la transacción' });
  }
});

// Delete transaction
router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    // Start transaction
    await run('BEGIN TRANSACTION');

    // Get transaction to delete
    const transaction = await get('SELECT * FROM transactions WHERE id = ?', [id]);

    if (!transaction) {
      await run('ROLLBACK');
      return res.status(404).json({ error: 'Transacción no encontrada' });
    }

    // Delete transaction
    await run('DELETE FROM transactions WHERE id = ?', [id]);

    // Revert user points and total spent
    await run(`
      UPDATE users 
      SET points = points - ?, total_spent = total_spent - ?
      WHERE id = ?
    `, [transaction.points_earned, transaction.amount, transaction.user_id]);

    await run('COMMIT');
    res.json({ message: 'Transacción eliminada exitosamente' });
  } catch (error) {
    await run('ROLLBACK');
    console.error('Delete transaction error:', error);
    res.status(500).json({ error: 'Error al eliminar la transacción' });
  }
});

export default router;