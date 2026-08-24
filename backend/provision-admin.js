const bcrypt = require("bcryptjs");
const mysql = require("mysql2/promise");
require("dotenv").config();

async function provisionAdmin() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    try {
      await db.query("ALTER TABLE users ADD COLUMN role ENUM('customer','admin') NOT NULL DEFAULT 'customer'");
    } catch (error) {
      if (error.code !== "ER_DUP_FIELDNAME") throw error;
    }
    await db.query("ALTER TABLE vegetables MODIFY COLUMN image VARCHAR(1000) NOT NULL");
    try {
      await db.query("ALTER TABLE vegetables ADD COLUMN listed TINYINT(1) NOT NULL DEFAULT 1");
    } catch (error) {
      if (error.code !== "ER_DUP_FIELDNAME") throw error;
    }
    await db.query(`CREATE TABLE IF NOT EXISTS orders (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      user_id INT UNSIGNED NOT NULL,
      shipping_address VARCHAR(500) NOT NULL,
      total DECIMAL(10, 2) NOT NULL,
      status ENUM('pending', 'processing', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )`);
    try { await db.query("ALTER TABLE orders ADD COLUMN shipping_address VARCHAR(500) NOT NULL DEFAULT ''"); }
    catch (error) { if (error.code !== "ER_DUP_FIELDNAME") throw error; }
    await db.query(`CREATE TABLE IF NOT EXISTS payments (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      order_id BIGINT UNSIGNED NOT NULL,
      user_id INT UNSIGNED NOT NULL,
      amount DECIMAL(10, 2) NOT NULL,
      method VARCHAR(40) NOT NULL DEFAULT 'Cash on delivery',
      status ENUM('pending', 'paid', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
      CONSTRAINT fk_payments_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )`);
    try { await db.query("ALTER TABLE payments ADD COLUMN gateway_order_id VARCHAR(100) NULL, ADD COLUMN gateway_payment_id VARCHAR(100) NULL"); }
    catch (error) { if (error.code !== "ER_DUP_FIELDNAME") throw error; }

    const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
    await db.query(
      `INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'admin')
       ON DUPLICATE KEY UPDATE name = VALUES(name), password_hash = VALUES(password_hash), role = 'admin'`,
      [process.env.ADMIN_NAME, process.env.ADMIN_EMAIL.toLowerCase(), passwordHash]
    );
    console.log(`Admin account ready: ${process.env.ADMIN_EMAIL.toLowerCase()}`);
  } finally {
    await db.end();
  }
}

provisionAdmin().catch((error) => {
  console.error("Admin provisioning failed:", error.message);
  process.exitCode = 1;
});