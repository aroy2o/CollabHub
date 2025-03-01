const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const dotenv = require("dotenv");

dotenv.config();

/**
 * @desc Middleware to protect private routes by verifying JWT token
 */
exports.protect = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ 
        success: false, 
        message: "No token provided, authorization denied" 
      });
    }

    const token = authHeader.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid token format, authorization denied" 
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found or account inactive"
        });
      }

      req.user = user;
      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token expired, please log in again"
        });
      }
      throw error;
    }
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Authentication failed, invalid token",
    });
  }
};

/**
 * @desc Middleware to check if user is an admin
 */
exports.adminOnly = (req, res, next) => {
  if (!req.user || req.user.userRole !== "admin") {
    return res.status(403).json({ 
      success: false, 
      message: "Access denied, admin only" 
    });
  }
  next();
};

/**
 * @desc Middleware to check if user is owner of the account or an admin
 */
exports.isOwnerOrAdmin = (req, res, next) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: "User ID parameter is required" 
      });
    }

    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized, please log in" 
      });
    }

    if (req.user._id.toString() === userId || req.user.userRole === "admin") {
      return next();
    } else {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied, you can only modify your own account" 
      });
    }
  } catch (error) {
    console.error("Owner check middleware error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error checking permissions",
      error: error.message
    });
  }
};
