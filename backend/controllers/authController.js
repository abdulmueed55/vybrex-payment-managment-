const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");

const register = async (req, res) => {
  try {
    const { name, phone, password } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({ error: "Name, phone, and password are required" });
    }

    const existing = await pool.query("SELECT id FROM drivers WHERE phone = $1", [phone]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: "Phone number already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const result = await pool.query(
      "INSERT INTO drivers (name, phone, password_hash) VALUES ($1, $2, $3) RETURNING id, name, phone, balance, created_at",
      [name, phone, password_hash]
    );

    res.status(201).json({ message: "Driver registered successfully", driver: result.rows[0] });
  } catch (err) {
    console.error("Register error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    const driver = await pool.query("SELECT id FROM drivers WHERE phone = $1", [phone]);
    if (driver.rows.length === 0) {
      return res.status(404).json({ error: "Phone number not found" });
    }

    const otp_code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires_at = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await pool.query(
      "INSERT INTO otp_codes (phone, otp_code, expires_at) VALUES ($1, $2, $3)",
      [phone, otp_code, expires_at]
    );

    // TODO: Send OTP via SMS service
    res.json({ message: "OTP sent successfully", otp: otp_code });
  } catch (err) {
    console.error("Send OTP error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ error: "Phone and OTP are required" });
    }

    const result = await pool.query(
      "SELECT * FROM otp_codes WHERE phone = $1 AND otp_code = $2 AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1",
      [phone, otp]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    // Delete used OTP
    await pool.query("DELETE FROM otp_codes WHERE phone = $1", [phone]);

    const driver = await pool.query(
      "SELECT id, name, phone, balance FROM drivers WHERE phone = $1",
      [phone]
    );

    const token = jwt.sign(
      { id: driver.rows[0].id, phone: driver.rows[0].phone },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ message: "OTP verified", token, driver: driver.rows[0] });
  } catch (err) {
    console.error("Verify OTP error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

const getProfile = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, phone, yandex_driver_id, balance, created_at FROM drivers WHERE id = $1",
      [req.driver.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Driver not found" });
    }

    res.json({ driver: result.rows[0] });
  } catch (err) {
    console.error("Get profile error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { register, sendOtp, verifyOtp, getProfile };
