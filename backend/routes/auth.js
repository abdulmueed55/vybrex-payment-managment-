const express = require("express");
const router = express.Router();
const { register, sendOtp, verifyOtp, getProfile } = require("../controllers/authController");
const authMiddleware = require("../middleware/auth");

router.post("/register", register);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.get("/profile", authMiddleware, getProfile);

module.exports = router;
