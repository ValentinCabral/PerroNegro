import { Database } from '@better-sqlite3/database';
import { z } from 'zod';
import { generateId } from '../utils';

const rewardSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  points_cost: z.number(),
  description: z.string(),
  is_active: z.boolean().default(true)
});

export type Reward = z.infer<typeof rewardSchema>;

export class RewardModel {
  constructor(private db: Database) {}

  async create(data: Omit<Reward, 'id'>) {
    const reward = rewardSchema.parse({ ...data, id: generateId() });
    
    const stmt = this.db.prepare(`
      INSERT INTO rewards (id, name, points_cost, description, is_active)
      VALUES (?, ?, ?, ?, ?)
    `);

    await stmt.run(
      reward.id,
      reward.name,
      reward.points_cost,
      reward.description,
      reward.is_active
    );

    return reward;
  }

  async findActive() {
    const stmt = this.db.prepare('SELECT * FROM rewards WHERE is_active = true');
    return await stmt.all();
  }

  async redeem(rewardId: string, userId: string) {
    const reward = await this.db.prepare('SELECT * FROM rewards WHERE id = ?').get(rewardId);
    if (!reward) throw new Error('Reward not found');

    const user = await this.db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (!user) throw new Error('User not found');
    if (user.points < reward.points_cost) throw new Error('Insufficient points');

    // Start transaction
    await this.db.exec('BEGIN');
    try {
      // Deduct points
      await this.db.prepare('UPDATE users SET points = points - ? WHERE id = ?')
        .run(reward.points_cost, userId);

      // Create redemption transaction
      await this.db.prepare(`
        INSERT INTO transactions (id, user_id, type, amount, points_earned, description)
        VALUES (?, ?, 'redemption', 0, ?, ?)
      `).run(generateId(), userId, -reward.points_cost, `Redeemed: ${reward.name}`);

      await this.db.exec('COMMIT');
    } catch (error) {
      await this.db.exec('ROLLBACK');
      throw error;
    }
  }
}