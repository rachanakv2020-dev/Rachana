const express = require("express");
const pool = require("../db");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/", requireAdmin, async (_req, res) => {
  try {
    const [payments] = await pool.query(`SELECT p.id, p.order_id AS orderId, u.name AS customer, p.amount, p.method, p.status, p.created_at AS createdAt FROM payments p JOIN users u ON u.id = p.user_id ORDER BY p.created_at DESC`);
    res.json(payments);
  } catch (error) { res.status(500).json({ message: "Unable to load payments." }); }
});

router.patch("/:id/status", requireAdmin, async (req, res) => {
  try {
    const allowed = ["pending", "paid", "failed", "refunded"];
    if (!allowed.includes(req.body.status)) return res.status(400).json({ message: "Invalid payment status." });
    const [result] = await pool.query("UPDATE payments SET status = ? WHERE id = ?", [req.body.status, req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: "Payment not found." });
    res.json({ id: Number(req.params.id), status: req.body.status });
  } catch (error) { res.status(500).json({ message: "Unable to update payment status." }); }
});

module.exports = router;