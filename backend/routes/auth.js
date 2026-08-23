const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../middleware/auth");
const pool = require("../db");

const router = express.Router();

// In-memory user store. Replace with a real database for production use.
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are all required." });
    }

    const [existingUsers] = await pool.query("SELECT id FROM users WHERE email = ?", [email.toLowerCase()]);
    if (existingUsers.length) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await pool.query("INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)", [name, email.toLowerCase(), passwordHash]);
    const user = { id: result.insertId, name, email: email.toLowerCase() };

    const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error("Signup failed:", err.message);
    res.status(500).json({ message: "Something went wrong while creating your account." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const [userRows] = await pool.query("SELECT id, name, email, password_hash FROM users WHERE email = ?", [email.toLowerCase()]);
    const user = userRows[0];
    if (!user) {
      return res.status(401).json({ message: "Incorrect email or password." });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ message: "Incorrect email or password." });
    }

    const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong while logging you in." });
  }
});

module.exports = router;
