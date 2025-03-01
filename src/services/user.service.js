const User = require("../models/user.model");
const bcrypt = require("bcryptjs");

/**
 * Fetches a user by ID.
 * @param {string} userId - The ID of the user.
 * @returns {Object} - The user object (excluding password).
 */
const getUserById = async (userId) => {
  const user = await User.findById(userId).select("-password");
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};

/**
 * Fetches all users with optional filtering.
 * @returns {Array} - List of all users.
 */
const getAllUsers = async () => {
  return await User.find().select("-password").sort({ createdAt: -1 });
};

/**
 * Updates user profile.
 * @param {string} userId - The ID of the user.
 * @param {Object} updateData - The updated user details.
 * @returns {Object} - The updated user.
 */
const updateUser = async (userId, updateData) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Prevent password update through this function
  if (updateData.password) {
    throw new Error("Use the change password function to update your password.");
  }

  Object.assign(user, updateData);
  await user.save();
  return user;
};

/**
 * Changes user password.
 * @param {string} userId - The ID of the user.
 * @param {string} oldPassword - The current password.
 * @param {string} newPassword - The new password.
 * @returns {Object} - Success message.
 */
const changePassword = async (userId, oldPassword, newPassword) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Check if the old password matches
  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    throw new Error("Incorrect old password.");
  }

  // Hash and update new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  await user.save();
  return { message: "Password updated successfully" };
};

/**
 * Deletes a user account.
 * @param {string} userId - The ID of the user.
 * @returns {Object} - Success message.
 */
const deleteUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  await user.deleteOne();
  return { message: "User deleted successfully" };
};

/**
 * Searches users by name or email.
 * @param {string} query - The search query.
 * @returns {Array} - List of matching users.
 */
const searchUsers = async (query) => {
  return await User.find({
    $or: [
      { fullName: { $regex: query, $options: "i" } },
      { email: { $regex: query, $options: "i" } },
    ],
  }).select("-password");
};

/**
 * Follow a user.
 * @param {string} currentUserId - The ID of the current user.
 * @param {string} targetUserId - The ID of the user to follow.
 * @returns {Object} - Success message.
 */
const followUser = async (currentUserId, targetUserId) => {
  // Check if trying to follow self
  if (currentUserId.toString() === targetUserId.toString()) {
    throw new Error("You cannot follow yourself");
  }

  // Check if target user exists
  const targetUser = await User.findById(targetUserId);
  if (!targetUser) {
    throw new Error("Target user not found");
  }

  // Check if already following
  const currentUser = await User.findById(currentUserId);
  if (!currentUser) {
    throw new Error("Current user not found");
  }

  const isAlreadyFollowing = currentUser.following.some(
    id => id.toString() === targetUserId.toString()
  );

  if (isAlreadyFollowing) {
    throw new Error("You are already following this user");
  }

  // Update both users
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

  return { message: "User followed successfully" };
};

/**
 * Unfollow a user.
 * @param {string} currentUserId - The ID of the current user.
 * @param {string} targetUserId - The ID of the user to unfollow.
 * @returns {Object} - Success message.
 */
const unfollowUser = async (currentUserId, targetUserId) => {
  // Check if trying to unfollow self
  if (currentUserId.toString() === targetUserId.toString()) {
    throw new Error("You cannot unfollow yourself");
  }

  // Check if target user exists
  const targetUser = await User.findById(targetUserId);
  if (!targetUser) {
    throw new Error("Target user not found");
  }

  // Check if actually following
  const currentUser = await User.findById(currentUserId);
  if (!currentUser) {
    throw new Error("Current user not found");
  }

  const isFollowing = currentUser.following.some(
    id => id.toString() === targetUserId.toString()
  );

  if (!isFollowing) {
    throw new Error("You are not following this user");
  }

  // Update both users
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

  return { message: "User unfollowed successfully" };
};

/**
 * Get followers of a user.
 * @param {string} userId - The ID of the user.
 * @returns {Array} - List of followers.
 */
const getFollowers = async (userId) => {
  const user = await User.findById(userId)
    .populate("followers", "fullName email profilePicture")
    .select("followers");

  if (!user) {
    throw new Error("User not found");
  }

  return user.followers;
};

/**
 * Get users that a user is following.
 * @param {string} userId - The ID of the user.
 * @returns {Array} - List of followed users.
 */
const getFollowing = async (userId) => {
  const user = await User.findById(userId)
    .populate("following", "fullName email profilePicture")
    .select("following");

  if (!user) {
    throw new Error("User not found");
  }

  return user.following;
};

/**
 * Check if one user is following another.
 * @param {string} currentUserId - The ID of the current user.
 * @param {string} targetUserId - The ID of the target user.
 * @returns {Object} - Follow status.
 */
const checkFollowStatus = async (currentUserId, targetUserId) => {
  const currentUser = await User.findById(currentUserId);
  
  if (!currentUser) {
    throw new Error("User not found");
  }

  const isFollowing = currentUser.following.some(
    id => id.toString() === targetUserId.toString()
  );

  return { isFollowing };
};

module.exports = {
  getUserById,
  getAllUsers,
  updateUser,
  changePassword,
  deleteUser,
  searchUsers,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  checkFollowStatus
};
