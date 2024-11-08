import express from 'express';
import cors from 'cors';
import { auth } from './routes/auth.ts';
import { customers } from './routes/customers.ts';
import { transactions } from './routes/transactions.ts';
import { rewards } from './routes/rewards.ts';

const app = express();

// Configuración de CORS para producción y desarrollo
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://perronegro-1.onrender.com']
    : ['http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', environment: process.env.NODE_ENV });
});

// Rutas de la API sin el prefijo /api ya que Render lo maneja
app.use('/auth', auth);
app.use('/customers', customers);
app.use('/transactions', transactions);
app.use('/rewards', rewards);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal Server Error' 
      : err.message 
  });
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.url}` });
});

const PORT = process.env.PORT || 3000;

// Solo escucha si no está siendo importado como módulo
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`CORS enabled for: ${process.env.NODE_ENV === 'production' 
      ? 'https://perronegro-1.onrender.com'
      : 'http://localhost:5173'}`);
  });
}

export default app;
