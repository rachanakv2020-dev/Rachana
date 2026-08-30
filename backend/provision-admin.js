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
