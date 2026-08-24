const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const { JWT_SECRET } = require("../middleware/auth");

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required." });
    const [rows] = await pool.query("SELECT id, name, email, password_hash, role FROM users WHERE email = ? AND role = 'admin'", [email.toLowerCase()]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) return res.status(403).json({ message: "Admin access denied." });
    const safeUser = { id: user.id, name: user.name, email: user.email, role: user.role };
    const token = jwt.sign(safeUser, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: safeUser });
  } catch (error) {
    console.error("Admin login failed:", error.message);
    res.status(500).json({ message: "Admin service is unavailable." });
  }
});

module.exports = router;