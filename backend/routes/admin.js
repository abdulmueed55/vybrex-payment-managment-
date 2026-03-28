const express = require("express");
const router = express.Router();
const {
  adminLogin, getAllDrivers, getAllWithdrawals, approveWithdrawal,
  rejectWithdrawal, adjustBalance, getCommissionRate, updateCommissionRate,
  getAllBankAccounts, verifyBankAccount, rejectBankAccount, getCommissionStats,
} = require("../controllers/adminController");
const { getAllParks, createPark, updatePark, deletePark } = require("../controllers/parksController");
const adminMiddleware = require("../middleware/adminAuth");

router.post("/login", adminLogin);
router.get("/drivers", adminMiddleware, getAllDrivers);
router.get("/withdrawals", adminMiddleware, getAllWithdrawals);
router.put("/withdrawal/:id/approve", adminMiddleware, approveWithdrawal);
router.put("/withdrawal/:id/reject", adminMiddleware, rejectWithdrawal);
router.put("/driver/:id/balance", adminMiddleware, adjustBalance);
router.get("/parks", adminMiddleware, getAllParks);
router.post("/parks", adminMiddleware, createPark);
router.put("/parks/:id", adminMiddleware, updatePark);
router.delete("/parks/:id", adminMiddleware, deletePark);
router.get("/commission", adminMiddleware, getCommissionRate);
router.put("/commission", adminMiddleware, updateCommissionRate);
router.get("/bank-accounts", adminMiddleware, getAllBankAccounts);
router.put("/bank-accounts/:id/verify", adminMiddleware, verifyBankAccount);
router.delete("/bank-accounts/:id", adminMiddleware, rejectBankAccount);
router.get("/commission-stats", adminMiddleware, getCommissionStats);

module.exports = router;
