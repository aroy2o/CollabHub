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
    // Log the checking operation
    console.log(`Checking follow relationship - Follower: ${followerId}, Target: ${targetId}`);
    
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
    
    // Check follow relationship in both arrays - convert ObjectIds to strings for safe comparison
    const followerIdStr = followerId.toString();
    const targetIdStr = targetId.toString();
    
    const isInFollowing = follower.following.some(id => 
      id.toString() === targetIdStr
    );
    
    const isInFollowers = target.followers.some(id => 
      id.toString() === followerIdStr
    );
    
    // Log the results
    console.log(`Follow relationship check results - In following: ${isInFollowing}, In followers: ${isInFollowers}`);
    
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

/**
 * Fix inconsistent follow relationships if they exist
 * @param {string} userId - ID of the user to check relationships for
 * @returns {Object} - Results of the fix operation
 */
exports.repairFollowRelationships = async (userId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return { success: false, error: "Invalid user ID format" };
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return { success: false, error: "User not found" };
    }
    
    const inconsistencies = {
      fixed: 0,
      details: []
    };
    
    // Check all following relationships
    for (const followingId of user.following) {
      const targetUser = await User.findById(followingId);
      if (!targetUser) {
        // Remove non-existent users from following
        await User.findByIdAndUpdate(userId, {
          $pull: { following: followingId }
        });
        inconsistencies.fixed++;
        inconsistencies.details.push({
          type: "removed_nonexistent_following",
          userId: userId,
          followingId: followingId.toString()
        });
        continue;
      }
      
      const hasFollower = targetUser.followers.some(
        id => id.toString() === userId.toString()
      );
      
      if (!hasFollower) {
        // Fix inconsistency: add to followers
        await User.findByIdAndUpdate(followingId, {
          $addToSet: { followers: userId }
        });
        inconsistencies.fixed++;
        inconsistencies.details.push({
          type: "added_missing_follower",
          userId: userId,
          followingId: followingId.toString()
        });
      }
    }
    
    // Check all followers relationships
    for (const followerId of user.followers) {
      const followerUser = await User.findById(followerId);
      if (!followerUser) {
        // Remove non-existent users from followers
        await User.findByIdAndUpdate(userId, {
          $pull: { followers: followerId }
        });
        inconsistencies.fixed++;
        inconsistencies.details.push({
          type: "removed_nonexistent_follower",
          userId: userId,
          followerId: followerId.toString()
        });
        continue;
      }
      
      const hasFollowing = followerUser.following.some(
        id => id.toString() === userId.toString()
      );
      
      if (!hasFollowing) {
        // Fix inconsistency: add to following
        await User.findByIdAndUpdate(followerId, {
          $addToSet: { following: userId }
        });
        inconsistencies.fixed++;
        inconsistencies.details.push({
          type: "added_missing_following",
          userId: userId,
          followerId: followerId.toString()
        });
      }
    }
    
    return {
      success: true,
      inconsistenciesFixed: inconsistencies.fixed,
      details: inconsistencies.details
    };
  } catch (error) {
    console.error('Error repairing follow relationships:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};
