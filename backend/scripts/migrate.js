const fs = require("fs");
const path = require("path");
const pool = require("../db");

async function runMigrations() {
  try {
    const schemaPath = path.join(__dirname, "../db/schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");
    await pool.query(schema);
    console.log("Database migrations completed successfully");
  } catch (err) {
    if (err.message && err.message.includes("already exists")) {
      console.log("Tables already exist — skipping migration");
    } else {
      console.error("Migration error:", err.message);
      throw err;
    }
  }
}

module.exports = { runMigrations };
