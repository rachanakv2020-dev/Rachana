const path = require("path");
const { Pool } = require("pg");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, ".env") });

module.exports = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    `postgresql://${process.env.DB_USER || "postgres"}@${process.env.DB_HOST || "localhost"}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || "veggie_store"}`,
  password: process.env.DB_PASSWORD || undefined,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 20000,
});