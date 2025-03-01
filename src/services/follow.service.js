const User = require('../models/user.model');
const mongoose = require('mongoose');

/**
 * Follow a user
 * @param {string} currentUserId - ID of the user performing the follow action
 * @param {string} targetUserId - ID of the user to be followed
 * @returns {Object} - Result with success status and message
 */
const followUser = async (currentUserId, targetUserId) => {
  // Check if IDs are valid MongoDB ObjectIds
  if (!mongoose.Types.ObjectId.isValid(currentUserId) || !mongoose.Types.ObjectId.isValid(targetUserId)) {
    throw new Error('Invalid user ID format');
  }
  
  // Prevent user from following themselves
  if (currentUserId === targetUserId) {
    throw new Error('You cannot follow yourself');
  }

  // Find both users
  const [currentUser, targetUser] = await Promise.all([
    User.findById(currentUserId),
    User.findById(targetUserId)
  ]);

  // Check if both users exist
  if (!currentUser) throw new Error('Current user not found');
  if (!targetUser) throw new Error('User you want to follow does not exist');
  
  // Check if already following
  if (currentUser.following.includes(targetUserId)) {
    throw new Error('You are already following this user');
  }

  // Update both users atomically using session for consistency
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Add target to current user's following
    await User.findByIdAndUpdate(
      currentUserId,
      { $addToSet: { following: targetUserId } },
      { session }
    );
    
    // Add current user to target's followers
    await User.findByIdAndUpdate(
      targetUserId,
      { $addToSet: { followers: currentUserId } },
      { session }
    );
    
    await session.commitTransaction();
    session.endSession();
    
    return { success: true, message: 'Successfully followed user' };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/**
 * Unfollow a user
 * @param {string} currentUserId - ID of the user performing the unfollow action
 * @param {string} targetUserId - ID of the user to be unfollowed
 * @returns {Object} - Result with success status and message
 */
const unfollowUser = async (currentUserId, targetUserId) => {
  // Check if IDs are valid MongoDB ObjectIds
  if (!mongoose.Types.ObjectId.isValid(currentUserId) || !mongoose.Types.ObjectId.isValid(targetUserId)) {
    throw new Error('Invalid user ID format');
  }
  
  // Prevent user from unfollowing themselves (should never happen)
  if (currentUserId === targetUserId) {
    throw new Error('You cannot unfollow yourself');
  }

  // Find both users
  const [currentUser, targetUser] = await Promise.all([
    User.findById(currentUserId),
    User.findById(targetUserId)
  ]);

  // Check if both users exist
  if (!currentUser) throw new Error('Current user not found');
  if (!targetUser) throw new Error('User you want to unfollow does not exist');
  
  // Check if actually following
  if (!currentUser.following.includes(targetUserId)) {
    throw new Error('You are not following this user');
  }

  // Update both users atomically using session for consistency
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Remove target from current user's following
    await User.findByIdAndUpdate(
      currentUserId,
      { $pull: { following: targetUserId } },
      { session }
    );
    
    // Remove current user from target's followers
    await User.findByIdAndUpdate(
      targetUserId,
      { $pull: { followers: currentUserId } },
      { session }
    );
    
    await session.commitTransaction();
    session.endSession();
    
    return { success: true, message: 'Successfully unfollowed user' };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/**
 * Get followers of a user
 * @param {string} userId - ID of the user
 * @param {number} limit - Max number of followers to return
 * @param {number} skip - Number of followers to skip for pagination
 * @returns {Array} - List of followers
 */
const getFollowers = async (userId, limit = 10, skip = 0) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('Invalid user ID format');
  }
  
  const user = await User.findById(userId)
    .populate({
      path: 'followers',
      select: '_id fullName emailAddress profilePicture biography',
      options: {
        limit: parseInt(limit),
        skip: parseInt(skip),
        sort: { fullName: 1 }
      }
    });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  return user.followers;
};

/**
 * Get users that a user is following
 * @param {string} userId - ID of the user
 * @param {number} limit - Max number of following to return
 * @param {number} skip - Number of following to skip for pagination
 * @returns {Array} - List of users being followed
 */
const getFollowing = async (userId, limit = 10, skip = 0) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('Invalid user ID format');
  }
  
  const user = await User.findById(userId)
    .populate({
      path: 'following',
      select: '_id fullName emailAddress profilePicture biography',
      options: {
        limit: parseInt(limit),
        skip: parseInt(skip),
        sort: { fullName: 1 }
      }
    });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  return user.following;
};

/**
 * Check if a user is following another user
 * @param {string} currentUserId - ID of the user checking the follow status
 * @param {string} targetUserId - ID of the user to check against
 * @returns {boolean} - Whether the current user follows the target user
 */
const isFollowing = async (currentUserId, targetUserId) => {
  if (!mongoose.Types.ObjectId.isValid(currentUserId) || 
      !mongoose.Types.ObjectId.isValid(targetUserId)) {
    throw new Error('Invalid user ID format');
  }
  
  const currentUser = await User.findById(currentUserId);
  if (!currentUser) {
    throw new Error('User not found');
  }
  
  return currentUser.following.includes(targetUserId);
};

module.exports = {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  isFollowing
};
