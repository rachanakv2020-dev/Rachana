const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "veggie-store-dev-secret";

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Please log in to continue." });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Your session has expired. Please log in again." });
  }
}

module.exports = { requireAuth, JWT_SECRET };
