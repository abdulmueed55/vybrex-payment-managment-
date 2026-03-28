const express = require("express");
const router = express.Router();
const { requestWithdrawal, getWithdrawals, getWithdrawalById, getCommissionRate } = require("../controllers/withdrawalController");
const authMiddleware = require("../middleware/auth");

router.post("/request", authMiddleware, requestWithdrawal);
router.get("/history", authMiddleware, getWithdrawals);
router.get("/commission-rate", authMiddleware, getCommissionRate);
router.get("/:id", authMiddleware, getWithdrawalById);

module.exports = router;
