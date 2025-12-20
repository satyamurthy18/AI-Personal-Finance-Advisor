const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const {
  setBudget,
  getBudgetStatus,
} = require("../Controllers/budgetController");

// ✅ PROTECTED ROUTES
router.post("/set", authMiddleware, setBudget);
router.get("/status", authMiddleware, getBudgetStatus);

module.exports = router;
