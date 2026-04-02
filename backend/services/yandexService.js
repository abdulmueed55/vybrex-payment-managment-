const axios = require("axios");

const FLEET_API_BASE = "https://fleet-api.taxi.yandex.net";

const fleetClient = axios.create({
  baseURL: FLEET_API_BASE,
  headers: {
    "X-Client-ID": process.env.YANDEX_CLIENT_ID,
    "X-API-Key": process.env.YANDEX_API_KEY,
    "Accept-Language": "en",
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

/**
 * Get a driver by phone number from Yandex Fleet API.
 * Used during registration to verify driver belongs to this park.
 */
const getDriverByPhone = async (phone) => {
  const response = await fleetClient.post("/v1/parks/driver-profiles/list", {
    fields: {
      account: ["balance", "currency"],
      driver_profile: [
        "id",
        "first_name",
        "last_name",
        "phones",
        "created_date",
        "work_status",
      ],
      car: ["brand", "model", "number", "year"],
    },
    query: {
      park: {
        id: process.env.YANDEX_PARK_ID,
        driver_profile: {
          phones: [phone],
        },
      },
    },
    limit: 1,
    offset: 0,
  });

  const profiles = response.data.driver_profiles || [];
  if (profiles.length === 0) {
    return null;
  }

  const profile = profiles[0];
  const account = profile.accounts?.[0] || {};
  const car = profile.car || {};

  return {
    yandex_id: profile.driver_profile?.id,
    first_name: profile.driver_profile?.first_name,
    last_name: profile.driver_profile?.last_name,
    name: `${profile.driver_profile?.first_name || ""} ${profile.driver_profile?.last_name || ""}`.trim(),
    phones: profile.driver_profile?.phones || [],
    work_status: profile.current_status?.status,
    balance: parseFloat(account.balance || "0"),
    currency: account.currency || "GEL",
    car_brand: car.brand,
    car_model: car.model,
    car_number: car.number,
    car_year: car.year,
    created_date: profile.driver_profile?.created_date,
  };
};

/**
 * Get a single driver's profile with balance from Yandex Fleet API.
 * POST /v1/parks/driver-profiles/list with a filter on the specific driver ID.
 */
const getDriverProfile = async (yandexDriverId) => {
  const response = await fleetClient.post("/v1/parks/driver-profiles/list", {
    fields: {
      account: ["balance", "currency"],
      driver_profile: [
        "id",
        "first_name",
        "last_name",
        "phones",
        "created_date",
        "work_status",
      ],
      car: ["brand", "model", "number"],
    },
    query: {
      park: {
        id: process.env.YANDEX_PARK_ID,
        driver_profile: {
          id: [yandexDriverId],
        },
      },
    },
    limit: 1,
    offset: 0,
  });

  const profiles = response.data.driver_profiles || [];
  if (profiles.length === 0) {
    return null;
  }

  const profile = profiles[0];
  const account = profile.accounts?.[0] || {};
  const car = profile.car || {};

  return {
    yandex_id: profile.driver_profile?.id,
    first_name: profile.driver_profile?.first_name,
    last_name: profile.driver_profile?.last_name,
    name: `${profile.driver_profile?.first_name || ""} ${profile.driver_profile?.last_name || ""}`.trim(),
    phones: profile.driver_profile?.phones || [],
    work_status: profile.current_status?.status,
    balance: parseFloat(account.balance || "0"),
    currency: account.currency || "GEL",
    car_brand: car.brand,
    car_model: car.model,
    car_number: car.number,
    created_date: profile.driver_profile?.created_date,
  };
};

/**
 * Get a driver's balance from Yandex Fleet API.
 */
const getDriverBalance = async (yandexDriverId) => {
  const profile = await getDriverProfile(yandexDriverId);
  if (!profile) {
    throw new Error("Driver not found in Yandex Fleet");
  }
  return {
    balance: profile.balance,
    currency: profile.currency,
  };
};

/**
 * Get driver transactions (ride history, bonuses, penalties, etc.)
 * POST /v2/parks/driver-profiles/transactions/list
 */
const getDriverTransactions = async (yandexDriverId, daysBack = 30) => {
  const now = new Date();
  const from = new Date();
  from.setDate(from.getDate() - daysBack);

  const allTransactions = [];
  let cursor = undefined;
  let hasMore = true;

  while (hasMore) {
    const body = {
      query: {
        park: {
          id: process.env.YANDEX_PARK_ID,
          driver_profile: {
            id: yandexDriverId,
          },
          transaction: {
            event_at: {
              from: from.toISOString(),
              to: now.toISOString(),
            },
          },
        },
      },
      limit: 100,
    };

    if (cursor) {
      body.cursor = cursor;
    }

    const response = await fleetClient.post(
      "/v2/parks/driver-profiles/transactions/list",
      body
    );

    const transactions = response.data.transactions || [];
    allTransactions.push(...transactions);

    cursor = response.data.cursor;
    hasMore = transactions.length === 100 && cursor;
  }

  return allTransactions;
};

/**
 * Get all drivers in the park (for admin panel).
 * POST /v1/parks/driver-profiles/list
 */
const getAllDrivers = async () => {
  const response = await fleetClient.post("/v1/parks/driver-profiles/list", {
    fields: {
      account: ["balance", "currency"],
      driver_profile: [
        "id",
        "first_name",
        "last_name",
        "phones",
        "created_date",
        "work_status",
      ],
      current_status: ["status"],
    },
    query: {
      park: {
        id: process.env.YANDEX_PARK_ID,
      },
    },
    limit: 1000,
    offset: 0,
    sort_order: [
      {
        direction: "desc",
        field: "driver_profile.created_date",
      },
    ],
  });

  return (response.data.driver_profiles || []).map((profile) => ({
    yandex_id: profile.driver_profile?.id,
    first_name: profile.driver_profile?.first_name,
    last_name: profile.driver_profile?.last_name,
    phones: profile.driver_profile?.phones || [],
    work_status: profile.current_status?.status,
    balance: parseFloat(profile.accounts?.[0]?.balance || "0"),
    currency: profile.accounts?.[0]?.currency || "GEL",
    created_date: profile.driver_profile?.created_date,
  }));
};

/**
 * Sync a driver's transactions from Yandex into the local earnings table.
 * Skips transactions already synced (by ride_id).
 * Returns the count of newly synced transactions and their total amount.
 */
const syncDriverEarnings = async (pool, driverId, yandexDriverId) => {
  const transactions = await getDriverTransactions(yandexDriverId, 30);

  let syncedCount = 0;
  let syncedAmount = 0;

  for (const tx of transactions) {
    const txId = tx.id || tx.order_id || `yx-${tx.event_at}-${Math.random()}`;
    const amount = parseFloat(tx.amount || "0");

    // Skip non-positive transactions (penalties, deductions)
    if (amount <= 0) continue;

    // Check if already synced
    const existing = await pool.query(
      "SELECT id FROM earnings WHERE ride_id = $1 AND driver_id = $2",
      [txId, driverId]
    );

    if (existing.rows.length > 0) continue;

    const rideDate = tx.event_at || new Date().toISOString();

    await pool.query(
      "INSERT INTO earnings (driver_id, ride_id, amount, ride_date) VALUES ($1, $2, $3, $4)",
      [driverId, txId, amount, rideDate]
    );

    syncedCount++;
    syncedAmount += amount;
  }

  // Update driver balance from Yandex (source of truth)
  try {
    const balanceData = await getDriverBalance(yandexDriverId);
    await pool.query("UPDATE drivers SET balance = $1 WHERE id = $2", [
      balanceData.balance.toFixed(2),
      driverId,
    ]);
  } catch (err) {
    console.error("Failed to update balance from Yandex:", err.message);
  }

  return {
    synced: syncedCount,
    total_amount: syncedAmount.toFixed(2),
  };
};

module.exports = {
  getDriverByPhone,
  getDriverProfile,
  getDriverBalance,
  getDriverTransactions,
  getAllDrivers,
  syncDriverEarnings,
};
