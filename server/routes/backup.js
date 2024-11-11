import express from 'express';
import { db, backupDatabase } from '../db/index.js';

const router = express.Router();

// Ruta para descargar el backup de la base de datos
router.get('/', async (req, res) => {
  try {
    // Genera el respaldo en formato SQL y lo envía como descarga
    await backupDatabase(req, res);
  } catch (error) {
    console.error('Error al generar el backup:', error);
    res.status(500).send('Error al generar el backup');
  }
});

export default router;