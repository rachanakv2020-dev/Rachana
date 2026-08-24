const pool = require("./db");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const { categories, vegetables } = require("./data/vegetables");

async function seed() {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query("SET FOREIGN_KEY_CHECKS = 0");
    await connection.query("TRUNCATE TABLE cart_items");
    await connection.query("TRUNCATE TABLE vegetables");
    await connection.query("TRUNCATE TABLE categories");
    await connection.query("SET FOREIGN_KEY_CHECKS = 1");

    await connection.query("INSERT INTO categories (id, name, emoji) VALUES ?", [
      categories.map(({ id, name, emoji }) => [id, name, emoji]),
    ]);
    await connection.query(
      "INSERT INTO vegetables (id, name, category_id, price, unit, stock, tag, image) VALUES ?",
      [vegetables.map(({ id, name, category, price, unit, stock, tag, image }) => [id, name, category, price, unit, stock, tag, image])]
    );

    if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
      const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
      await connection.query(
        `INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'admin')
         ON DUPLICATE KEY UPDATE name = VALUES(name), password_hash = VALUES(password_hash), role = 'admin'`,
        [process.env.ADMIN_NAME || "Store Administrator", process.env.ADMIN_EMAIL.toLowerCase(), passwordHash]
      );
      console.log(`Admin account provisioned for ${process.env.ADMIN_EMAIL.toLowerCase()}.`);
    }
    await connection.commit();
    console.log(`Seeded ${categories.length} categories and ${vegetables.length} vegetables.`);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
}

seed().catch((error) => {
  console.error("Seed failed:", error.message);
  process.exitCode = 1;
});
