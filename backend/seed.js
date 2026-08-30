const pool = require("./db");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const { categories, vegetables } = require("./data/vegetables");

async function seed() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await client.query("TRUNCATE TABLE cart_items RESTART IDENTITY CASCADE");
    await client.query("TRUNCATE TABLE vegetables RESTART IDENTITY CASCADE");
    await client.query("TRUNCATE TABLE categories RESTART IDENTITY CASCADE");

    await client.query(
      `INSERT INTO categories (id, name, emoji)
       VALUES ${categories.map((_, index) => `($${index * 3 + 1}, $${index * 3 + 2}, $${index * 3 + 3})`).join(", ")}
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         emoji = EXCLUDED.emoji`,
      categories.flatMap(({ id, name, emoji }) => [id, name, emoji])
    );

    await client.query(
      `INSERT INTO vegetables (id, name, category_id, price, unit, stock, tag, image)
       VALUES ${vegetables.map((_, index) => `($${index * 8 + 1}, $${index * 8 + 2}, $${index * 8 + 3}, $${index * 8 + 4}, $${index * 8 + 5}, $${index * 8 + 6}, $${index * 8 + 7}, $${index * 8 + 8})`).join(", ")}
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         category_id = EXCLUDED.category_id,
         price = EXCLUDED.price,
         unit = EXCLUDED.unit,
         stock = EXCLUDED.stock,
         tag = EXCLUDED.tag,
         image = EXCLUDED.image`,
      vegetables.flatMap(({ id, name, category, price, unit, stock, tag, image }) => [id, name, category, price, unit, stock, tag, image])
    );

    if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
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
      console.log(`Admin account provisioned for ${process.env.ADMIN_EMAIL.toLowerCase()}.`);
    }

    await client.query("COMMIT");
    console.log(`Seeded ${categories.length} categories and ${vegetables.length} vegetables.`);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((error) => {
  console.error("Seed failed:", error.message);
  process.exitCode = 1;
});
