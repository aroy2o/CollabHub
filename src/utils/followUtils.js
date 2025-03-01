const mongoose = require('mongoose');
const User = require('../models/user.model');

/**
 * Checks the follow relationship between two users
 * @param {string} followerId - ID of the potential follower
 * @param {string} targetId - ID of the target user
 * @returns {Object} - Details of the follow relationship
 */
exports.checkFollowRelationship = async (followerId, targetId) => {
  try {
    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(followerId) || 
        !mongoose.Types.ObjectId.isValid(targetId)) {
      return { error: "Invalid user ID format" };
    }
    
    // Get both users
    const [follower, target] = await Promise.all([
      User.findById(followerId),
      User.findById(targetId)
    ]);
    
    // Check if both users exist
    if (!follower) return { error: "Follower user not found" };
    if (!target) return { error: "Target user not found" };
    
    // Check follow relationship in both arrays
    const followerIdStr = followerId.toString();
    const targetIdStr = targetId.toString();
    
    const isInFollowing = follower.following.some(id => 
      id.toString() === targetIdStr
    );
    
    const isInFollowers = target.followers.some(id => 
      id.toString() === followerIdStr
    );
    
    return {
      followerUser: {
        id: followerIdStr,
        name: follower.fullName,
        followingCount: follower.following.length,
        followsTarget: isInFollowing,
      },
      targetUser: {
        id: targetIdStr,
        name: target.fullName,
        followerCount: target.followers.length,
        hasFollowerUser: isInFollowers,
      },
      relationship: {
        isFollowing: isInFollowing,
        isConsistent: isInFollowing === isInFollowers,
      }
    };
  } catch (error) {
    console.error('Error checking follow relationship:', error);
    return { error: error.message };
  }
};
