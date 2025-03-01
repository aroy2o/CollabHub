const User = require('../models/user.model');
const mongoose = require('mongoose');
const { checkFollowRelationship } = require('../utils/followUtils');

/**
 * @desc Follow a user
 * @route POST /api/users/follow/:id
 * @access Private
 */
exports.followUser = async (req, res) => {
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
};

/**
 * @desc Unfollow a user
 * @route POST /api/users/unfollow/:id
 * @access Private
 */
exports.unfollowUser = async (req, res) => {
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
    
    // Check if following
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
    console.error('Unfollow user error:', error);
    return res.status(500).json({
      success: false,
      message: "Server error while unfollowing user",
      error: error.message
    });
  }
};

/**
 * @desc Get a user's followers
 * @route GET /api/users/:id/followers
 * @access Public
 */
exports.getFollowers = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format"
      });
    }
    
    // Find user and populate followers
    const user = await User.findById(userId)
      .select('followers')
      .populate('followers', 'fullName email profilePicture');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    return res.status(200).json({
      success: true,
      count: user.followers.length,
      data: user.followers
    });
  } catch (error) {
    console.error('Get followers error:', error);
    return res.status(500).json({
      success: false,
      message: "Server error retrieving followers",
      error: error.message
    });
  }
};

/**
 * @desc Get users that a user is following
 * @route GET /api/users/:id/following
 * @access Public
 */
exports.getFollowing = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format"
      });
    }
    
    // Find user and populate following
    const user = await User.findById(userId)
      .select('following')
      .populate('following', 'fullName email profilePicture');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    return res.status(200).json({
      success: true,
      count: user.following.length,
      data: user.following
    });
  } catch (error) {
    console.error('Get following error:', error);
    return res.status(500).json({
      success: false,
      message: "Server error retrieving following users",
      error: error.message
    });
  }
};

/**
 * @desc Check if the logged-in user is following another user
 * @route GET /api/users/:id/is-following
 * @access Private
 */
exports.checkIfFollowing = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;
    
    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format"
      });
    }
    
    // Find current user
    const currentUser = await User.findById(currentUserId);
    
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "Current user not found"
      });
    }
    
    // Check if following
    const isFollowing = currentUser.following.some(
      id => id.toString() === targetUserId
    );
    
    return res.status(200).json({
      success: true,
      isFollowing
    });
  } catch (error) {
    console.error('Check if following error:', error);
    return res.status(500).json({
      success: false,
      message: "Server error checking follow status",
      error: error.message
    });
  }
};
