const User = require('../models/user.model');
const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * Optimized follow user controller
 * @route POST /api/users/follow/:id
 * @access Private
 */
exports.followUser = async (req, res) => {
  const start = Date.now(); // For performance tracking
  
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;
    
    logger.info(`Follow request: ${currentUserId} -> ${targetUserId}`);
    
    // Quick validation - fail fast for obvious issues
    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format"
      });
    }
    
    // Prevent self-following
    if (targetUserId === currentUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot follow yourself"
      });
    }
    
    // Find both users in parallel - more efficient than sequential queries
    const [targetUser, currentUser] = await Promise.all([
      User.findById(targetUserId).select('_id fullName followers'),
      User.findById(currentUserId).select('_id following')
    ]);
    
    // Validation checks
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
    
    // Check if already following - prevent duplicate follows
    const isAlreadyFollowing = currentUser.following.some(id => 
      id.toString() === targetUserId
    );
    
    if (isAlreadyFollowing) {
      return res.status(400).json({
        success: false,
        message: "You are already following this user"
      });
    }
    
    // Optimized update operations - no session needed for simple operations
    // Use updateOne for better performance than findAndUpdate
    await Promise.all([
      User.updateOne(
        { _id: targetUserId },
        { $addToSet: { followers: currentUserId } }
      ),
      User.updateOne(
        { _id: currentUserId },
        { $addToSet: { following: targetUserId } }
      )
    ]);
    
    // Log performance
    const duration = Date.now() - start;
    logger.info(`Follow operation completed in ${duration}ms: ${currentUserId} followed ${targetUserId}`);
    
    return res.status(200).json({
      success: true,
      message: "Successfully followed user",
      data: { 
        followedUserId: targetUserId,
        followedUserName: targetUser.fullName 
      }
    });
  } catch (error) {
    logger.error('Follow operation error:', {
      error: error.message,
      stack: error.stack,
      userId: req.user?._id,
      targetId: req.params?.id
    });
    
    return res.status(500).json({
      success: false,
      message: "Server error while processing follow request",
      error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message
    });
  }
};

/**
 * Optimized unfollow user controller
 * @route POST /api/users/unfollow/:id
 * @access Private
 */
exports.unfollowUser = async (req, res) => {
  const start = Date.now(); // For performance tracking
  
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;
    
    logger.info(`Unfollow request: ${currentUserId} -> ${targetUserId}`);
    
    // Quick validation - fail fast for obvious issues
    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format"
      });
    }
    
    // Prevent self-unfollowing
    if (targetUserId === currentUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot unfollow yourself"
      });
    }
    
    // Find both users in parallel - more efficient than sequential queries
    const [targetUser, currentUser] = await Promise.all([
      User.findById(targetUserId).select('_id fullName followers'),
      User.findById(currentUserId).select('_id following')
    ]);
    
    // Validation checks
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
    
    // Check if actually following - prevent unnecessary operations
    const isFollowing = currentUser.following.some(id => 
      id.toString() === targetUserId
    );
    
    if (!isFollowing) {
      return res.status(400).json({
        success: false,
        message: "You are not following this user"
      });
    }
    
    // Optimized update operations
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
    
    // Log performance
    const duration = Date.now() - start;
    logger.info(`Unfollow operation completed in ${duration}ms: ${currentUserId} unfollowed ${targetUserId}`);
    
    return res.status(200).json({
      success: true,
      message: "Successfully unfollowed user",
      data: { 
        unfollowedUserId: targetUserId,
        unfollowedUserName: targetUser.fullName 
      }
    });
  } catch (error) {
    logger.error('Unfollow operation error:', {
      error: error.message,
      stack: error.stack,
      userId: req.user?._id,
      targetId: req.params?.id
    });
    
    return res.status(500).json({
      success: false,
      message: "Server error while processing unfollow request",
      error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message
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

/**
 * @desc Get the follow status between current user and target user
 * @route GET /api/users/follow/:id/status
 * @access Private
 */
exports.getFollowStatus = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;
    
    logger.info(`Follow status check: ${currentUserId} -> ${targetUserId}`);
    
    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format"
      });
    }
    
    // Find both users in parallel for efficiency
    const [targetUser, currentUser] = await Promise.all([
      User.findById(targetUserId).select('_id fullName followers'),
      User.findById(currentUserId).select('_id following')
    ]);
    
    // Check if both users exist
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
    const isFollowing = currentUser.following.some(
      id => id.toString() === targetUserId
    );
    
    return res.status(200).json({
      success: true,
      isFollowing,
      currentUser: {
        id: currentUser._id,
        followingCount: currentUser.following.length
      },
      targetUser: {
        id: targetUser._id,
        name: targetUser.fullName,
        followerCount: targetUser.followers.length
      }
    });
  } catch (error) {
    logger.error('Check follow status error:', {
      error: error.message,
      stack: error.stack,
      userId: req.user?._id,
      targetId: req.params?.id
    });
    
    return res.status(500).json({
      success: false,
      message: "Server error checking follow status",
      error: error.message
    });
  }
};
