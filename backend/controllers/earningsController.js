const pool = require("../db");
const yandex = require("../services/yandexService");

const getEarnings = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, ride_id, amount, ride_date, synced_at FROM earnings WHERE driver_id = $1 ORDER BY ride_date DESC",
      [req.driver.id]
    );

    const total = result.rows.reduce(
      (sum, row) => sum + parseFloat(row.amount),
      0
    );

    res.json({ earnings: result.rows, total: total.toFixed(2) });
  } catch (err) {
    console.error("Get earnings error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

const syncEarnings = async (req, res) => {
  try {
    const driverId = req.driver.id;

    // Get driver's yandex_driver_id
    const driverResult = await pool.query(
      "SELECT yandex_driver_id FROM drivers WHERE id = $1",
      [driverId]
    );

    const yandexDriverId = driverResult.rows[0]?.yandex_driver_id;

    if (!yandexDriverId) {
      return res.status(400).json({
        error:
          "Yandex Driver ID not linked. Please update your profile with your Yandex Driver ID.",
      });
    }

    const result = await yandex.syncDriverEarnings(
      pool,
      driverId,
      yandexDriverId
    );

    res.json({
      message: "Yandex earnings synced successfully",
      synced: result.synced,
      total_amount: result.total_amount,
    });
  } catch (err) {
    console.error("Sync earnings error:", err.message);

    if (err.response?.status === 401 || err.response?.status === 403) {
      return res
        .status(502)
        .json({ error: "Yandex API authentication failed" });
    }

    res
      .status(500)
      .json({ error: "Failed to sync earnings from Yandex Fleet" });
  }
};

const getBalance = async (req, res) => {
  try {
    const earnings = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) AS total_earnings FROM earnings WHERE driver_id = $1",
      [req.driver.id]
    );

    const withdrawals = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) AS total_withdrawn FROM withdrawals WHERE driver_id = $1 AND status = 'approved'",
      [req.driver.id]
    );

    const totalEarnings = parseFloat(earnings.rows[0].total_earnings);
    const totalWithdrawn = parseFloat(withdrawals.rows[0].total_withdrawn);
    const balance = (totalEarnings - totalWithdrawn).toFixed(2);

    res.json({
      total_earnings: totalEarnings.toFixed(2),
      total_withdrawn: totalWithdrawn.toFixed(2),
      balance,
    });
  } catch (err) {
    console.error("Get balance error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Fetch live balance directly from Yandex Fleet API (not from local DB).
 */
const getYandexBalance = async (req, res) => {
  try {
    const driverResult = await pool.query(
      "SELECT yandex_driver_id FROM drivers WHERE id = $1",
      [req.driver.id]
    );

    const yandexDriverId = driverResult.rows[0]?.yandex_driver_id;

    if (!yandexDriverId) {
      return res.status(400).json({
        error: "Yandex Driver ID not linked",
      });
    }

    const balanceData = await yandex.getDriverBalance(yandexDriverId);
    res.json(balanceData);
  } catch (err) {
    console.error("Get Yandex balance error:", err.message);
    res
      .status(500)
      .json({ error: "Failed to fetch balance from Yandex Fleet" });
  }
};

/**
 * Fetch transactions directly from Yandex Fleet API.
 */
const getYandexTransactions = async (req, res) => {
  try {
    const driverResult = await pool.query(
      "SELECT yandex_driver_id FROM drivers WHERE id = $1",
      [req.driver.id]
    );

    const yandexDriverId = driverResult.rows[0]?.yandex_driver_id;

    if (!yandexDriverId) {
      return res.status(400).json({
        error: "Yandex Driver ID not linked",
      });
    }

    const days = parseInt(req.query.days) || 30;
    const transactions = await yandex.getDriverTransactions(
      yandexDriverId,
      days
    );

    res.json({
      transactions,
      count: transactions.length,
    });
  } catch (err) {
    console.error("Get Yandex transactions error:", err.message);
    res
      .status(500)
      .json({ error: "Failed to fetch transactions from Yandex Fleet" });
  }
};

module.exports = {
  getEarnings,
  syncEarnings,
  getBalance,
  getYandexBalance,
  getYandexTransactions,
};
