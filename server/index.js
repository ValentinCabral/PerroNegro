import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import authRoutes from './routes/auth.js';
import customerRoutes from './routes/customers.js';
import transactionRoutes from './routes/transactions.js';
import loyaltyRoutes from './routes/loyalty.js';
import rewardRoutes from './routes/rewards.js';
import { db } from './db/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/loyalty-rules', loyaltyRoutes);
app.use('/api/rewards', rewardRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", function () {
  console.log(`Server running on port ${PORT}`);
});
