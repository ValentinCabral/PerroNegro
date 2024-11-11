import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import fs from 'fs';

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

// Función modificada para crear un nuevo archivo de backup con los datos actuales
const backupDatabase = async (req, res) => {
  try {
    // Obtener la fecha actual en formato AAAA-MM-DD
    const currentDate = new Date().toISOString().slice(0, 10);
    const backupFileName = `database_backup_${currentDate}.sqlite`;
    const backupDir = join(__dirname, 'temp');
    const backupPath = join(backupDir, backupFileName);

    // Verificar si la carpeta "temp" existe, si no, crearla
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }

    // Crear una nueva base de datos temporal para el respaldo
    const backupDb = new sqlite3.Database(backupPath, (err) => {
      if (err) {
        throw new Error('Error creating backup database: ' + err.message);
      }
    });

    // Función auxiliar para ejecutar queries en la base de datos de backup
    const runBackupQuery = (query, params = []) => {
      return new Promise((resolve, reject) => {
        backupDb.run(query, params, function(err) {
          if (err) reject(err);
          else resolve(this);
        });
      });
    };

    // Función auxiliar para obtener todos los registros
    const getAllRows = (query, params = []) => {
      return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });
    };

    // Crear todas las tablas en la nueva base de datos
    await runBackupQuery('PRAGMA foreign_keys = ON');
    await runBackupQuery('PRAGMA journal_mode = WAL');

    // Crear las tablas
    const tableQueries = [
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
      )`,
      `CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('purchase', 'redemption')),
        amount REAL NOT NULL,
        points_earned INTEGER NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`,
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
      )`,
      `CREATE TABLE IF NOT EXISTS rewards (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        points_cost INTEGER NOT NULL,
        description TEXT NOT NULL,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        CHECK (points_cost > 0)
      )`,
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
    ];

    // Ejecutar las queries de creación de tablas
    for (const query of tableQueries) {
      await runBackupQuery(query);
    }

    // Obtener y copiar datos de cada tabla
    const tables = ['users', 'transactions', 'loyalty_rules', 'rewards', 'redemptions'];
    
    for (const table of tables) {
      const rows = await getAllRows(`SELECT * FROM ${table}`);
      
      if (rows.length > 0) {
        const columns = Object.keys(rows[0]).join(', ');
        const placeholders = Object.keys(rows[0]).map(() => '?').join(', ');
        
        for (const row of rows) {
          const values = Object.values(row);
          await runBackupQuery(
            `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`,
            values
          );
        }
      }
    }

    // Crear índices
    const indexQueries = [
      'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
      'CREATE INDEX IF NOT EXISTS idx_users_dni ON users(dni)',
      'CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_redemptions_user_id ON redemptions(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_redemptions_reward_id ON redemptions(reward_id)'
    ];

    for (const query of indexQueries) {
      await runBackupQuery(query);
    }

    // Cerrar la conexión de la base de datos de backup
    await new Promise((resolve, reject) => {
      backupDb.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Enviar el archivo como descarga
    res.download(backupPath, backupFileName, (err) => {
      if (err) {
        console.error('Error during file download:', err);
        res.status(500).send('Error al descargar el archivo');
      }
      // Eliminar el archivo temporal después de la descarga
      fs.unlink(backupPath, (unlinkErr) => {
        if (unlinkErr) {
          console.error('Error deleting temporary backup file:', unlinkErr);
        }
      });
    });

  } catch (error) {
    console.error('Error during backup:', error);
    res.status(500).send('Error al generar el backup');
  }
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

export { db, all, get, run, runTransaction, backupDatabase };

