const bcrypt = require("bcryptjs");
const pool = require("../db");

async function createDefaultAdmin() {
  try {
    const result = await pool.query("SELECT id FROM admins WHERE username = $1", ["admin"]);
    if (result.rows.length > 0) {
      console.log("Admin already exists — skipping creation");
      return;
    }
    const passwordHash = await bcrypt.hash("Admin@123", 10);
    await pool.query(
      "INSERT INTO admins (username, password_hash, commission_rate) VALUES ($1, $2, $3)",
      ["admin", passwordHash, 10.00]
    );
    console.log("Default admin created (admin / Admin@123)");
  } catch (err) {
    console.error("Admin creation error:", err.message);
    throw err;
  }
}

module.exports = { createDefaultAdmin };
