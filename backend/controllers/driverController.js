const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const pool = require("../db");

const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });
    const result = await pool.query(
      "UPDATE drivers SET name = $1 WHERE id = $2 RETURNING id, name, phone",
      [name, req.driver.id]
    );
    res.json({ message: "Profile updated", driver: result.rows[0] });
  } catch (err) {
    console.error("Update profile error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ error: "Both passwords are required" });
    if (newPassword.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });

    const driver = await pool.query("SELECT password_hash FROM drivers WHERE id = $1", [req.driver.id]);
    const valid = await bcrypt.compare(currentPassword, driver.rows[0].password_hash);
    if (!valid) return res.status(400).json({ error: "Current password is incorrect" });

    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE drivers SET password_hash = $1 WHERE id = $2", [hash, req.driver.id]);
    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Change password error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

const getReferralCode = async (req, res) => {
  try {
    let driver = await pool.query("SELECT referral_code FROM drivers WHERE id = $1", [req.driver.id]);
    let code = driver.rows[0].referral_code;
    if (!code) {
      code = "PP-" + crypto.randomBytes(4).toString("hex").toUpperCase();
      await pool.query("UPDATE drivers SET referral_code = $1 WHERE id = $2", [code, req.driver.id]);
    }
    res.json({ referral_code: code });
  } catch (err) {
    console.error("Get referral code error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

const joinPark = async (req, res) => {
  try {
    const { park_id } = req.body;
    if (!park_id) return res.status(400).json({ error: "Park ID is required" });

    const park = await pool.query("SELECT id FROM parks WHERE id = $1", [park_id]);
    if (park.rows.length === 0) return res.status(404).json({ error: "Park not found" });

    await pool.query("UPDATE drivers SET park_id = $1 WHERE id = $2", [park_id, req.driver.id]);
    res.json({ message: "Joined park successfully" });
  } catch (err) {
    console.error("Join park error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

const getReferrals = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT r.*, d.name AS referred_name FROM referrals r JOIN drivers d ON r.referred_id = d.id WHERE r.referrer_id = $1 ORDER BY r.created_at DESC",
      [req.driver.id]
    );
    res.json({ referrals: result.rows, count: result.rows.length });
  } catch (err) {
    console.error("Get referrals error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { updateProfile, changePassword, getReferralCode, joinPark, getReferrals };
