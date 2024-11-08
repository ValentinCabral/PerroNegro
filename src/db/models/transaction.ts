import { Database } from '@better-sqlite3/database';
import { z } from 'zod';
import { generateId } from '../utils';

const transactionSchema = z.object({
  id: z.string().optional(),
  user_id: z.string(),
  type: z.enum(['purchase', 'redemption']),
  amount: z.number(),
  points_earned: z.number(),
  description: z.string().optional()
});

export type Transaction = z.infer<typeof transactionSchema>;

export class TransactionModel {
  constructor(private db: Database) {}

  async create(data: Omit<Transaction, 'id'>) {
    const transaction = transactionSchema.parse({ ...data, id: generateId() });
    
    const stmt = this.db.prepare(`
      INSERT INTO transactions (id, user_id, type, amount, points_earned, description)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    await stmt.run(
      transaction.id,
      transaction.user_id,
      transaction.type,
      transaction.amount,
      transaction.points_earned,
      transaction.description
    );

    return transaction;
  }

  async findByUserId(userId: string) {
    const stmt = this.db.prepare(`
      SELECT * FROM transactions 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `);
    return await stmt.all(userId);
  }
}