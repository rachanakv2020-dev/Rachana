const express = require("express");
const pool = require("../db");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/", requireAdmin, async (_req, res) => {
  try {
    const [orders] = await pool.query(`
      SELECT o.id, u.name AS customer, o.shipping_address AS address, o.total, o.status, o.created_at AS createdAt,
             COALESCE(p.status, 'pending') AS paymentStatus
      FROM orders o
      JOIN users u ON u.id = o.user_id
      LEFT JOIN payments p ON p.order_id = o.id
      ORDER BY o.created_at DESC
    `);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Unable to load orders." });
  }
});

module.exports = router;