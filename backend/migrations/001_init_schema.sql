CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(32) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  emoji VARCHAR(16) NOT NULL
);

CREATE TABLE IF NOT EXISTS vegetables (
  id INTEGER PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  category_id VARCHAR(32) NOT NULL REFERENCES categories(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  price NUMERIC(10, 2) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  listed BOOLEAN NOT NULL DEFAULT true,
  tag VARCHAR(120) NOT NULL DEFAULT '',
  image VARCHAR(1000) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_vegetables_category ON vegetables(category_id);

CREATE TABLE IF NOT EXISTS cart_items (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vegetable_id INTEGER NOT NULL REFERENCES vegetables(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  PRIMARY KEY (user_id, vegetable_id)
);

CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  shipping_address VARCHAR(500) NOT NULL,
  total NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL,
  method VARCHAR(40) NOT NULL DEFAULT 'Cash on delivery',
  gateway_order_id VARCHAR(100),
  gateway_payment_id VARCHAR(100),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
