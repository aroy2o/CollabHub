const express = require("express");
const { protect } = require("../middleware/auth.middleware");
const {
  createComment,
  getComments,
  updateComment,
  deleteComment,
} = require("../controllers/comment.controller");

const router = express.Router();

/**
 * @route   POST /api/comments
 * @desc    Create a new comment on a post or project
 * @access  Private (Requires authentication)
 */
router.post("/", protect, createComment);

/**
 * @route   GET /api/comments/:postId
 * @desc    Get all comments for a specific post or project
 * @access  Public
 */
router.get("/:postId", getComments);

/**
 * @route   PUT /api/comments/:commentId
 * @desc    Update a specific comment
 * @access  Private (Only comment owner can update)
 */
router.put("/:commentId", protect, updateComment);

/**
 * @route   DELETE /api/comments/:commentId
 * @desc    Delete a comment
 * @access  Private (Only comment owner or admin can delete)
 */
router.delete("/:commentId", protect, deleteComment);

module.exports = router;
