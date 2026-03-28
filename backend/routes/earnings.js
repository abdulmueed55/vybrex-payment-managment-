const express = require("express");
const router = express.Router();
const {
  getEarnings,
  syncEarnings,
  getBalance,
  getYandexBalance,
  getYandexTransactions,
} = require("../controllers/earningsController");
const authMiddleware = require("../middleware/auth");

router.get("/", authMiddleware, getEarnings);
router.post("/sync", authMiddleware, syncEarnings);
router.get("/balance", authMiddleware, getBalance);
router.get("/yandex-balance", authMiddleware, getYandexBalance);
router.get("/yandex-transactions", authMiddleware, getYandexTransactions);

module.exports = router;
