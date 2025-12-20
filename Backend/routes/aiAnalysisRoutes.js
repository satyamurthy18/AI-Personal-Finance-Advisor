const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const {
  analyzeSpending,
  getAnalysis,
  getAllAnalyses,
  testGeminiConnection,
} = require("../Controllers/aiAnalysisController");

router.post("/analyze", authMiddleware, analyzeSpending);
router.get("/analysis", authMiddleware, getAnalysis);
router.get("/analyses", authMiddleware, getAllAnalyses); // Get all analyses for history
router.get("/test", authMiddleware, testGeminiConnection); // Test endpoint

module.exports = router;
