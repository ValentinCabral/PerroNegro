import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const app = express();
const JWT_SECRET = 'perro-negro-secret-key';

// In-memory database
const db = {
  users: [],
  transactions: [],
  loyaltyRules: [],
  rewards: [],
  redemptions: []
};

// Initialize admin user
const adminPassword = bcrypt.hashSync('admin123', 10);
db.users.push({
  id: '1',
  role: 'admin',
  name: 'Administrador',
  email: 'admin@perronegro.com',
  phone: '0000000000',
  password: adminPassword,
  points: 0,
  totalSpent: 0,
  createdAt: new Date().toISOString()
});

// Initialize some rewards
db.rewards.push(
  {
    id: '1',
    name: '10% de descuento',
    pointsCost: 500,
    description: 'Obtén un 10% de descuento en tu próxima compra',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: '20% de descuento',
    pointsCost: 1000,
    description: 'Obtén un 20% de descuento en tu próxima compra',
    isActive: true,
    createdAt: new Date().toISOString()
  }
);

app.use(cors());
app.use(express.json());

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Auth routes
app.post('/api/auth/login', (req, res) => {
  const { identifier, password } = req.body;
  const user = db.users.find(u => u.dni === identifier || u.email === identifier);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET);
  const { password: _, ...userWithoutPassword } = user;

  res.json({ user: userWithoutPassword, token });
});

app.post('/api/auth/register', (req, res) => {
  const { dni, name, email, phone, password } = req.body;

  if (db.users.some(u => u.dni === dni || u.email === email)) {
    return res.status(400).json({ error: 'Usuario ya existe' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = {
    id: Date.now().toString(),
    role: 'customer',
    dni,
    name,
    email,
    phone,
    password: hashedPassword,
    points: 0,
    totalSpent: 0,
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  const token = jwt.sign({ id: newUser.id, role: 'customer' }, JWT_SECRET);
  const { password: _, ...userWithoutPassword } = newUser;

  res.json({ user: userWithoutPassword, token });
});

// Customer routes
app.get('/api/customers', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'No autorizado' });
  }

  const customers = db.users
    .filter(u => u.role === 'customer')
    .map(({ password, ...user }) => user);

  res.json(customers);
});

app.get('/api/customers/search', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'No autorizado' });
  }

  const { dni } = req.query;
  const customer = db.users.find(u => u.role === 'customer' && u.dni === dni);

  if (!customer) {
    return res.status(404).json({ error: 'Cliente no encontrado' });
  }

  const { password, ...customerWithoutPassword } = customer;
  res.json(customerWithoutPassword);
});

app.get('/api/customers/:id/points', authenticateToken, (req, res) => {
  const user = db.users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  // Get next available reward
  const availableRewards = db.rewards
    .filter(r => r.isActive && r.pointsCost > user.points)
    .sort((a, b) => a.pointsCost - b.pointsCost);

  const nextReward = availableRewards[0];
  const pointsData = {
    points: user.points,
    totalSpent: user.totalSpent,
    nextReward: nextReward ? {
      name: nextReward.name,
      pointsNeeded: nextReward.pointsCost - user.points,
      progress: (user.points / nextReward.pointsCost) * 100
    } : null
  };

  res.json(pointsData);
});

app.get('/api/customers/:id/transactions', authenticateToken, (req, res) => {
  const transactions = db.transactions
    .filter(t => t.userId === req.params.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json(transactions);
});

app.get('/api/customers/:id/redemptions', authenticateToken, (req, res) => {
  const { id } = req.params;

  if (req.user.role !== 'admin' && req.user.id !== id) {
    return res.status(403).json({ error: 'No autorizado' });
  }

  const userRedemptions = db.redemptions
    .filter(r => r.userId === id)
    .map(redemption => {
      const reward = db.rewards.find(r => r.id === redemption.rewardId);
      const user = db.users.find(u => u.id === redemption.userId);
      return {
        ...redemption,
        reward: reward ? {
          name: reward.name,
          pointsCost: reward.pointsCost,
          description: reward.description
        } : null,
        user: user ? {
          id: user.id,
          name: user.name,
          email: user.email,
          dni: user.dni
        } : null
      };
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json(userRedemptions);
});

// Transaction routes
app.post('/api/transactions', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'No autorizado' });
  }

  const { userId, amount } = req.body;
  const user = db.users.find(u => u.id === userId);

  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  // Calculate points based on loyalty rules
  const applicableRule = db.loyaltyRules
    .filter(r => r.isActive && amount >= r.minAmount && (!r.maxAmount || amount <= r.maxAmount))
    .sort((a, b) => b.minAmount - a.minAmount)[0];

  let pointsEarned = 0;
  if (applicableRule) {
    const basePoints = applicableRule.pointsEarned;
    const extraAmount = amount - applicableRule.minAmount;
    const extraPoints = Math.floor((extraAmount / applicableRule.minAmount) * basePoints * applicableRule.multiplier);
    pointsEarned = basePoints + extraPoints;
  }

  // Create transaction
  const transaction = {
    id: Date.now().toString(),
    userId,
    type: 'purchase',
    amount,
    pointsEarned,
    description: `Compra por $${amount}`,
    createdAt: new Date().toISOString()
  };

  db.transactions.push(transaction);

  // Update user points and total spent
  user.points += pointsEarned;
  user.totalSpent += amount;

  res.json(transaction);
});

