const bcrypt = require("bcryptjs");
const { Client } = require("pg");
require("dotenv").config();

async function provisionAdmin() {
  const client = new Client({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || undefined,
    database: process.env.DB_NAME || "veggie_store",
  });

  await client.connect();

  try {
    await client.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'customer'");
    await client.query("ALTER TABLE users ALTER COLUMN role SET DEFAULT 'customer'");
    await client.query("ALTER TABLE vegetables ADD COLUMN IF NOT EXISTS image VARCHAR(1000)");
    await client.query("UPDATE vegetables SET image = COALESCE(image, '🥬') WHERE image IS NULL");
    await client.query("ALTER TABLE vegetables ALTER COLUMN image SET NOT NULL");
    await client.query("ALTER TABLE vegetables ADD COLUMN IF NOT EXISTS listed BOOLEAN NOT NULL DEFAULT true");

    await client.query(`CREATE TABLE IF NOT EXISTS orders (
      id BIGSERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      shipping_address VARCHAR(500) NOT NULL,
      total NUMERIC(10, 2) NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )`);
    await client.query("ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address VARCHAR(500)");
    await client.query("UPDATE orders SET shipping_address = '' WHERE shipping_address IS NULL");
    await client.query("ALTER TABLE orders ALTER COLUMN shipping_address SET NOT NULL");

    await client.query(`CREATE TABLE IF NOT EXISTS payments (
      id BIGSERIAL PRIMARY KEY,
      order_id BIGINT NOT NULL,
      user_id INTEGER NOT NULL,
      amount NUMERIC(10, 2) NOT NULL,
      method VARCHAR(40) NOT NULL DEFAULT 'Cash on delivery',
      gateway_order_id VARCHAR(100),
      gateway_payment_id VARCHAR(100),
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
      CONSTRAINT fk_payments_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )`);
    await client.query("ALTER TABLE payments ADD COLUMN IF NOT EXISTS gateway_order_id VARCHAR(100)");
    await client.query("ALTER TABLE payments ADD COLUMN IF NOT EXISTS gateway_payment_id VARCHAR(100)");

    const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
    await client.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, 'admin')
       ON CONFLICT (email) DO UPDATE SET
         name = EXCLUDED.name,
         password_hash = EXCLUDED.password_hash,
         role = 'admin'`,
      [process.env.ADMIN_NAME || "Store Administrator", process.env.ADMIN_EMAIL.toLowerCase(), passwordHash]
    );
    console.log(`Admin account ready: ${process.env.ADMIN_EMAIL.toLowerCase()}`);
  } finally {
    await client.end();
  }
}

provisionAdmin().catch((error) => {
  console.error("Admin provisioning failed:", error.message);
  process.exitCode = 1;
});