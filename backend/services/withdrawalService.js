const pool = require("../db");

/**
 * Automatic withdrawal processing service.
 * Processes approved withdrawals by simulating bank transfer.
 * In production, integrate with TBC/BOG banking APIs.
 */

const BANK_APIS = {
  TBC: {
    name: "TBC Bank",
    swift: "TBCBGE22",
    processTransfer: async (iban, amount, reference) => {
      // TODO: Integrate with TBC Bank API
      // https://developer.tbcbank.ge/
      console.log(`[TBC] Processing transfer: ${amount} GEL to ${iban} (ref: ${reference})`);
      return { success: true, reference_id: `TBC-${Date.now()}`, message: "Transfer queued" };
    },
  },
  BOG: {
    name: "Bank of Georgia",
    swift: "BAGAGE22",
    processTransfer: async (iban, amount, reference) => {
      // TODO: Integrate with Bank of Georgia API
      // https://developer.bog.ge/
      console.log(`[BOG] Processing transfer: ${amount} GEL to ${iban} (ref: ${reference})`);
      return { success: true, reference_id: `BOG-${Date.now()}`, message: "Transfer queued" };
    },
  },
};

const processWithdrawal = async (withdrawalId) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const result = await client.query(
      "SELECT * FROM withdrawals WHERE id = $1 AND status = 'approved' FOR UPDATE",
      [withdrawalId]
    );

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return { success: false, error: "Withdrawal not found or not approved" };
    }

    const withdrawal = result.rows[0];
    const bankCode = withdrawal.bank_code || "TBC";
    const bankApi = BANK_APIS[bankCode];

    if (!bankApi) {
      await client.query("ROLLBACK");
      return { success: false, error: `Unsupported bank: ${bankCode}` };
    }

    const netAmount = parseFloat(withdrawal.net_amount || withdrawal.amount);
    const iban = withdrawal.iban || withdrawal.account_number;
    const reference = `PP-WD-${withdrawal.id}`;

    const transferResult = await bankApi.processTransfer(iban, netAmount, reference);

    if (transferResult.success) {
      await client.query(
        "UPDATE withdrawals SET status = 'processed', processed_at = NOW() WHERE id = $1",
        [withdrawalId]
      );
      await client.query("COMMIT");

      console.log(`Withdrawal #${withdrawalId} processed: ${netAmount} GEL to ${iban} via ${bankApi.name}`);
      return { success: true, reference_id: transferResult.reference_id };
    } else {
      await client.query("ROLLBACK");
      return { success: false, error: transferResult.message };
    }
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Process withdrawal error:", err.message);
    return { success: false, error: err.message };
  } finally {
    client.release();
  }
};

const processAllApproved = async () => {
  try {
    const result = await pool.query(
      "SELECT id FROM withdrawals WHERE status = 'approved' ORDER BY created_at ASC"
    );

    const results = [];
    for (const row of result.rows) {
      const r = await processWithdrawal(row.id);
      results.push({ id: row.id, ...r });
    }

    console.log(`Processed ${results.filter((r) => r.success).length}/${result.rows.length} withdrawals`);
    return results;
  } catch (err) {
    console.error("Process all withdrawals error:", err.message);
    return [];
  }
};

module.exports = { processWithdrawal, processAllApproved, BANK_APIS };
