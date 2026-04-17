const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./db");
const { runMigrations } = require("./scripts/migrate");
const { createDefaultAdmin } = require("./scripts/createAdmin");

const app = express();
const PORT = process.env.PORT || 5000;

// CORS — allow all origins for production flexibility
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.options('*', cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));
console.log("Mounted /api/auth");
app.use("/api/earnings", require("./routes/earnings"));
console.log("Mounted /api/earnings");
app.use("/api/withdrawal", require("./routes/withdrawal"));
console.log("Mounted /api/withdrawal");
app.use("/api/admin", require("./routes/admin"));
console.log("Mounted /api/admin");
app.use("/api/driver", require("./routes/driver"));
console.log("Mounted /api/driver");

// Health check with DB status
app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", db: "connected", timestamp: new Date().toISOString() });
  } catch (err) {
    res.json({ status: "ok", db: "disconnected", error: err.message, timestamp: new Date().toISOString() });
  }
});

app.get("/", (req, res) => {
  res.json({ message: "PayPro API is running" });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: "Route not found", path: req.originalUrl });
});

// Error middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack);
  res.status(500).json({ error: "Internal server error" });
});

async function startServer() {
  try {
    // Test DB connection
    await pool.query("SELECT 1");
    console.log("Database connected successfully");
  } catch (err) {
    console.error("Database connection failed:", err.message);
    console.log("Server will start anyway — DB may connect later");
  }

  try {
    await runMigrations();
  } catch (err) {
    console.error("Migration warning:", err.message);
  }

  try {
    await createDefaultAdmin();
  } catch (err) {
    console.error("Admin creation warning:", err.message);
  }

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

startServer();
