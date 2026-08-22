const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { vegetables } = require("../data/vegetables");

const router = express.Router();

// In-memory cart storage keyed by user id. Replace with a database for production use.
const carts = {}; // { [userId]: { [productId]: quantity } }

function getCartForUser(userId) {
  return carts[userId] || {};
}

function serializeCart(userId) {
  const raw = getCartForUser(userId);
  const items = Object.entries(raw)
    .map(([productId, quantity]) => {
      const product = vegetables.find((v) => v.id === Number(productId));
      if (!product) return null;
      return { ...product, quantity, subtotal: Number((product.price * quantity).toFixed(2)) };
    })
    .filter(Boolean);

  const total = Number(items.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2));
  return { items, total };
}

router.get("/", requireAuth, (req, res) => {
  res.json(serializeCart(req.user.id));
});

router.post("/add", requireAuth, (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const product = vegetables.find((v) => v.id === Number(productId));
  if (!product) return res.status(404).json({ message: "Vegetable not found." });

  const cart = getCartForUser(req.user.id);
  cart[productId] = (cart[productId] || 0) + Number(quantity);
  carts[req.user.id] = cart;

  res.json(serializeCart(req.user.id));
});

router.post("/update", requireAuth, (req, res) => {
  const { productId, quantity } = req.body;
  const cart = getCartForUser(req.user.id);

  if (Number(quantity) <= 0) {
    delete cart[productId];
  } else {
    cart[productId] = Number(quantity);
  }
  carts[req.user.id] = cart;

  res.json(serializeCart(req.user.id));
});

router.post("/remove", requireAuth, (req, res) => {
  const { productId } = req.body;
  const cart = getCartForUser(req.user.id);
  delete cart[productId];
  carts[req.user.id] = cart;

  res.json(serializeCart(req.user.id));
});

router.post("/clear", requireAuth, (req, res) => {
  carts[req.user.id] = {};
  res.json(serializeCart(req.user.id));
});

module.exports = router;
