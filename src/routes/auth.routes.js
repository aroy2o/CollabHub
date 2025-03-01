const express = require("express");
const { 
  registerUser, 
  loginUser, 
  logoutUser, 
  getProfile, 
  updateProfile,
  checkEmailAvailability
} = require("../controllers/auth.controller");
const { protect, adminOnly } = require("../middleware/auth.middleware");

const router = express.Router();

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user
 * @access  Public
 */
router.post("/signup", registerUser);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and return JWT token
 * @access  Public
 */
router.post("/login", loginUser);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (clear token cookie)
 * @access  Private
 */
router.post("/logout", protect, logoutUser);

/**
 * @route   GET /api/auth/me
 * @desc    Get logged-in user profile
 * @access  Private
 */
router.get("/me", protect, getProfile);

/**
 * @route   PUT /api/auth/me
 * @desc    Update logged-in user profile
 * @access  Private
 */
router.put("/me", protect, updateProfile);

/**
 * @route   GET /api/auth/check-email
 * @desc    Check if email is available for registration
 * @access  Public
 */
router.get("/check-email", checkEmailAvailability);

module.exports = router;
