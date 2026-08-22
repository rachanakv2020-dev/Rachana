const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../middleware/auth");

const router = express.Router();

// In-memory user store. Replace with a real database for production use.
const users = [];

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are all required." });
    }

    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = { id: users.length + 1, name, email, passwordHash };
    users.push(user);

    const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong while creating your account." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ message: "Incorrect email or password." });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
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
