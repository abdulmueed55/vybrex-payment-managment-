const pool = require("../db");

const getAllParks = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM parks ORDER BY rating DESC, name ASC");
    res.json({ parks: result.rows });
  } catch (err) {
    console.error("Get parks error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

const createPark = async (req, res) => {
  try {
    const { name, address, rating } = req.body;
    if (!name || !address) return res.status(400).json({ error: "Name and address are required" });
    const result = await pool.query(
      "INSERT INTO parks (name, address, rating) VALUES ($1, $2, $3) RETURNING *",
      [name, address, rating || 5.0]
    );
    res.status(201).json({ park: result.rows[0] });
  } catch (err) {
    console.error("Create park error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

const updatePark = async (req, res) => {
  try {
    const { name, address, rating } = req.body;
    const result = await pool.query(
      "UPDATE parks SET name = COALESCE($1, name), address = COALESCE($2, address), rating = COALESCE($3, rating) WHERE id = $4 RETURNING *",
      [name, address, rating, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Park not found" });
    res.json({ park: result.rows[0] });
  } catch (err) {
    console.error("Update park error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

const deletePark = async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM parks WHERE id = $1 RETURNING *", [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Park not found" });
    res.json({ message: "Park deleted" });
  } catch (err) {
    console.error("Delete park error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { getAllParks, createPark, updatePark, deletePark };
