const jwt = require("jsonwebtoken");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "..", ".env") });
const JWT_SECRET = process.env.JWT_SECRET || "veggie-store-dev-secret";

function requireAdmin(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Admin login required." });
  try {
    const user = jwt.verify(token, JWT_SECRET);
    if (user.role !== "admin") return res.status(403).json({ message: "Admin access required." });
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Your admin session has expired." });
  }
}

module.exports = { JWT_SECRET, requireAdmin };