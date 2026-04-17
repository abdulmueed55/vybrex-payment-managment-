const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { runMigrations } = require("./scripts/migrate");
const { createDefaultAdmin } = require("./scripts/createAdmin");

const app = express();
const PORT = process.env.PORT || 5000;

const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://paypro-clone.vercel.app',
    'https://paypro-clone-git-main-abdul-mueeds-projects-7f55b5c7.vercel.app',
    'https://paypro-clone-8bcks96dg-abdul-mueeds-projects-7f55b5c7.vercel.app',
    /\.vercel\.app$/,
    process.env.FRONTEND_URL,
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/earnings", require("./routes/earnings"));
app.use("/api/withdrawal", require("./routes/withdrawal"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/driver", require("./routes/driver"));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/", (req, res) => {
  res.json({ message: "PayPro API is running" });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

async function startServer() {
  try {
    await runMigrations();
    await createDefaultAdmin();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

startServer();
