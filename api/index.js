import express from 'express';
import cors from 'cors';
import { db } from './db.js';
import { auth } from './routes/auth.js';
import { customers } from './routes/customers.js';
import { transactions } from './routes/transactions.js';
import { rewards } from './routes/rewards.js';

const app = express();

app.use(cors({
  origin: process.env.VERCEL_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    await db.execute('SELECT 1');
    res.json({ status: 'healthy' });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', error: error.message });
  }
});

app.use('/api/auth', auth);
app.use('/api/customers', customers);
app.use('/api/transactions', transactions);
app.use('/api/rewards', rewards);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

export default app;