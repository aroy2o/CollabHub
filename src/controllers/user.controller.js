const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();

/**
 * @desc Register a new user
 * @route POST /api/users/register
 * @access Public
 */
exports.registerUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Create new user (no check for existing email)
    const newUser = new User({
      fullName,
      email,
      password, // This will be hashed in the pre-save hook
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc Login user & get token
 * @route POST /api/users/login
 * @access Public
 */
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.hashedPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ message: "Login successful", token, user: { id: user._id, fullName: user.fullName, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc Get current user profile
 * @route GET /api/users/me
 * @access Private
 */
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-hashedPassword");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc Update user profile
 * @route PUT /api/users/me
 * @access Private
 */
exports.updateUserProfile = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.fullName = fullName || user.fullName;
    user.email = email || user.email;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.hashedPassword = await bcrypt.hash(password, salt);
    }

    await user.save();
    res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc Delete user account
 * @route DELETE /api/users/me
 * @access Private
 */
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Validate the user ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid user ID format"
      });
    }
    
    // Use findByIdAndDelete which is the modern approach
    const deletedUser = await User.findByIdAndDelete(userId);
    
    if (!deletedUser) {
      return res.status(404).json({ 
        success: false,
        message: "User not found"
      });
    }
    
    return res.status(200).json({
      success: true,
      message: "User account deleted successfully"
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({ 
      success: false,
      message: "Server error deleting user", 
      error: error.message
    });
  }
};

/**
 * @desc Get all users
 * @route GET /api/users
 * @access Private (Admin)
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      data: users.map(user => ({
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        userRole: user.userRole,
        profilePicture: user.profilePicture,
        biography: user.biography,
        skillSet: user.skillSet,
        userLocation: user.userLocation,
        createdAt: user.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error fetching users", 
      error: error.message 
    });
  }
};

/**
 * @desc Get user by ID
 * @route GET /api/users/:id
 * @access Public
 */
exports.getUserById = async (req, res) => {
  try {
    // Use proper error handling for invalid ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid user ID format"
      });
    }
    
    const user = await User.findById(req.params.id).select("-password");
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // Return success with user data including follower/following counts
    return res.status(200).json({
      success: true,
      user: {
        ...user.toJSON(),
        followerCount: user.followers.length,
        followingCount: user.following.length
      }
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    return res.status(500).json({ 
      success: false,
      message: "Server error retrieving user", 
      error: error.message 
    });
  }
};

/**
 * @desc Update user profile
 * @route PUT /api/users/:id
 * @access Private
 */
exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { fullName, email } = req.body;
    user.fullName = fullName || user.fullName;
    user.email = email || user.email;

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc Delete specific user by ID
 * @route DELETE /api/users/:id
 * @access Private (Owner or Admin)
 */
exports.deleteUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Validate the user ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid user ID format"
      });
    }
    
    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found"
      });
    }
    
    // Log who is deleting the account
    const isAdmin = req.user.userRole === 'admin';
    const isOwner = req.user._id.toString() === userId;
    console.log(`User deletion: ${userId} being deleted by ${req.user._id} (Admin: ${isAdmin}, Owner: ${isOwner})`);
    
    // Perform the deletion
    await User.findByIdAndDelete(userId);
    
    return res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (error) {
    console.error('Delete user by ID error:', error);
    return res.status(500).json({ 
      success: false,
      message: "Server error deleting user", 
      error: error.message
    });
  }
};

/**
 * @desc Update user profile
 * @route PUT /api/users/profile/me
 * @access Private
 */
exports.updateUserProfile = async (req, res) => {
  try {
    // Get user ID from the authenticated user object
    const userId = req.user._id;
    
    // Find the user by ID
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // Update fields from request body
    const { fullName, email, biography, skillSet, userLocation, profilePicture } = req.body;
    
    // Only update provided fields
    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    if (biography !== undefined) user.biography = biography;
    if (skillSet) user.skillSet = skillSet;
    if (userLocation !== undefined) user.userLocation = userLocation;
    if (profilePicture) user.profilePicture = profilePicture;

    // Save the updated user
    await user.save();
    
    // Return success with updated user data
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        biography: user.biography,
        skillSet: user.skillSet,
        userLocation: user.userLocation,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    return res.status(500).json({ 
      success: false,
      message: "Server error updating profile", 
      error: error.message 
    });
  }
};
