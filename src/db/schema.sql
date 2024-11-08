-- Initialize database schema
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL,
  dni TEXT UNIQUE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  points INTEGER DEFAULT 0,
  total_spent REAL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  amount REAL NOT NULL,
  points_earned INTEGER NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS loyalty_rules (
  id TEXT PRIMARY KEY,
  min_amount REAL NOT NULL,
  max_amount REAL,
  points_earned INTEGER NOT NULL,
  multiplier REAL DEFAULT 1,
  description TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rewards (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  points_cost INTEGER NOT NULL,
  description TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create initial admin user
INSERT OR IGNORE INTO users (
  id, role, name, email, phone, password, points, total_spent
) VALUES (
  'admin',
  'admin',
  'Administrador',
  'admin@perronegro.com',
  '1234567890',
  '$argon2id$v=19$m=16,t=2,p=1$emVmZXJpc3RhcnM$K6hQgGWHJLf1W3n6Yfx7yA', -- password: admin123
  0,
  0
);