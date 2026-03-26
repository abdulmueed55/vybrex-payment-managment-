const pool = require("../db");

const requestWithdrawal = async (req, res) => {
  const client = await pool.connect();
  try {
    const { amount, bank_name, account_number } = req.body;
    const driverId = req.driver.id;

    // Validation
    if (!amount || !bank_name || !account_number) {
      return res.status(400).json({ error: "Amount, bank name, and account number are required" });
    }

    if (parseFloat(amount) < 50) {
      return res.status(400).json({ error: "Minimum withdrawal amount is 50" });
    }

    // Use transaction to prevent race conditions
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

    // Create withdrawal record
    const withdrawal = await client.query(
      "INSERT INTO withdrawals (driver_id, amount, bank_name, account_number) VALUES ($1, $2, $3, $4) RETURNING *",
      [driverId, amount, bank_name, account_number]
    );

    // Deduct from driver balance
    await client.query(
      "UPDATE drivers SET balance = balance - $1 WHERE id = $2",
      [amount, driverId]
    );

    await client.query("COMMIT");

    res.status(201).json({ message: "Withdrawal request submitted", withdrawal: withdrawal.rows[0] });
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

module.exports = { requestWithdrawal, getWithdrawals, getWithdrawalById };
