const express = require("express");
const { requireAuth } = require("../middleware/auth");
const pool = require("../db");

const router = express.Router();

async function serializeCart(userId) {
  const [items] = await pool.query(
    `SELECT v.id, v.name, v.category_id AS category, v.price, v.unit, v.stock, v.tag, v.image,
            c.quantity, ROUND(v.price * c.quantity, 2) AS subtotal
     FROM cart_items c JOIN vegetables v ON v.id = c.vegetable_id
     WHERE c.user_id = ? ORDER BY v.id`,
    [userId]
  );
  const total = Number(items.reduce((sum, item) => sum + Number(item.subtotal), 0).toFixed(2));
  return { items, total };
}

router.get("/", requireAuth, async (req, res) => {
  try { res.json(await serializeCart(req.user.id)); }
  catch (err) { res.status(500).json({ message: "Unable to load cart." }); }
});

router.post("/add", requireAuth, async (req, res) => {
  try {
  const { productId, quantity = 1 } = req.body;
  const [products] = await pool.query("SELECT id FROM vegetables WHERE id = ?", [productId]);
  if (!products.length) return res.status(404).json({ message: "Vegetable not found." });
  await pool.query(
    "INSERT INTO cart_items (user_id, vegetable_id, quantity) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)",
    [req.user.id, productId, Number(quantity)]
  );

  res.json(await serializeCart(req.user.id));
  } catch (err) { res.status(500).json({ message: "Unable to update cart." }); }
});

router.post("/update", requireAuth, async (req, res) => {
  try {
  const { productId, quantity } = req.body;

  if (Number(quantity) <= 0) {
    await pool.query("DELETE FROM cart_items WHERE user_id = ? AND vegetable_id = ?", [req.user.id, productId]);
  } else {
    await pool.query("UPDATE cart_items SET quantity = ? WHERE user_id = ? AND vegetable_id = ?", [Number(quantity), req.user.id, productId]);
  }

  res.json(await serializeCart(req.user.id));
  } catch (err) { res.status(500).json({ message: "Unable to update cart." }); }
});

router.post("/remove", requireAuth, async (req, res) => {
  try {
  const { productId } = req.body;
  await pool.query("DELETE FROM cart_items WHERE user_id = ? AND vegetable_id = ?", [req.user.id, productId]);

  res.json(await serializeCart(req.user.id));
  } catch (err) { res.status(500).json({ message: "Unable to update cart." }); }
});

router.post("/clear", requireAuth, async (req, res) => {
  try {
    await pool.query("DELETE FROM cart_items WHERE user_id = ?", [req.user.id]);
    res.json(await serializeCart(req.user.id));
  } catch (err) { res.status(500).json({ message: "Unable to clear cart." }); }
});

module.exports = router;
