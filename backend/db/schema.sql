-- Parks (no dependencies — created first so drivers can reference it)
CREATE TABLE IF NOT EXISTS parks (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  address VARCHAR(255) NOT NULL,
  rating DECIMAL(2, 1) DEFAULT 5.0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Unique index so ON CONFLICT (name) works for park seeding
CREATE UNIQUE INDEX IF NOT EXISTS parks_name_unique ON parks (name);

-- Drivers
CREATE TABLE IF NOT EXISTS drivers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  phone VARCHAR(20) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  yandex_driver_id VARCHAR(100),
  car_model VARCHAR(100),
  park_id INTEGER REFERENCES parks(id),
  balance DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add missing columns to drivers (safe for existing databases)
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS car_model VARCHAR(100);
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS park_id INTEGER REFERENCES parks(id);
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS referral_code VARCHAR(20) UNIQUE;

-- Admins
CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  commission_rate DECIMAL(5, 2) DEFAULT 10.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE admins ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5, 2) DEFAULT 10.00;

-- Withdrawals
CREATE TABLE IF NOT EXISTS withdrawals (
  id SERIAL PRIMARY KEY,
  driver_id INTEGER REFERENCES drivers(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  bank_name VARCHAR(100),
  account_number VARCHAR(50),
  bank_code VARCHAR(10),
  swift_code VARCHAR(20),
  iban VARCHAR(34),
  commission_amount DECIMAL(10, 2) DEFAULT 0,
  net_amount DECIMAL(10, 2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending',
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE withdrawals ADD COLUMN IF NOT EXISTS bank_code VARCHAR(10);
ALTER TABLE withdrawals ADD COLUMN IF NOT EXISTS swift_code VARCHAR(20);
ALTER TABLE withdrawals ADD COLUMN IF NOT EXISTS iban VARCHAR(34);
ALTER TABLE withdrawals ADD COLUMN IF NOT EXISTS net_amount DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE withdrawals ADD COLUMN IF NOT EXISTS processed_at TIMESTAMP;
ALTER TABLE withdrawals ADD COLUMN IF NOT EXISTS commission_amount DECIMAL(10, 2) DEFAULT 0;

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  driver_id INTEGER REFERENCES drivers(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- OTP codes
CREATE TABLE IF NOT EXISTS otp_codes (
  id SERIAL PRIMARY KEY,
  phone VARCHAR(20) NOT NULL,
  otp_code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Earnings
CREATE TABLE IF NOT EXISTS earnings (
  id SERIAL PRIMARY KEY,
  driver_id INTEGER REFERENCES drivers(id) ON DELETE CASCADE,
  ride_id VARCHAR(100) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  ride_date TIMESTAMP NOT NULL,
  synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bank accounts
CREATE TABLE IF NOT EXISTS bank_accounts (
  id SERIAL PRIMARY KEY,
  driver_id INTEGER REFERENCES drivers(id) ON DELETE CASCADE,
  bank_name VARCHAR(100),
  bank_code VARCHAR(10),
  swift_code VARCHAR(20),
  iban VARCHAR(34),
  account_number VARCHAR(50),
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS bank_code VARCHAR(10);
ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS swift_code VARCHAR(20);
ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS iban VARCHAR(34);

-- Referrals (kept for schema compatibility)
CREATE TABLE IF NOT EXISTS referrals (
  id SERIAL PRIMARY KEY,
  referrer_id INTEGER REFERENCES drivers(id) ON DELETE CASCADE,
  referred_id INTEGER REFERENCES drivers(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) DEFAULT 20.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ensure commission rate is 10% for all admins
UPDATE admins SET commission_rate = 10.00 WHERE commission_rate != 10.00;

-- Default parks (10 parks — idempotent via ON CONFLICT)
INSERT INTO parks (name, address, rating) VALUES
  ('Go Pro', 'Tbilisi, Georgia', 4.8),
  ('GS Tbilisi', 'Tbilisi, Georgia', 4.7),
  ('Urban Taxi', 'Tbilisi, Georgia', 4.6),
  ('Draivi', 'Tbilisi, Georgia', 4.9),
  ('New Tech', 'Tbilisi, Georgia', 4.7),
  ('Neo Taxi', 'Tbilisi, Georgia', 4.6),
  ('Sani Go', 'Tbilisi, Georgia', 4.8),
  ('Golden Driver', 'Tbilisi, Georgia', 4.9),
  ('City Taxi', 'Tbilisi, Georgia', 4.5),
  ('Space Taxi', 'Tbilisi, Georgia', 4.7)
ON CONFLICT (name) DO NOTHING;
