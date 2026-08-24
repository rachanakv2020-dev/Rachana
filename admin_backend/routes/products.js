const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const pool = require("../db");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();
const uploadDirectory = path.join(__dirname, "..", "uploads");
fs.mkdirSync(uploadDirectory, { recursive: true });
const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDirectory,
    filename: (_req, file, callback) => callback(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, "-")}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => callback(null, /^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)),
});

function productQuery(id) { return pool.query("SELECT id, name, category_id AS category, price, unit, stock, listed, tag, image FROM vegetables WHERE id = ?", [id]); }

router.get("/", requireAdmin, async (_req, res) => {
  try { const [products] = await pool.query("SELECT id, name, category_id AS category, price, unit, stock, listed, tag, image FROM vegetables ORDER BY id DESC"); res.json(products); }
  catch (error) { res.status(500).json({ message: "Unable to load products." }); }
});

router.get("/categories", requireAdmin, async (_req, res) => {
  try { const [categories] = await pool.query("SELECT id, name, emoji FROM categories ORDER BY name"); res.json(categories); }
  catch (error) { res.status(500).json({ message: "Unable to load categories." }); }
});

router.post("/upload", requireAdmin, upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Choose a JPG, PNG, WEBP, or GIF image under 5 MB." });
  res.status(201).json({ url: `/uploads/${req.file.filename}` });
});

router.post("/", requireAdmin, async (req, res) => {
  try {
    const { name, category, price, unit = "kg", stock = 0, tag = "", image = "🥬" } = req.body;
    const numericPrice = Number(price); const numericStock = Number(stock);
    if (!name?.trim() || !category?.trim() || !Number.isInteger(numericPrice) || numericPrice < 0 || !Number.isInteger(numericStock) || numericStock < 0) return res.status(400).json({ message: "Name, category, whole-number price, and non-negative stock are required." });
    const [categories] = await pool.query("SELECT id FROM categories WHERE id = ?", [category]);
    if (!categories.length) return res.status(400).json({ message: "Choose an existing category." });
    const [latest] = await pool.query("SELECT COALESCE(MAX(id), 0) + 1 AS nextId FROM vegetables");
    await pool.query("INSERT INTO vegetables (id, name, category_id, price, unit, stock, listed, tag, image) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)", [latest[0].nextId, name.trim(), category, numericPrice, unit.trim(), numericStock, tag.trim(), image]);
    const [created] = await productQuery(latest[0].nextId); res.status(201).json(created[0]);
  } catch (error) { res.status(500).json({ message: "Unable to create product." }); }
});

router.patch("/:id/listed", requireAdmin, async (req, res) => {
  try {
    const listed = req.body.listed ? 1 : 0;
    await pool.query("UPDATE vegetables SET listed = ? WHERE id = ?", [listed, req.params.id]);
    const [updated] = await productQuery(req.params.id);
    if (!updated.length) return res.status(404).json({ message: "Product not found." });
    res.json(updated[0]);
  } catch (error) {
    console.error("Product visibility update failed:", error.message);
    res.status(500).json({ message: "Unable to update product visibility." });
  }
});

router.put("/:id", requireAdmin, async (req, res) => {
  try {
    const { name, category, price, unit, stock, tag = "", image = "🥬" } = req.body;
    const numericPrice = Number(price); const numericStock = Number(stock);
    if (!name?.trim() || !category?.trim() || !Number.isInteger(numericPrice) || numericPrice < 0 || !Number.isInteger(numericStock) || numericStock < 0) return res.status(400).json({ message: "Name, category, whole-number price, and non-negative stock are required." });
    const [result] = await pool.query("UPDATE vegetables SET name = ?, category_id = ?, price = ?, unit = ?, stock = ?, tag = ?, image = ? WHERE id = ?", [name.trim(), category, numericPrice, unit.trim(), numericStock, tag.trim(), image, req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: "Product not found." });
    const [updated] = await productQuery(req.params.id); res.json(updated[0]);
  } catch (error) { res.status(500).json({ message: "Unable to update product." }); }
});

router.delete("/:id", requireAdmin, async (req, res) => {
  try { const [result] = await pool.query("DELETE FROM vegetables WHERE id = ?", [req.params.id]); if (!result.affectedRows) return res.status(404).json({ message: "Product not found." }); res.status(204).end(); }
  catch (error) { res.status(500).json({ message: "Unable to delete product." }); }
});

module.exports = router;