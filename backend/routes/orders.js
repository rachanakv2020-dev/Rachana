const express = require("express");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const { requireAuth } = require("../middleware/auth");
const pool = require("../db");

const router = express.Router();
const razorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET && !process.env.RAZORPAY_KEY_ID.includes("your_key") && !process.env.RAZORPAY_KEY_SECRET.includes("your_razorpay")
  ? new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET })
  : null;

async function getCheckoutItems(connection, userId, requestedItems) {
  if (Array.isArray(requestedItems) && requestedItems.length) {
    const items = [];
    for (const requestedItem of requestedItems) {
      const quantity = Number(requestedItem.quantity);
      if (!Number.isInteger(quantity) || quantity <= 0) throw new Error("Invalid cart quantity.");
      const [products] = await connection.query("SELECT price FROM vegetables WHERE id = ? AND listed = 1", [requestedItem.id]);
      if (!products.length) throw new Error("A product in your cart is no longer available.");
      items.push({ quantity, price: products[0].price });
    }
    return items;
  }
  const [items] = await connection.query("SELECT c.quantity, v.price FROM cart_items c JOIN vegetables v ON v.id = c.vegetable_id WHERE c.user_id = ?", [userId]);
  return items;
}

router.post("/razorpay-order", requireAuth, async (req, res) => {
  if (!razorpay) return res.status(503).json({ message: "Razorpay is not configured. Add Razorpay keys to backend/.env." });
  if (!req.body.address?.trim() || req.body.address.trim().length < 10) return res.status(400).json({ message: "Please provide a complete delivery address." });
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const items = await getCheckoutItems(connection, req.user.id, req.body.items);
    if (!items.length) return res.status(400).json({ message: "Your cart is empty." });
    const subtotal = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
    const total = Number((subtotal + (subtotal < 200 ? 20 : 0)).toFixed(2));
    const gatewayOrder = await razorpay.orders.create({ amount: Math.round(total * 100), currency: "INR", receipt: `veggie_${Date.now()}` });
    const [order] = await connection.query("INSERT INTO orders (user_id, shipping_address, total, status) VALUES (?, ?, ?, 'pending')", [req.user.id, req.body.address.trim(), total]);
    await connection.query("INSERT INTO payments (order_id, user_id, amount, method, gateway_order_id, status) VALUES (?, ?, ?, 'Razorpay', ?, 'pending')", [order.insertId, req.user.id, total, gatewayOrder.id]);
    await connection.commit();
    res.status(201).json({ keyId: process.env.RAZORPAY_KEY_ID, razorpayOrderId: gatewayOrder.id, orderId: order.insertId, amount: gatewayOrder.amount, currency: gatewayOrder.currency });
  } catch (error) {
    await connection.rollback();
    res.status(error.message.startsWith("Invalid") || error.message.includes("no longer") ? 400 : 500).json({ message: error.message.startsWith("Invalid") || error.message.includes("no longer") ? error.message : "Unable to start Razorpay checkout." });
  } finally { connection.release(); }
});

router.post("/razorpay-verify", requireAuth, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) return res.status(400).json({ message: "Incomplete Razorpay payment response." });
  const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest("hex");
  if (expectedSignature !== razorpay_signature) return res.status(400).json({ message: "Payment verification failed." });
  try {
    const [result] = await pool.query("UPDATE payments SET gateway_payment_id = ?, status = 'paid' WHERE gateway_order_id = ? AND user_id = ?", [razorpay_payment_id, razorpay_order_id, req.user.id]);
    if (!result.affectedRows) return res.status(404).json({ message: "Payment order not found." });
    await pool.query("UPDATE orders o JOIN payments p ON p.order_id = o.id SET o.status = 'processing' WHERE p.gateway_order_id = ? AND p.user_id = ?", [razorpay_order_id, req.user.id]);
    await pool.query("DELETE FROM cart_items WHERE user_id = ?", [req.user.id]);
    res.json({ status: "paid" });
  } catch (error) { res.status(500).json({ message: "Unable to confirm payment." }); }
});

router.post("/checkout", requireAuth, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    if (!req.body.address?.trim() || req.body.address.trim().length < 10) return res.status(400).json({ message: "Please provide a complete delivery address." });
    await connection.beginTransaction();
    const requestedItems = Array.isArray(req.body.items) ? req.body.items : [];
    let items;
    if (requestedItems.length) {
      items = [];
      for (const requestedItem of requestedItems) {
        const quantity = Number(requestedItem.quantity);
        if (!Number.isInteger(quantity) || quantity <= 0) return res.status(400).json({ message: "Invalid cart quantity." });
        const [products] = await connection.query("SELECT price FROM vegetables WHERE id = ? AND listed = 1", [requestedItem.id]);
        if (!products.length) return res.status(400).json({ message: "A product in your cart is no longer available." });
        items.push({ quantity, price: products[0].price });
      }
    } else {
      [items] = await connection.query("SELECT c.quantity, v.price FROM cart_items c JOIN vegetables v ON v.id = c.vegetable_id WHERE c.user_id = ?", [req.user.id]);
    }
    if (!items.length) return res.status(400).json({ message: "Your cart is empty." });
    const subtotal = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
    const total = Number((subtotal + (subtotal < 200 ? 20 : 0)).toFixed(2));
    const [order] = await connection.query("INSERT INTO orders (user_id, shipping_address, total, status) VALUES (?, ?, ?, 'processing')", [req.user.id, req.body.address.trim(), total]);
    await connection.query("INSERT INTO payments (order_id, user_id, amount, method, status) VALUES (?, ?, ?, ?, 'paid')", [order.insertId, req.user.id, total, req.body.method || "Cash on delivery"]);
    await connection.query("DELETE FROM cart_items WHERE user_id = ?", [req.user.id]);
    await connection.commit();
    res.status(201).json({ orderId: order.insertId, total, status: "paid" });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: "Unable to place your order." });
  } finally { connection.release(); }
});

module.exports = router;