const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");

const {
  signup,
  login,
  logout,
  forgotPassword,
  resetPassword,
} = require("../Controllers/authController");

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// ✅ CHECK AUTH STATUS
router.get("/me", authMiddleware, (req, res) => {
  res.status(200).json(req.user);
});

module.exports = router;
