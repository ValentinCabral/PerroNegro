import { db } from '../client';
import { z } from 'zod';
import { generateId } from '../utils';
import { hash, verify } from '@node-rs/argon2';

const userSchema = z.object({
  id: z.string().optional(),
  role: z.enum(['admin', 'customer']),
  dni: z.string().optional(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  password: z.string(),
  points: z.number().default(0),
  total_spent: z.number().default(0)
});

export type User = z.infer<typeof userSchema>;

export class UserModel {
  async create(data: Omit<User, 'id'>) {
    const user = userSchema.parse({ ...data, id: generateId() });
    const hashedPassword = await hash(user.password);
    
    await db.execute({
      sql: `
        INSERT INTO users (id, role, dni, name, email, phone, password, points, total_spent)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        user.id,
        user.role,
        user.dni,
        user.name,
        user.email,
        user.phone,
        hashedPassword,
        user.points,
        user.total_spent
      ]
    });

    return user;
  }

  async findByDni(dni: string) {
    const result = await db.execute({
      sql: 'SELECT * FROM users WHERE dni = ?',
      args: [dni]
    });
    return result.rows[0];
  }

  async findByEmail(email: string) {
    const result = await db.execute({
      sql: 'SELECT * FROM users WHERE email = ?',
      args: [email]
    });
    return result.rows[0];
  }

  async findByPhone(phone: string) {
    const result = await db.execute({
      sql: 'SELECT * FROM users WHERE phone = ?',
      args: [phone]
    });
    return result.rows[0];
  }

  async validatePassword(userId: string, password: string) {
    const result = await db.execute({
      sql: 'SELECT password FROM users WHERE id = ?',
      args: [userId]
    });
    const user = result.rows[0];
    if (!user) return false;
    return await verify(user.password, password);
  }

  async updatePoints(userId: string, points: number) {
    await db.execute({
      sql: `
        UPDATE users 
        SET points = points + ? 
        WHERE id = ?
      `,
      args: [points, userId]
    });
  }

  async updateTotalSpent(userId: string, amount: number) {
    await db.execute({
      sql: `
        UPDATE users 
        SET total_spent = total_spent + ? 
        WHERE id = ?
      `,
      args: [amount, userId]
    });
  }

  async getAllCustomers() {
    const result = await db.execute({
      sql: 'SELECT id, name, email, phone, points, total_spent FROM users WHERE role = ?',
      args: ['customer']
    });
    return result.rows;
  }
}