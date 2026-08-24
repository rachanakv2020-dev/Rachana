const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const paymentRoutes = require("./routes/payments");
const orderRoutes = require("./routes/orders");

const app = express();
const PORT = process.env.ADMIN_PORT || 5001;
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.get("/", (_req, res) => res.json({ message: "FarmFresh admin API is running." }));
app.use("/api/admin/auth", authRoutes);
app.use("/api/admin/products", productRoutes);
app.use("/api/admin/payments", paymentRoutes);
app.use("/api/admin/orders", orderRoutes);
app.use((_req, res) => res.status(404).json({ message: "Admin route not found." }));
const server = app.listen(PORT, () => console.log(`FarmFresh admin API listening on http://localhost:${PORT}`));

server.on("error", (error) => {
	if (error.code === "EADDRINUSE") {
		console.error(`Admin API is already running on port ${PORT}. Use the existing process instead of starting another one.`);
		process.exit(0);
	}
	console.error("Admin API failed to start:", error.message);
	process.exit(1);
});