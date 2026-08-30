const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../middleware/auth");
const pool = require("../db");

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are all required." });
    }

    const normalizedEmail = email.toLowerCase();
    const { rows: existingUsers } = await pool.query("SELECT id FROM users WHERE email = $1", [normalizedEmail]);
    if (existingUsers.length) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const { rows: result } = await pool.query(
      "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id",
      [name, normalizedEmail, passwordHash]
    );
    const user = { id: result[0].id, name, email: normalizedEmail };

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

    const { rows: userRows } = await pool.query(
      "SELECT id, name, email, password_hash, role FROM users WHERE email = $1",
      [email.toLowerCase()]
    );
    const user = userRows[0];
    if (!user) {
      return res.status(401).json({ message: "Incorrect email or password." });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ message: "Incorrect email or password." });
    }

    const token = jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong while logging you in." });
  }
});

module.exports = router;
