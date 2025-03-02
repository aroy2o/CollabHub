const mongoose = require('mongoose');

/**
 * Middleware to validate user ID parameters
 */
exports.validateUserId = (req, res, next) => {
  const userId = req.params.id;
  
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID format"
    });
  }
  
  next();
};

/**
 * Middleware to prevent self-follow/unfollow
 */
exports.preventSelfAction = (req, res, next) => {
  const targetId = req.params.id;
  const currentUserId = req.user?._id;
  
  if (targetId === currentUserId?.toString()) {
    return res.status(400).json({
      success: false,
      message: req.path.includes('follow') ? 
        "You cannot follow yourself" : 
        "You cannot unfollow yourself"
    });
  }
  
  next();
};
