const fs = require("fs");
const path = require("path");
const pool = require("../db");

async function runMigrations() {
  const schemaPath = path.join(__dirname, "../db/schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf8");
  await pool.query(schema);
  console.log("Database migrations completed");
}

module.exports = { runMigrations };
