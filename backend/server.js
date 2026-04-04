const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://paypro-clone.vercel.app',
    'https://paypro-clone-git-main-abdul-mueeds-projects-7f55b5c7.vercel.app',
    'https://paypro-clone-8bcks96dg-abdul-mueeds-projects-7f55b5c7.vercel.app',
    /\.vercel\.app$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
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

// Test route
app.get("/", (req, res) => {
  res.json({ message: "PayPro API is running" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
