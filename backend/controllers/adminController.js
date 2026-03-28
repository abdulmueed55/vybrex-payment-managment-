const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");

const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    const result = await pool.query("SELECT * FROM admins WHERE username = $1", [username]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const admin = result.rows[0];
    const validPassword = await bcrypt.compare(password, admin.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username, isAdmin: true },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({ message: "Admin login successful", token });
  } catch (err) {
    console.error("Admin login error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

const getAllDrivers = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, phone, yandex_driver_id, balance, created_at FROM drivers ORDER BY created_at DESC"
    );

    res.json({ drivers: result.rows });
  } catch (err) {
    console.error("Get all drivers error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

const getAllWithdrawals = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT w.*, d.name AS driver_name, d.phone AS driver_phone
       FROM withdrawals w
       JOIN drivers d ON w.driver_id = d.id
       ORDER BY w.created_at DESC`
    );

    res.json({ withdrawals: result.rows });
  } catch (err) {
    console.error("Get all withdrawals error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

const approveWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;

    const withdrawal = await pool.query("SELECT * FROM withdrawals WHERE id = $1", [id]);

    if (withdrawal.rows.length === 0) {
      return res.status(404).json({ error: "Withdrawal not found" });
    }

    if (withdrawal.rows[0].status !== "pending") {
      return res.status(400).json({ error: `Withdrawal already ${withdrawal.rows[0].status}` });
    }

    const result = await pool.query(
      "UPDATE withdrawals SET status = 'approved' WHERE id = $1 RETURNING *",
      [id]
    );

    res.json({ message: "Withdrawal approved", withdrawal: result.rows[0] });
  } catch (err) {
    console.error("Approve withdrawal error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

const rejectWithdrawal = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    const withdrawal = await client.query("SELECT * FROM withdrawals WHERE id = $1", [id]);

    if (withdrawal.rows.length === 0) {
      return res.status(404).json({ error: "Withdrawal not found" });
    }

    if (withdrawal.rows[0].status !== "pending") {
      return res.status(400).json({ error: `Withdrawal already ${withdrawal.rows[0].status}` });
    }

    await client.query("BEGIN");

    await client.query(
      "UPDATE drivers SET balance = balance + $1 WHERE id = $2",
      [withdrawal.rows[0].amount, withdrawal.rows[0].driver_id]
    );

    const result = await client.query(
      "UPDATE withdrawals SET status = 'rejected' WHERE id = $1 RETURNING *",
      [id]
    );

    await client.query("COMMIT");

    res.json({ message: "Withdrawal rejected, amount refunded to driver", withdrawal: result.rows[0] });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Reject withdrawal error:", err.message);
    res.status(500).json({ error: "Server error" });
  } finally {
    client.release();
  }
};

const adjustBalance = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, description } = req.body;

    if (amount === undefined || amount === null) {
      return res.status(400).json({ error: "Amount is required" });
    }

    const driver = await pool.query("SELECT * FROM drivers WHERE id = $1", [id]);

    if (driver.rows.length === 0) {
      return res.status(404).json({ error: "Driver not found" });
    }

    const newBalance = parseFloat(driver.rows[0].balance) + parseFloat(amount);

    if (newBalance < 0) {
      return res.status(400).json({ error: "Adjustment would result in negative balance" });
    }

    await pool.query("UPDATE drivers SET balance = $1 WHERE id = $2", [newBalance.toFixed(2), id]);

    await pool.query(
      "INSERT INTO transactions (driver_id, type, amount, description) VALUES ($1, $2, $3, $4)",
      [id, amount >= 0 ? "credit" : "debit", Math.abs(amount).toFixed(2), description || "Admin balance adjustment"]
    );

    res.json({
      message: "Balance adjusted successfully",
      previous_balance: parseFloat(driver.rows[0].balance).toFixed(2),
      adjustment: parseFloat(amount).toFixed(2),
      new_balance: newBalance.toFixed(2),
    });
  } catch (err) {
    console.error("Adjust balance error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// Commission rate
const getCommissionRate = async (req, res) => {
  try {
    const result = await pool.query("SELECT commission_rate FROM admins LIMIT 1");
    res.json({ commission_rate: parseFloat(result.rows[0]?.commission_rate || 10) });
  } catch (err) {
    console.error("Get commission rate error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

const updateCommissionRate = async (req, res) => {
  try {
    const { commission_rate } = req.body;
    if (commission_rate === undefined || commission_rate < 0 || commission_rate > 100) {
      return res.status(400).json({ error: "Commission rate must be between 0 and 100" });
    }
    await pool.query("UPDATE admins SET commission_rate = $1", [commission_rate]);
    res.json({ message: "Commission rate updated", commission_rate: parseFloat(commission_rate) });
  } catch (err) {
    console.error("Update commission rate error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// Bank accounts management
const getAllBankAccounts = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ba.*, d.name AS driver_name, d.phone AS driver_phone
       FROM bank_accounts ba
       JOIN drivers d ON ba.driver_id = d.id
       ORDER BY ba.created_at DESC`
    );
    res.json({ bank_accounts: result.rows });
  } catch (err) {
    console.error("Get bank accounts error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

const verifyBankAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "UPDATE bank_accounts SET is_verified = true WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Bank account not found" });
    }
    res.json({ message: "Bank account verified", bank_account: result.rows[0] });
  } catch (err) {
    console.error("Verify bank account error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

const rejectBankAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM bank_accounts WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Bank account not found" });
    }
    res.json({ message: "Bank account rejected and removed" });
  } catch (err) {
    console.error("Reject bank account error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// Commission stats
const getCommissionStats = async (req, res) => {
  try {
    const totalResult = await pool.query(
      "SELECT COALESCE(SUM(commission_amount), 0) AS total FROM withdrawals WHERE status = 'approved'"
    );
    const todayResult = await pool.query(
      "SELECT COALESCE(SUM(commission_amount), 0) AS today FROM withdrawals WHERE status = 'approved' AND created_at::date = CURRENT_DATE"
    );
    const monthResult = await pool.query(
      "SELECT COALESCE(SUM(commission_amount), 0) AS monthly FROM withdrawals WHERE status = 'approved' AND created_at >= date_trunc('month', CURRENT_DATE)"
    );
    const rateResult = await pool.query("SELECT commission_rate FROM admins LIMIT 1");

    res.json({
      total_commission: parseFloat(totalResult.rows[0].total).toFixed(2),
      today_commission: parseFloat(todayResult.rows[0].today).toFixed(2),
      monthly_commission: parseFloat(monthResult.rows[0].monthly).toFixed(2),
      commission_rate: parseFloat(rateResult.rows[0]?.commission_rate || 10),
    });
  } catch (err) {
    console.error("Get commission stats error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  adminLogin, getAllDrivers, getAllWithdrawals, approveWithdrawal,
  rejectWithdrawal, adjustBalance, getCommissionRate, updateCommissionRate,
  getAllBankAccounts, verifyBankAccount, rejectBankAccount, getCommissionStats,
};
