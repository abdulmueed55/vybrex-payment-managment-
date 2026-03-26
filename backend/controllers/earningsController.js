const pool = require("../db");

const getEarnings = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, ride_id, amount, ride_date, synced_at FROM earnings WHERE driver_id = $1 ORDER BY ride_date DESC",
      [req.driver.id]
    );

    const total = result.rows.reduce((sum, row) => sum + parseFloat(row.amount), 0);

    res.json({ earnings: result.rows, total: total.toFixed(2) });
  } catch (err) {
    console.error("Get earnings error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

const syncEarnings = async (req, res) => {
  try {
    const driverId = req.driver.id;

    // Check if driver already has earnings (avoid duplicate syncs)
    const existing = await pool.query(
      "SELECT COUNT(*) FROM earnings WHERE driver_id = $1",
      [driverId]
    );

    if (parseInt(existing.rows[0].count) > 0) {
      return res.json({ message: "Earnings already synced", synced: 0 });
    }

    // Simulate Yandex API response with 7 days of dummy ride data
    const dummyRides = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      const ridesPerDay = 3 + Math.floor(Math.random() * 4); // 3-6 rides per day
      for (let j = 0; j < ridesPerDay; j++) {
        const hour = 6 + Math.floor(Math.random() * 16); // 6am - 10pm
        const rideDate = new Date(date);
        rideDate.setHours(hour, Math.floor(Math.random() * 60), 0, 0);

        dummyRides.push({
          ride_id: `YX-${Date.now()}-${i}-${j}`,
          amount: (150 + Math.random() * 850).toFixed(2), // 150 - 1000 PKR
          ride_date: rideDate.toISOString(),
        });
      }
    }

    // Insert all dummy earnings
    let totalSynced = 0;
    for (const ride of dummyRides) {
      await pool.query(
        "INSERT INTO earnings (driver_id, ride_id, amount, ride_date) VALUES ($1, $2, $3, $4)",
        [driverId, ride.ride_id, ride.amount, ride.ride_date]
      );
      totalSynced++;
    }

    // Update driver balance with total earnings
    const totalEarnings = dummyRides.reduce((sum, r) => sum + parseFloat(r.amount), 0);
    await pool.query(
      "UPDATE drivers SET balance = balance + $1 WHERE id = $2",
      [totalEarnings.toFixed(2), driverId]
    );

    res.json({
      message: "Yandex earnings synced successfully",
      synced: totalSynced,
      total_amount: totalEarnings.toFixed(2),
    });
  } catch (err) {
    console.error("Sync earnings error:", err.message);
    res.status(500).json({ error: "Server error" });
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

module.exports = { getEarnings, syncEarnings, getBalance };
