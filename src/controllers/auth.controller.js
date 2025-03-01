const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const logger = require("../utils/logger");
const { sanitizeEmail, checkEmailExists, listAllEmails } = require("../utils/emailUtils");

dotenv.config();

/**
 * @desc Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
exports.registerUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Check all required fields
    if (!fullName || !email || !password) {
      return res.status(400).json({ 
        success: false,
        message: "All fields are required" 
      });
    }
    
    // Extra validation for email
    if (!email || !email.trim()) {
      return res.status(400).json({ 
        success: false,
        message: "Email cannot be empty" 
      });
    }

    // Clean and format email
    const cleanedEmail = sanitizeEmail(email);
    logger.info(`Registration attempt with email: ${cleanedEmail}`);

    // Debug information - list all emails in DB
    if (process.env.NODE_ENV !== 'production') {
      const allEmails = await listAllEmails();
      logger.info(`Current emails in database: ${JSON.stringify(allEmails)}`);
    }

    // Note: We're no longer checking for duplicate emails
    // This section was removed to allow registration with duplicate emails

    logger.info(`Proceeding with registration for email: ${cleanedEmail}`);

    // Create new user with cleaned data
    const user = new User({ 
      fullName: fullName.trim(), 
      email: cleanedEmail, 
      password
    });
    
    // Save user to database with error handling
    const savedUser = await user.save();
    
    // Generate JWT Token
    const token = jwt.sign({ id: savedUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    logger.info(`User successfully registered with id: ${savedUser._id}`);

    // Return success response
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: { 
        id: savedUser._id, 
        fullName: savedUser.fullName, 
        email: savedUser.email 
      },
      token,
    });
  } catch (error) {
    logger.error(`Registration error: ${error.message}`, { error });
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages[0],
        error: "Validation error"
      });
    }
    
    // General server error
    return res.status(500).json({ 
      success: false,
      message: "Error registering user", 
      error: error.message 
    });
  }
};

/**
 * @desc Login user
 * @route POST /api/auth/login
 * @access Public
 */
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Find user by email and include password field
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({ message: "Invalid email" });
    }

    console.log('Password from request:', password);
    console.log('Stored hashed password:', user.password);

    // Check password using the comparePassword method
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // Generate JWT Token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      message: "Login successful",
      user: { id: user._id, fullName: user.fullName, email: user.email },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc Logout user (handled on frontend by deleting token)
 * @route POST /api/auth/logout
 * @access Private
 */
exports.logoutUser = async (req, res) => {
  res.json({ message: "Logout successful" });
};

/**
 * @desc Get logged-in user profile
 * @route GET /api/auth/me
 * @access Private
 */
exports.getProfile = async (req, res) => {
  try {
    // The user is already set in req.user by the protect middleware
    if (!req.user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }
    
    // Return the user data
    return res.status(200).json({
      success: true,
      user: req.user
    });
    
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

/**
 * @desc Update logged-in user profile
 * @route PUT /api/auth/me
 * @access Private
 */
exports.updateProfile = async (req, res) => {
  try {
    // Get user from middleware
    const userId = req.user._id;
    const updateData = req.body;
    
    // Don't allow direct password updates through this endpoint
    if (updateData.password) {
      delete updateData.password;
    }
    
    // Prevent role updates unless they're an admin
    if (updateData.userRole && req.user.userRole !== 'admin') {
      delete updateData.userRole;
    }
    
    // Find and update the user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password");
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser
    });
    
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({
      success: false,
      message: "Server error updating profile",
      error: error.message
    });
  }
};

/**
 * @desc Check email availability
 * @route GET /api/auth/check-email
 * @access Public
 */
exports.checkEmailAvailability = async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email || !email.trim()) {
      return res.status(400).json({ 
        success: false,
        message: "Email parameter is required" 
      });
    }
    
    // Since we're allowing duplicate emails, all emails are available
    return res.status(200).json({
      success: true,
      available: true,
      message: "Email is available"
    });
  } catch (error) {
    logger.error(`Error checking email availability: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: "Server error checking email availability",
      error: error.message
    });
  }
};
