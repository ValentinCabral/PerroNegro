import { db } from '../client';
import { z } from 'zod';
import { generateId } from '../utils';

const loyaltyRuleSchema = z.object({
  id: z.string().optional(),
  min_amount: z.number(),
  max_amount: z.number().optional(),
  points_earned: z.number(),
  multiplier: z.number().default(1),
  description: z.string(),
  is_active: z.boolean().default(true)
});

export type LoyaltyRule = z.infer<typeof loyaltyRuleSchema>;

export class LoyaltyRuleModel {
  async create(data: Omit<LoyaltyRule, 'id'>) {
    const rule = loyaltyRuleSchema.parse({ ...data, id: generateId() });
    
    await db.execute({
      sql: `
        INSERT INTO loyalty_rules (id, min_amount, max_amount, points_earned, multiplier, description, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        rule.id,
        rule.min_amount,
        rule.max_amount || null,
        rule.points_earned,
        rule.multiplier,
        rule.description,
        rule.is_active
      ]
    });

    return rule;
  }

  async findActive() {
    const result = await db.execute({
      sql: 'SELECT * FROM loyalty_rules WHERE is_active = true ORDER BY min_amount DESC'
    });
    return result.rows;
  }

  async update(id: string, data: Partial<Omit<LoyaltyRule, 'id'>>) {
    const updates = Object.entries(data)
      .filter(([_, value]) => value !== undefined)
      .map(([key]) => `${key} = ?`)
      .join(', ');

    const values = Object.entries(data)
      .filter(([_, value]) => value !== undefined)
      .map(([_, value]) => value);

    await db.execute({
      sql: `UPDATE loyalty_rules SET ${updates} WHERE id = ?`,
      args: [...values, id]
    });
  }
}