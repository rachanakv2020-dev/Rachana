const express = require("express");
const { categories, vegetables } = require("../data/vegetables");

const router = express.Router();

// GET /api/products?category=leafy&search=spin
router.get("/", (req, res) => {
  const { category, search } = req.query;
  let results = vegetables;

  if (category && category !== "all") {
    results = results.filter((v) => v.category === category);
  }

  if (search) {
    const term = search.toLowerCase();
    results = results.filter((v) => v.name.toLowerCase().includes(term));
  }

  res.json(results);
});

router.get("/categories", (req, res) => {
  res.json(categories);
});

router.get("/:id", (req, res) => {
  const veg = vegetables.find((v) => v.id === Number(req.params.id));
  if (!veg) return res.status(404).json({ message: "Vegetable not found." });
  res.json(veg);
});

module.exports = router;
