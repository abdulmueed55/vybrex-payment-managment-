const express = require("express");
const router = express.Router();
const { updateProfile, changePassword, joinPark, linkYandexId, addBankAccount, getBankAccounts, deleteBankAccount } = require("../controllers/driverController");
const authMiddleware = require("../middleware/auth");

router.put("/profile", authMiddleware, updateProfile);
router.put("/password", authMiddleware, changePassword);
router.put("/yandex-id", authMiddleware, linkYandexId);
router.put("/park", authMiddleware, joinPark);
router.post("/bank-accounts", authMiddleware, addBankAccount);
router.get("/bank-accounts", authMiddleware, getBankAccounts);
router.delete("/bank-accounts/:id", authMiddleware, deleteBankAccount);

module.exports = router;
