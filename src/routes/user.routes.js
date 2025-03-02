const express = require("express");
const {
  getAllUsers,
  getUserById,
  getUserProfile,
  updateUserProfile,
  deleteUser,
  deleteUserById
} = require("../controllers/user.controller");
const {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  checkIfFollowing
} = require("../controllers/follow.controller");
const { protect, adminOnly, isOwnerOrAdmin } = require("../middleware/auth.middleware");
const mongoose = require("mongoose");

// Import the follow utils
const { checkFollowRelationship } = require('../utils/followUtils');
const { validateUserId, preventSelfAction } = require('../middleware/validation.middleware');

const router = express.Router();

// Much simpler middleware for handling empty bodies - focus on reliability
const ensureRequestBody = (req, res, next) => {
  req.body = req.body || {};
  next();
};

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Public
 */
router.get("/", getAllUsers);

/**
 * @route   GET /api/users/profile/me
 * @desc    Get logged-in user profile
 * @access  Private (Requires authentication)
 */
router.get("/profile/me", protect, getUserProfile);

/**
 * @route   PUT /api/users/profile/me
 * @desc    Update logged-in user profile
 * @access  Private (Requires authentication)
 */
router.put("/profile/me", protect, updateUserProfile);

/**
 * @route   DELETE /api/users/profile/me
 * @desc    Delete logged-in user account
 * @access  Private (Requires authentication)
 */
router.delete("/profile/me", protect, deleteUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete a user by ID (owner or admin)
 * @access  Private (Owner or Admin)
 */
router.delete("/:id", protect, isOwnerOrAdmin, deleteUserById);

/**
 * @route   POST /api/users/follow/:id
 * @desc    Follow a user
 * @access  Private
 */
router.post("/follow/:id", protect, validateUserId, preventSelfAction, followUser);

/**
 * @route   POST /api/users/unfollow/:id
 * @desc    Unfollow a user
 * @access  Private
 */
router.post("/unfollow/:id", protect, validateUserId, preventSelfAction, unfollowUser);

/**
 * @route   GET /api/users/follow-alt/:id
 * @desc    Alternative way to follow a user (GET request)
 * @access  Private
 */
router.get("/follow-alt/:id", protect, validateUserId, preventSelfAction, followUser);

/**
 * @route   GET /api/users/unfollow-alt/:id
 * @desc    Alternative way to unfollow a user (GET request)
 * @access  Private
 */
router.get("/unfollow-alt/:id", protect, validateUserId, preventSelfAction, unfollowUser);

/**
 * @route   GET /api/users/:id/followers
 * @desc    Get a user's followers
 * @access  Public
 */
router.get("/:id/followers", getFollowers);

/**
 * @route   GET /api/users/:id/following
 * @desc    Get users that a user is following
 * @access  Public
 */
router.get("/:id/following", getFollowing);

/**
 * @route   GET /api/users/:id/is-following
 * @desc    Check if the logged-in user is following another user
 * @access  Private
 */
router.get("/:id/is-following", protect, checkIfFollowing);

/**
 * @route   GET /api/users/follow-status/:targetId
 * @desc    Alternative way to check follow status with better error handling
 * @access  Private
 */
router.get("/follow-status/:targetId", protect, async (req, res) => {
  try {
    const targetUserId = req.params.targetId;
    const currentUserId = req.user._id;
    
    const result = await checkFollowRelationship(currentUserId, targetUserId);
    
    if (result.error) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }
    
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Follow status error:', error);
    return res.status(500).json({
      success: false,
      message: "Server error checking follow status",
      error: error.message
    });
  }
});

/**
 * @route   GET /api/users/test-follow/:targetId
 * @desc    Test follow functionality
 * @access  Private
 */
router.get("/test-follow/:targetId", protect, async (req, res) => {
  try {
    const targetId = req.params.targetId;
    const currentUserId = req.user._id;
    
    // Check if valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }
    
    // Get target user
    const targetUser = await User.findById(targetId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: "Target user not found" });
    }
    
    // Get current user
    const currentUser = await User.findById(currentUserId);
    
    // Check current follow status
    const isFollowing = currentUser.following.some(id => id.toString() === targetId);
    
    // Toggle follow status
    if (isFollowing) {
      // Unfollow
      await Promise.all([
        User.updateOne(
          { _id: targetId },
          { $pull: { followers: currentUserId } }
        ),
        User.updateOne(
          { _id: currentUserId },
          { $pull: { following: targetId } }
        )
      ]);
      return res.json({ success: true, action: "unfollowed", targetUser: targetUser.fullName });
    } else {
      // Follow
      await Promise.all([
        User.updateOne(
          { _id: targetId },
          { $addToSet: { followers: currentUserId } }
        ),
        User.updateOne(
          { _id: currentUserId },
          { $addToSet: { following: targetId } }
        )
      ]);
      return res.json({ success: true, action: "followed", targetUser: targetUser.fullName });
    }
  } catch (error) {
    console.error("Test follow error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/users/follow-debug/:id
 * @desc    Debug follow status
 * @access  Private
 */
router.get("/follow-debug/:id", protect, validateUserId, async (req, res) => {
  try {
    const targetId = req.params.id;
    const currentId = req.user._id;
    
    const [targetUser, currentUser] = await Promise.all([
      User.findById(targetId).select('_id fullName followers'),
      User.findById(currentId).select('_id fullName following')
    ]);
    
    if (!targetUser || !currentUser) {
      return res.status(404).json({
        success: false,
        message: !targetUser ? "Target user not found" : "Current user not found"
      });
    }
    
    const isFollowing = currentUser.following.some(id => id.toString() === targetId);
    const isFollower = targetUser.followers.some(id => id.toString() === currentId.toString());
    
    return res.status(200).json({
      success: true,
      data: {
        isFollowing,
        isFollower,
        followStateConsistent: isFollowing === isFollower,
        users: {
          current: {
            id: currentUser._id,
            name: currentUser.fullName
          },
          target: {
            id: targetUser._id,
            name: targetUser.fullName
          }
        }
      }
    });
  } catch (error) {
    console.error('Follow debug error:', error);
    return res.status(500).json({
      success: false,
      message: "Error checking follow status",
      error: error.message
    });
  }
});

/**
 * @route   GET /api/users/:id
 * @desc    Get a user by ID
 * @access  Public
 * @note    This route must be defined last to prevent conflicts with other routes
 */
router.get("/:id", getUserById);

module.exports = router;
