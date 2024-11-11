import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
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

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/loyalty-rules', loyaltyRoutes);
app.use('/api/rewards', rewardRoutes);

// Endpoint para descargar el backup de la base de datos
app.get('/api/backup', (req, res) => {
  const dbPath = join(__dirname, 'database.sqlite');
  
  fs.access(dbPath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).json({ message: 'Database file not found' });
    }

    res.download('./server/db/database.sqlite', 'database-backup.sqlite', (err) => {
      if (err) {
        console.error('Error al descargar el archivo:', err);
        res.status(500).json({ message: 'Error downloading the backup file' });
      }
    });
  });
});

// Servir los archivos estáticos generados por Vite en la carpeta "dist"
app.use(express.static(join(__dirname, '../dist')));

// Enrutamiento de cualquier otra ruta hacia el archivo index.html (para React Router)
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../dist', 'index.html'));
});

// Arrancar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", function () {
  console.log(`Server running on port ${PORT}`);
});
