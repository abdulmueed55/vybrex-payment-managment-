const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/earnings", require("./routes/earnings"));
app.use("/api/withdrawal", require("./routes/withdrawal"));

// Test route
app.get("/", (req, res) => {
  res.json({ message: "PayPro API is running" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
