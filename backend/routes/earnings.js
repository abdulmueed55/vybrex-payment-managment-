const express = require("express");
const router = express.Router();
const { getEarnings, syncEarnings, getBalance } = require("../controllers/earningsController");
const authMiddleware = require("../middleware/auth");

router.get("/", authMiddleware, getEarnings);
router.post("/sync", authMiddleware, syncEarnings);
router.get("/balance", authMiddleware, getBalance);

module.exports = router;
