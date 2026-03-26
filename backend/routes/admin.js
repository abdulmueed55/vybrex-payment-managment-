const express = require("express");
const router = express.Router();
const { adminLogin, getAllDrivers, getAllWithdrawals, approveWithdrawal, rejectWithdrawal, adjustBalance } = require("../controllers/adminController");
const adminMiddleware = require("../middleware/adminAuth");

router.post("/login", adminLogin);
router.get("/drivers", adminMiddleware, getAllDrivers);
router.get("/withdrawals", adminMiddleware, getAllWithdrawals);
router.put("/withdrawal/:id/approve", adminMiddleware, approveWithdrawal);
router.put("/withdrawal/:id/reject", adminMiddleware, rejectWithdrawal);
router.put("/driver/:id/balance", adminMiddleware, adjustBalance);

module.exports = router;
