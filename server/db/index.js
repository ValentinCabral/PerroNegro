import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import fs from 'fs';
import process from 'process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Enable verbose mode for debugging
sqlite3.verbose();

// Create database connection with proper configuration
const db = new sqlite3.Database(join(__dirname, 'database.sqlite'), (err) => {
  if (err) {
    console.error('Error connecting to database:', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Función para descargar el archivo database.sqlite
const backupDatabase = (req, res) => {
  // Obtener la fecha actual en formato AAAA-MM-DD
  const currentDate = new Date().toISOString().slice(0, 10);

  // Nombre del archivo de respaldo con fecha
  const backupFileName = `database_backup_${currentDate}.sqlite`;
  const backupPath = join(__dirname, backupFileName); // Ruta al archivo de respaldo

  // Crear una nueva conexión a la base de datos original
  const originalDb = new sqlite3.Database(join(__dirname, 'database.sqlite')); 

  // Crear una nueva conexión a la base de datos de backup
  const backupDb = new sqlite3.Database(backupPath); 

  // Función para exportar datos de una tabla
  const exportTable = (tableName, callback) => {
    originalDb.each(`SELECT * FROM ${tableName}`, (err, row) => {
      if (err) {
        console.error(`Error exporting ${tableName} data:`, err);
        originalDb.close();
        backupDb.close();
        res.status(500).send('Error al generar el backup');
        return;
      }

      // Insertar los datos de la tabla en la base de datos de backup
      backupDb.run(`INSERT INTO ${tableName} VALUES (${Array(Object.keys(row).length).fill('?').join(',')})`,
        Object.values(row),
        (err) => {
          if (err) {
            console.error(`Error inserting ${tableName} data:`, err);
          }
        }
      );
    }, callback);
  };

  // Exportar datos de todas las tablas
  exportTable('users', () => {
    exportTable('transactions', () => {
      exportTable('loyalty_rules', () => {
        exportTable('rewards', () => {
          exportTable('redemptions', () => {
            // Cerrar las conexiones
            originalDb.close();
            backupDb.close();

            // Enviar el archivo de respaldo como descarga
            res.download(backupPath, backupFileName, (err) => {
              if (err) {
                console.error('Error during file download:', err);
                res.status(500).send('Error al descargar el archivo');
              }
            });
          });
        });
      });
    });
  });
};



// Enable foreign keys and WAL mode for better performance
db.serialize(() => {
  db.run('PRAGMA foreign_keys = ON');
  db.run('PRAGMA journal_mode = WAL');

  // Create tables
  db.run(
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      role TEXT NOT NULL CHECK (role IN ('admin', 'customer')),
      dni TEXT UNIQUE,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      password TEXT NOT NULL,
      points INTEGER DEFAULT 0,
      total_spent REAL DEFAULT 0,
      reset_token TEXT,
      reset_token_expires DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  );

  db.run(
    `CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('purchase', 'redemption')),
      amount REAL NOT NULL,
      points_earned INTEGER NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`
  );

  db.run(
    `CREATE TABLE IF NOT EXISTS loyalty_rules (
      id TEXT PRIMARY KEY,
      min_amount REAL NOT NULL,
      max_amount REAL,
      points_earned INTEGER NOT NULL,
      multiplier REAL DEFAULT 1,
      description TEXT NOT NULL,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      CHECK (min_amount >= 0),
      CHECK (max_amount IS NULL OR max_amount > min_amount)
    )`
  );

  db.run(
    `CREATE TABLE IF NOT EXISTS rewards (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      points_cost INTEGER NOT NULL,
      description TEXT NOT NULL,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      CHECK (points_cost > 0)
    )`
  );

  db.run(
    `CREATE TABLE IF NOT EXISTS redemptions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      reward_id TEXT NOT NULL,
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'applied', 'cancelled')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      applied_at DATETIME,
      cancelled_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (reward_id) REFERENCES rewards(id) ON DELETE CASCADE
    )`
  );

  // Create indices for better query performance
  db.run('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
  db.run('CREATE INDEX IF NOT EXISTS idx_users_dni ON users(dni)');
  db.run('CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_redemptions_user_id ON redemptions(user_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_redemptions_reward_id ON redemptions(reward_id)');

  // Initialize admin user if not exists
  const adminId = crypto.randomBytes(16).toString('hex');
  const hashedPassword = bcrypt.hashSync('admin123', 10);

  db.run(
    `INSERT OR IGNORE INTO users (id, role, name, email, phone, password)
    VALUES (?, ?, ?, ?, ?, ?)`
  , [
    adminId,
    'admin',
    'Administrador',
    'admin@perronegro.com',
    '0000000000',
    hashedPassword
  ]);
});

// Helper function to promisify db.all
const all = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        console.error('Database error (all):', err);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

// Helper function to promisify db.get
const get = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) {
        console.error('Database error (get):', err);
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

// Helper function to promisify db.run
const run = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) {
        console.error('Database error (run):', err);
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
};

// Helper function to run queries in a transaction
const runTransaction = async (queries) => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');

      try {
        const results = [];
        for (const { query, params } of queries) {
          results.push(
            new Promise((resolveQuery, rejectQuery) => {
              db.run(query, params, function(err) {
                if (err) rejectQuery(err);
                else resolveQuery({ id: this.lastID, changes: this.changes });
              });
            })
          );
        }

        Promise.all(results)
          .then((queryResults) => {
            db.run('COMMIT', (err) => {
              if (err) reject(err);
              else resolve(queryResults);
            });
          })
          .catch((err) => {
            db.run('ROLLBACK', () => reject(err));
          });
      } catch (err) {
        db.run('ROLLBACK', () => reject(err));
      }
    });
  });
};

process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database connection closed');
    }
    process.exit(err ? 1 : 0);
  });
});

export { db, all, get, run, runTransaction, backupDatabase};
