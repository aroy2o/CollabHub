const express = require('express');
const { uploadProfilePicture, deleteProfilePicture } = require('../controllers/profilePicture.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * @route   POST /api/profile-picture
 * @desc    Upload user profile picture
 * @access  Private
 */
router.post('/', protect, uploadProfilePicture);

/**
 * @route   DELETE /api/profile-picture
 * @desc    Delete user profile picture
 * @access  Private
 */
router.delete('/', protect, deleteProfilePicture);

module.exports = router;
