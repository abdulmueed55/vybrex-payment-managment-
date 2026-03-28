const pool = require("../db");

const requestWithdrawal = async (req, res) => {
  const client = await pool.connect();
  try {
    const { amount, bank_name, account_number } = req.body;
    const driverId = req.driver.id;

    if (!amount || !bank_name || !account_number) {
      return res.status(400).json({ error: "Amount, bank name, and account number are required" });
    }

    if (parseFloat(amount) < 50) {
      return res.status(400).json({ error: "Minimum withdrawal amount is 50" });
    }

    // Verify bank account is verified
    const bankAcc = await client.query(
      "SELECT id, is_verified, bank_code, swift_code, iban FROM bank_accounts WHERE driver_id = $1 AND bank_name = $2 AND (account_number = $3 OR iban = $3)",
      [driverId, bank_name, account_number]
    );

    if (bankAcc.rows.length === 0) {
      return res.status(400).json({ error: "Bank account not found. Please add your bank account first." });
    }

    if (!bankAcc.rows[0].is_verified) {
      return res.status(400).json({ error: "Bank account not verified yet. Please wait for admin verification." });
    }

    const bankInfo = bankAcc.rows[0];

    await client.query("BEGIN");

    const driverResult = await client.query(
      "SELECT balance FROM drivers WHERE id = $1 FOR UPDATE",
      [driverId]
    );

    const balance = parseFloat(driverResult.rows[0].balance);

    if (parseFloat(amount) > balance) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Insufficient balance", available_balance: balance.toFixed(2) });
    }

    // Get commission rate from admin settings (default 10%)
    const adminResult = await client.query("SELECT commission_rate FROM admins LIMIT 1");
    const commissionRate = parseFloat(adminResult.rows[0]?.commission_rate || 10) / 100;
    const commissionAmount = (parseFloat(amount) * commissionRate).toFixed(2);
    const netAmount = (parseFloat(amount) - parseFloat(commissionAmount)).toFixed(2);

    const withdrawal = await client.query(
      `INSERT INTO withdrawals (driver_id, amount, bank_name, account_number, commission_amount, net_amount, bank_code, swift_code, iban)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [driverId, amount, bank_name, account_number, commissionAmount, netAmount,
       bankInfo.bank_code || null, bankInfo.swift_code || null, bankInfo.iban || account_number]
    );

    await client.query(
      "UPDATE drivers SET balance = balance - $1 WHERE id = $2",
      [amount, driverId]
    );

    await client.query("COMMIT");

    res.status(201).json({
      message: "Withdrawal request submitted",
      withdrawal: withdrawal.rows[0],
      commission: commissionAmount,
      commission_rate: (commissionRate * 100).toFixed(0),
      net_amount: netAmount,
      driver_receives: netAmount,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Request withdrawal error:", err.message);
    res.status(500).json({ error: "Server error" });
  } finally {
    client.release();
  }
};

const getWithdrawals = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM withdrawals WHERE driver_id = $1 ORDER BY created_at DESC",
      [req.driver.id]
    );

    res.json({ withdrawals: result.rows });
  } catch (err) {
    console.error("Get withdrawals error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

const getWithdrawalById = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM withdrawals WHERE id = $1 AND driver_id = $2",
      [req.params.id, req.driver.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Withdrawal not found" });
    }

    res.json({ withdrawal: result.rows[0] });
  } catch (err) {
    console.error("Get withdrawal error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// Get commission rate (public for drivers)
const getCommissionRate = async (req, res) => {
  try {
    const result = await pool.query("SELECT commission_rate FROM admins LIMIT 1");
    res.json({ commission_rate: parseFloat(result.rows[0]?.commission_rate || 10) });
  } catch (err) {
    console.error("Get commission rate error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { requestWithdrawal, getWithdrawals, getWithdrawalById, getCommissionRate };
