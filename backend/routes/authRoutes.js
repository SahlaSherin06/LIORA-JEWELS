const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  logoutUser,
  getProfile,
  updateProfile,
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const asyncHandler = require("../middleware/asyncHandler");
const validate = require("../middleware/validate");
const { registerSchema, loginSchema } = require("../validations/schemas");

// Public Routes
router.post("/register", validate(registerSchema), asyncHandler(registerUser));
router.post("/login", validate(loginSchema), asyncHandler(loginUser));
router.post("/logout", asyncHandler(logoutUser));

// Protected Route
router.get("/profile", authMiddleware, asyncHandler(getProfile));
router.put("/profile", authMiddleware, asyncHandler(updateProfile));

module.exports = router;