// Loyalty rules routes
app.get('/api/loyalty-rules', authenticateToken, (req, res) => {
  const rules = db.loyaltyRules.filter(r => r.isActive);
  res.json(rules);
});

app.post('/api/loyalty-rules', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'No autorizado' });
  }

  const { minAmount, maxAmount, pointsEarned, multiplier, description } = req.body;
  const rule = {
    id: Date.now().toString(),
    minAmount,
    maxAmount,
    pointsEarned,
    multiplier,
    description,
    isActive: true,
    createdAt: new Date().toISOString()
  };

  db.loyaltyRules.push(rule);
  res.json(rule);
});

// Rewards routes
app.get('/api/rewards', authenticateToken, (req, res) => {
  const rewards = db.rewards.filter(r => r.isActive);
  res.json(rewards);
});

app.post('/api/rewards', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'No autorizado' });
  }

  const { name, pointsCost, description } = req.body;
  const reward = {
    id: Date.now().toString(),
    name,
    pointsCost,
    description,
    isActive: true,
    createdAt: new Date().toISOString()
  };

  db.rewards.push(reward);
  res.json(reward);
});

app.delete('/api/rewards/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'No autorizado' });
  }

  const rewardIndex = db.rewards.findIndex(r => r.id === req.params.id);
  if (rewardIndex === -1) {
    return res.status(404).json({ error: 'Recompensa no encontrada' });
  }

  // Soft delete
  db.rewards[rewardIndex].isActive = false;
  res.json({ message: 'Recompensa eliminada' });
});

// Redemption routes
app.post('/api/rewards/redeem', authenticateToken, (req, res) => {
  const { rewardId } = req.body;
  const userId = req.user.id;

  const user = db.users.find(u => u.id === userId);
  const reward = db.rewards.find(r => r.id === rewardId && r.isActive);

  if (!user || !reward) {
    return res.status(404).json({ error: 'Usuario o recompensa no encontrada' });
  }

  if (user.points < reward.pointsCost) {
    return res.status(400).json({ error: 'Puntos insuficientes' });
  }

  // Create redemption
  const redemption = {
    id: Date.now().toString(),
    userId,
    rewardId,
    pointsCost: reward.pointsCost,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  // Create redemption transaction
  const transaction = {
    id: (Date.now() + 1).toString(),
    userId,
    type: 'redemption',
    amount: 0,
    pointsEarned: -reward.pointsCost,
    description: `Canje: ${reward.name}`,
    redemptionId: redemption.id,
    createdAt: new Date().toISOString()
  };

  db.redemptions.push(redemption);
  db.transactions.push(transaction);
  user.points -= reward.pointsCost;

  res.json({ redemption, transaction });
});

app.get('/api/rewards/redemptions', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'No autorizado' });
  }

  const redemptions = db.redemptions
    .map(redemption => {
      const reward = db.rewards.find(r => r.id === redemption.rewardId);
      const user = db.users.find(u => u.id === redemption.userId);
      return {
        ...redemption,
        reward: reward ? {
          name: reward.name,
          pointsCost: reward.pointsCost,
          description: reward.description
        } : null,
        user: user ? {
          id: user.id,
          name: user.name,
          email: user.email,
          dni: user.dni
        } : null
      };
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json(redemptions);
});

app.patch('/api/rewards/redemptions/:id/status', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'No autorizado' });
  }

  const { id } = req.params;
  const { status } = req.body;

  const redemption = db.redemptions.find(r => r.id === id);
  if (!redemption) {
    return res.status(404).json({ error: 'Canje no encontrado' });
  }

  if (status === 'cancelled' && redemption.status === 'applied') {
    return res.status(400).json({ error: 'No se puede cancelar un canje ya aplicado' });
  }

  redemption.status = status;
  redemption[`${status}At`] = new Date().toISOString();

  // If cancelled, refund points
  if (status === 'cancelled') {
    const user = db.users.find(u => u.id === redemption.userId);
    if (user) {
      user.points += redemption.pointsCost;

      // Create refund transaction
      const refundTransaction = {
        id: Date.now().toString(),
        userId: user.id,
        type: 'refund',
        amount: 0,
        pointsEarned: redemption.pointsCost,
        description: 'Reembolso por canje cancelado',
        redemptionId: redemption.id,
        createdAt: new Date().toISOString()
      };

      db.transactions.push(refundTransaction);
    }
  }

  res.json(redemption);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});