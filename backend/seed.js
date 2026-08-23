const pool = require("./db");
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
