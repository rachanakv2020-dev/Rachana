const express = require("express");
const pool = require("../db");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = "SELECT id, name, category_id AS category, price, unit, stock, listed, tag, image FROM vegetables WHERE listed = true";
    const values = [];

    if (category && category !== "all") {
      query += " AND category_id = $" + (values.length + 1);
      values.push(category);
    }

    if (search) {
      query += " AND LOWER(name) LIKE $" + (values.length + 1);
      values.push(`%${search.toLowerCase()}%`);
    }

    const { rows: results } = await pool.query(query, values);
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: "Unable to load vegetables." });
  }
});

router.get("/categories", async (req, res) => {
  try {
    const { rows: categories } = await pool.query("SELECT id, name, emoji FROM categories ORDER BY name");
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: "Unable to load categories." });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { rows: vegetables } = await pool.query(
      "SELECT id, name, category_id AS category, price, unit, stock, tag, image FROM vegetables WHERE id = $1",
      [req.params.id]
    );
    if (!vegetables.length) return res.status(404).json({ message: "Vegetable not found." });
    res.json(vegetables[0]);
  } catch (err) {
    res.status(500).json({ message: "Unable to load vegetable." });
  }
});

module.exports = router;
