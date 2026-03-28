const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const pool = require("../db");

// Email transporter (configure in .env)
let emailTransporter = null;
if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  emailTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

const sendOtpEmail = async (email, otpCode) => {
  if (!emailTransporter) return false;
  try {
    await emailTransporter.sendMail({
      from: `"PayPro" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Your PayPro OTP Code",
      html: `<div style="font-family:Inter,sans-serif;padding:20px"><h2>PayPro Verification</h2><p>Your OTP code is:</p><h1 style="letter-spacing:8px;font-size:32px">${otpCode}</h1><p>This code expires in 5 minutes.</p></div>`,
    });
    return true;
  } catch (err) {
    console.error("Email send error:", err.message);
    return false;
  }
};

const register = async (req, res) => {
  try {
    const { name, phone, password, yandex_driver_id, email } = req.body;

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
      "INSERT INTO drivers (name, phone, password_hash, yandex_driver_id, email) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, phone, yandex_driver_id, email, balance, created_at",
      [name, phone, password_hash, yandex_driver_id || null, email || null]
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

    const driver = await pool.query("SELECT id, email FROM drivers WHERE phone = $1", [phone]);
    if (driver.rows.length === 0) {
      return res.status(404).json({ error: "Phone number not found" });
    }

    const otp_code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires_at = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await pool.query(
      "INSERT INTO otp_codes (phone, otp_code, expires_at) VALUES ($1, $2, $3)",
      [phone, otp_code, expires_at]
    );

    // Try email delivery first
    const driverEmail = driver.rows[0].email;
    let emailSent = false;
    if (driverEmail) {
      emailSent = await sendOtpEmail(driverEmail, otp_code);
    }

    // Log OTP for development/testing
    console.log(`OTP for ${phone}: ${otp_code}`);

    const response = { message: "OTP sent successfully" };

    if (emailSent) {
      response.delivery = "email";
      response.email_hint = driverEmail.replace(/(.{2})(.*)(@.*)/, "$1***$3");
    } else {
      // Return OTP in response as fallback (for dev/testing, remove in production)
      response.otp = otp_code;
      response.delivery = "response";
    }

    res.json(response);
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
      "SELECT id, name, phone, email, yandex_driver_id, balance, park_id, referral_code, created_at FROM drivers WHERE id = $1",
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
