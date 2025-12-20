const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const csvUpload = require("../middlewares/csvUpload");
const {
  addTransaction,
  getTransactions,
  deleteTransaction,
  uploadCSV,
} = require("../Controllers/transactionController");

// ✅ PROTECTED ROUTES
router.post("/add", authMiddleware, addTransaction);
router.post("/upload", authMiddleware, csvUpload.single("file"), uploadCSV);
router.get("/", authMiddleware, getTransactions);
router.delete("/:id", authMiddleware, deleteTransaction);

module.exports = router;
