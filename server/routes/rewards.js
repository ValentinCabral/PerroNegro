import express from 'express';
import crypto from 'crypto';
import { all, get, run } from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all rewards
router.get('/', authenticateToken, async (req, res) => {
  try {
    const rewards = await all(
      'SELECT * FROM rewards WHERE is_active = 1'
    );
    res.json(rewards);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las recompensas' });
  }
});

// Create reward
router.post('/', authenticateToken, async (req, res) => {
  const { name, pointsCost, description } = req.body;
  const rewardId = crypto.randomBytes(16).toString('hex');

  try {
    await run(`
      INSERT INTO rewards (id, name, points_cost, description)
      VALUES (?, ?, ?, ?)
    `, [rewardId, name, pointsCost, description]);

    const reward = await get('SELECT * FROM rewards WHERE id = ?', [rewardId]);
    res.json(reward);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la recompensa' });
  }
});

// Redeem reward
router.post('/redeem', authenticateToken, async (req, res) => {
  const { userId, rewardId } = req.body;

  try {
    const reward = await get('SELECT * FROM rewards WHERE id = ?', [rewardId]);
    if (!reward) {
      return res.status(404).json({ error: 'Recompensa no encontrada'});
    }

    const user = await get('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (user.points < reward.points_cost) {
      return res.status(400).json({ error: 'Puntos insuficientes' });
    }

    const redemptionId = crypto.randomBytes(16).toString('hex');
    const transactionId = crypto.randomBytes(16).toString('hex');

    // Create redemption
    await run(`
      INSERT INTO redemptions (id, user_id, reward_id)
      VALUES (?, ?, ?)
    `, [redemptionId, userId, rewardId]);

    // // Create transaction
    // await run(`
    //   INSERT INTO transactions (id, user_id, type, amount, points_earned, description)
    //   VALUES (?, ?, ?, ?, ?, ?)
    // `, [
    //   transactionId,
    //   userId,
    //   'redemption',
    //   0,
    //   -reward.points_cost,
    //   `Canje: ${reward.name}`
    // ]);

    // Update user points
    await run(
      'UPDATE users SET points = points - ? WHERE id = ?',
      [reward.points_cost, userId]
    );

    const redemption = await get(`
      SELECT r.*, u.name as user_name, u.email as user_email,
             w.name as reward_name, w.points_cost, w.description as reward_description
      FROM redemptions r
      JOIN users u ON r.user_id = u.id
      JOIN rewards w ON r.reward_id = w.id
      WHERE r.id = ?
    `, [redemptionId]);

    res.json(redemption);
  } catch (error) {
    res.status(500).json({ error: 'Error al canjear la recompensa' });
  }
});

// Delete reward
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await run(
      'UPDATE rewards SET is_active = 0 WHERE id = ?',
      [req.params.id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Recompensa no encontrada' });
    }

    res.json({ message: 'Recompensa eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la recompensa' });
  }
});

// Obtener la lista de canjes
router.get('/redemptions', authenticateToken, async (req, res) => {
  try {
    // Obtener todos los canjes de la base de datos
    const redemptions = await all(`
      SELECT 
        r.id, 
        r.user_id, 
        r.reward_id,
        r.status,
        r.created_at,
        r.applied_at,
        r.cancelled_at,
        u.name AS user_name, 
        u.email AS user_email, 
        u.dni AS user_dni,
        w.name AS reward_name, 
        w.points_cost AS reward_points_cost, 
        w.description AS reward_description,
        t.id AS transaction_id,
        t.type AS transaction_type,
        t.amount AS transaction_amount,
        t.points_earned AS transaction_points_earned,
        t.description AS transaction_description,
        t.created_at AS transaction_created_at
      FROM 
        redemptions r
      JOIN 
        users u ON r.user_id = u.id
      JOIN 
        rewards w ON r.reward_id = w.id
      LEFT JOIN 
        transactions t ON r.id = t.id AND t.type = 'redemption'
    `);

    // Mapear los datos a la estructura Redemption
    const mappedRedemptions = redemptions.map((redemption) => ({
      id: redemption.id,
      user_id: redemption.user_id,
      reward_id: redemption.reward_id,
      points_cost: redemption.reward_points_cost, // Usando reward_points_cost
      status: redemption.status,
      created_at: redemption.created_at,
      applied_at: redemption.applied_at,
      cancelled_at: redemption.cancelled_at,
      user: {
        id: redemption.user_id,
        name: redemption.user_name,
        email: redemption.user_email,
        dni: redemption.user_dni
      },
      reward: {
        name: redemption.reward_name,
        points_cost: redemption.reward_points_cost, // Usando reward_points_cost
        description: redemption.reward_description
      },
      transaction: redemption.transaction_id ? {
        id: redemption.transaction_id,
        type: redemption.transaction_type,
        amount: redemption.transaction_amount,
        points_earned: redemption.transaction_points_earned,
        description: redemption.transaction_description,
        created_at: redemption.transaction_created_at
      } : null
    }));

    res.json(mappedRedemptions);
  } catch (error) {
    console.error('Error al obtener la lista de canjes:', error);
    res.status(500).json({ error: 'Error al obtener la lista de canjes' });
  }
});


// Actualiza el estado de un canje
router.patch('/redemptions/:redemptionId/status', authenticateToken, async (req, res) => {
  const { redemptionId } = req.params;
  const { status } = req.body;

  try {
    // Valida que el estado sea válido (aplicado o cancelado)
    if (!['applied', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    // Obtener información del canje
    const redemption = await get(`
      SELECT 
        r.id, 
        r.user_id, 
        r.reward_id,
        r.status,
        r.created_at,
        r.applied_at,
        r.cancelled_at,
        w.name AS reward_name, 
        w.points_cost AS reward_points_cost, 
        w.description AS reward_description
      FROM 
        redemptions r
      JOIN 
        rewards w ON r.reward_id = w.id
      WHERE r.id = ?
    `, [redemptionId]);
    if (!redemption) {
      return res.status(404).json({ error: 'Canje no encontrado' });
    }

    // Devuelve los puntos al usuario si se cancela el canje
    if (status === 'cancelled') {
      const userId = redemption.user_id;
      const pointsCost = redemption.reward_points_cost;
      // Obtener los puntos actuales del usuario
      const user = await get('SELECT points FROM users WHERE id = ?', [userId]);

      // Actualiza los puntos del usuario
      const newPoints = user.points + pointsCost;
      console.log(newPoints);
      await run(
        'UPDATE users SET points = ? WHERE id = ?',
        [newPoints, userId]
      );
    }

    // Actualiza el estado en la base de datos
    await run('UPDATE redemptions SET status = ? WHERE id = ?', [status, redemptionId]);

    // Busca el canje actualizado
    const updatedRedemption = await get('SELECT * FROM redemptions WHERE id = ?', [redemptionId]);

    res.json(updatedRedemption);
  } catch (error) {
    console.error('Error al actualizar el estado del canje:', error);
    res.status(500).json({ error: 'Error al actualizar el estado del canje' });
  }
});


export default router;
