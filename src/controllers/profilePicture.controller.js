const User = require('../models/user.model');
const { uploadProfileImage, deleteProfileImage } = require('../utils/cloudinary');

// Default profile picture as data URI (SVG)
const DEFAULT_PROFILE_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'%3E%3Crect width='150' height='150' fill='%23e2e8f0'/%3E%3Ccircle cx='75' cy='65' r='30' fill='%2394a3b8'/%3E%3Cpath d='M35,120 C35,95 115,95 115,120' fill='%2394a3b8'/%3E%3C/svg%3E";

/**
 * @desc Upload user profile picture to Cloudinary
 * @route POST /api/profile-picture
 * @access Private
 */
exports.uploadProfilePicture = async (req, res) => {
  try {
    // Debug: log the uploaded files to verify the field name
    console.log('Uploaded files:', req.files);
    
    // Accept file from either "profilePicture" or "file" field
    const file = (req.files && (req.files.profilePicture || req.files.file));
    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a profile picture'
      });
    }
    
    const userId = req.user._id;
    // Validate file type
    if (!file.mimetype.startsWith('image')) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file'
      });
    }
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // If user already has a profile picture with public_id, delete it
    if (user.profilePictureId) {
      await deleteProfileImage(user.profilePictureId);
    }
    
    // Upload image to Cloudinary using our selected file
    const uploadResult = await uploadProfileImage(file);
    
    // Update user with new profile picture info
    user.profilePicture = uploadResult.secure_url;
    user.profilePictureId = uploadResult.public_id;
    await user.save();
    
    return res.status(200).json({
      success: true,
      message: 'Profile picture updated successfully',
      data: {
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    console.error('Profile picture upload error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error uploading profile picture',
      error: error.message
    });
  }
};

/**
 * @desc Delete user profile picture
 * @route DELETE /api/profile-picture
 * @access Private
 */
exports.deleteProfilePicture = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // If user has a profile picture with public_id, delete it from Cloudinary
    if (user.profilePictureId) {
      await deleteProfileImage(user.profilePictureId);
    }
    
    // Reset to default picture (using our embedded SVG)
    user.profilePicture = DEFAULT_PROFILE_IMAGE;
    user.profilePictureId = null;
    await user.save();
    
    return res.status(200).json({
      success: true,
      message: 'Profile picture removed successfully'
    });
  } catch (error) {
    console.error('Profile picture delete error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting profile picture',
      error: error.message
    });
  }
};
