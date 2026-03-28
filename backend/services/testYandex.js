/**
 * Test script for Yandex Fleet API connection.
 * Run: node services/testYandex.js
 *
 * This will verify that the API credentials are working
 * and list the first 5 drivers in the park.
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

const {
  getDriverProfile,
  getDriverBalance,
  getDriverTransactions,
  getAllDrivers,
} = require("./yandexService");

const testConnection = async () => {
  console.log("=== Yandex Fleet API Connection Test ===\n");
  console.log("Client ID:", process.env.YANDEX_CLIENT_ID);
  console.log("Park ID:", process.env.YANDEX_PARK_ID);
  console.log("API Key:", process.env.YANDEX_API_KEY?.slice(0, 8) + "...\n");

  try {
    console.log("1. Fetching all drivers in park...");
    const drivers = await getAllDrivers();
    console.log(`   Found ${drivers.length} drivers\n`);

    if (drivers.length > 0) {
      console.log("   First 5 drivers:");
      drivers.slice(0, 5).forEach((d, i) => {
        console.log(
          `   ${i + 1}. ${d.first_name} ${d.last_name} (ID: ${d.yandex_id}) - Balance: ${d.balance} ${d.currency}`
        );
      });

      const testDriverId = drivers[0].yandex_id;
      console.log(`\n2. Fetching profile for driver: ${testDriverId}...`);
      const profile = await getDriverProfile(testDriverId);
      console.log("   Profile:", JSON.stringify(profile, null, 2));

      console.log(`\n3. Fetching balance for driver: ${testDriverId}...`);
      const balance = await getDriverBalance(testDriverId);
      console.log(
        `   Balance: ${balance.balance} ${balance.currency}`
      );

      console.log(
        `\n4. Fetching transactions (last 7 days) for driver: ${testDriverId}...`
      );
      const transactions = await getDriverTransactions(testDriverId, 7);
      console.log(`   Found ${transactions.length} transactions`);
      if (transactions.length > 0) {
        console.log(
          "   Latest:",
          JSON.stringify(transactions[0], null, 2)
        );
      }
    }

    console.log("\n=== All tests passed! API connection is working. ===");
  } catch (err) {
    console.error("\n=== API Connection Failed ===");
    console.error("Error:", err.message);
    if (err.response) {
      console.error("Status:", err.response.status);
      console.error("Data:", JSON.stringify(err.response.data, null, 2));
    }
    process.exit(1);
  }
};

testConnection();
