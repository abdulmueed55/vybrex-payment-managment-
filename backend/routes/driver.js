const express = require("express");
const router = express.Router();
const { updateProfile, changePassword, getReferralCode, joinPark, getReferrals } = require("../controllers/driverController");
const authMiddleware = require("../middleware/auth");

router.put("/profile", authMiddleware, updateProfile);
router.put("/password", authMiddleware, changePassword);
router.get("/referral-code", authMiddleware, getReferralCode);
router.put("/park", authMiddleware, joinPark);
router.get("/referrals", authMiddleware, getReferrals);

module.exports = router;
