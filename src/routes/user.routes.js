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

const router = express.Router();

// This middleware handles empty body specifically for follow/unfollow routes
const handleFollowRequest = (req, res, next) => {
  try {
    console.log('Follow request handler - before:', {
      body: req.body,
      contentType: req.headers['content-type']
    });
    
    // Force req.body to be an object
    req.body = req.body || {};
    
    // Ensure we don't continue with an undefined body
    if (typeof req.body !== 'object') {
      req.body = {};
    }
    
    console.log('Follow request handler - after:', {
      body: req.body,
      contentType: req.headers['content-type']
    });
    
    next();
  } catch (error) {
    console.error('Error in follow request handler:', error);
    // Don't let parsing errors stop the request
    req.body = {};
    next();
  }
};

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Private (Admin)
 */
router.get("/", protect, adminOnly, getAllUsers);

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
router.post("/follow/:id", protect, handleFollowRequest, followUser);

/**
 * @route   POST /api/users/unfollow/:id
 * @desc    Unfollow a user
 * @access  Private
 */
router.post("/unfollow/:id", protect, handleFollowRequest, unfollowUser);

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
 * @route   GET /api/users/follow-user/:id
 * @desc    Alternative way to follow a user (using GET to avoid JSON body issues)
 * @access  Private
 */
router.get("/follow-user/:id", protect, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;
    
    // Basic validation
    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format"
      });
    }
    
    if (targetUserId === currentUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot follow yourself"
      });
    }
    
    // Find target user
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "Target user not found"
      });
    }
    
    // Check if already following
    const isAlreadyFollowing = targetUser.followers.some(follower => 
      follower.toString() === currentUserId.toString()
    );
    
    if (isAlreadyFollowing) {
      return res.status(400).json({
        success: false,
        message: "You are already following this user"
      });
    }
    
    // Update the follow relationship
    await Promise.all([
      User.findByIdAndUpdate(
        targetUserId,
        { $addToSet: { followers: currentUserId } }
      ),
      User.findByIdAndUpdate(
        currentUserId,
        { $addToSet: { following: targetUserId } }
      )
    ]);
    
    return res.status(200).json({
      success: true,
      message: "Successfully followed user",
      data: { followedUserId: targetUserId }
    });
  } catch (error) {
    console.error('Follow user error:', error);
    return res.status(500).json({
      success: false,
      message: "Server error while following user",
      error: error.message
    });
  }
});

/**
 * @route   GET /api/users/unfollow-user/:id
 * @desc    Alternative way to unfollow a user (using GET to avoid JSON body issues)
 * @access  Private
 */
router.get("/unfollow-user/:id", protect, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;
    
    console.log(`Alternative unfollow route used: ${currentUserId} -> ${targetUserId}`);
    
    // Basic validation
    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format"
      });
    }
    
    if (targetUserId === currentUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot unfollow yourself"
      });
    }
    
    // Find both users
    const [targetUser, currentUser] = await Promise.all([
      User.findById(targetUserId),
      User.findById(currentUserId)
    ]);
    
    // Verify both users exist
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "Target user not found"
      });
    }
    
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "Current user not found"
      });
    }
    
    // Check if following using string comparison
    const targetIdStr = targetUserId.toString();
    const isFollowing = currentUser.following.some(id => id.toString() === targetIdStr);
    
    if (!isFollowing) {
      return res.status(400).json({
        success: false,
        message: "You are not following this user"
      });
    }
    
    // Process unfollow
    await Promise.all([
      User.updateOne(
        { _id: targetUserId },
        { $pull: { followers: currentUserId } }
      ),
      User.updateOne(
        { _id: currentUserId },
        { $pull: { following: targetUserId } }
      )
    ]);
    
    return res.status(200).json({
      success: true,
      message: "Successfully unfollowed user",
      data: { unfollowedUserId: targetUserId }
    });
  } catch (error) {
    console.error('GET unfollow user error:', error);
    return res.status(500).json({
      success: false,
      message: "Server error while unfollowing user",
      error: error.message
    });
  }
});

/**
 * @route   GET /api/users/debug/follow-status/:followerId/:targetId
 * @desc    Debug route to check follow relationship between two users
 * @access  Private (Admin only)
 */
router.get("/debug/follow-status/:followerId/:targetId", protect, adminOnly, async (req, res) => {
  try {
    const { followerId, targetId } = req.params;
    
    const result = await checkFollowRelationship(followerId, targetId);
    
    if (result.error) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }
    
    return res.status(200).json({
      success: true,
      message: "Follow relationship details",
      data: result
    });
  } catch (error) {
    console.error('Debug follow status error:', error);
    return res.status(500).json({
      success: false,
      message: "Server error checking follow relationship",
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
