const bcrypt = require("bcryptjs");
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

const linkYandexId = async (req, res) => {
  try {
    const { yandex_driver_id } = req.body;
    if (!yandex_driver_id) return res.status(400).json({ error: "Yandex Driver ID is required" });

    await pool.query("UPDATE drivers SET yandex_driver_id = $1 WHERE id = $2", [yandex_driver_id, req.driver.id]);
    res.json({ message: "Yandex Driver ID linked successfully" });
  } catch (err) {
    console.error("Link Yandex ID error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// Supported banks
const SUPPORTED_BANKS = {
  TBC: { name: "TBC Bank", code: "TBC", swift: "TBCBGE22" },
  BOG: { name: "Bank of Georgia", code: "BOG", swift: "BAGAGE22" },
};

const validateIBAN = (iban) => {
  if (!iban) return false;
  const cleaned = iban.replace(/\s/g, "").toUpperCase();
  return /^GE\d{2}[A-Z0-9]{18}$/.test(cleaned) && cleaned.length === 22;
};

// Bank accounts
const addBankAccount = async (req, res) => {
  try {
    const { bank_code, iban } = req.body;
    if (!bank_code || !iban) return res.status(400).json({ error: "Bank and IBAN are required" });

    const bank = SUPPORTED_BANKS[bank_code];
    if (!bank) return res.status(400).json({ error: "Unsupported bank. Use TBC or BOG" });

    if (!validateIBAN(iban)) {
      return res.status(400).json({ error: "Invalid IBAN. Must be Georgian format (GE + 20 characters, 22 total)" });
    }

    const cleanIban = iban.replace(/\s/g, "").toUpperCase();

    const existing = await pool.query(
      "SELECT id FROM bank_accounts WHERE driver_id = $1 AND iban = $2",
      [req.driver.id, cleanIban]
    );
    if (existing.rows.length > 0) return res.status(400).json({ error: "This account is already added" });

    const result = await pool.query(
      "INSERT INTO bank_accounts (driver_id, bank_name, account_number, bank_code, swift_code, iban) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [req.driver.id, bank.name, cleanIban, bank.code, bank.swift, cleanIban]
    );
    res.status(201).json({ message: "Bank account added, pending verification", bank_account: result.rows[0] });
  } catch (err) {
    console.error("Add bank account error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

const getBankAccounts = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM bank_accounts WHERE driver_id = $1 ORDER BY created_at DESC",
      [req.driver.id]
    );
    res.json({ bank_accounts: result.rows });
  } catch (err) {
    console.error("Get bank accounts error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

const deleteBankAccount = async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM bank_accounts WHERE id = $1 AND driver_id = $2 RETURNING *",
      [req.params.id, req.driver.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Bank account not found" });
    res.json({ message: "Bank account removed" });
  } catch (err) {
    console.error("Delete bank account error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { updateProfile, changePassword, joinPark, linkYandexId, addBankAccount, getBankAccounts, deleteBankAccount };
