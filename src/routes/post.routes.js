const express = require("express");
const { protect } = require("../middleware/auth.middleware");
const {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  commentOnPost,
  bookmarkPost,
  getBookmarkedPosts
} = require("../controllers/post.controller");

const router = express.Router();

// Fix: Move the bookmarks route before the :postId routes to prevent conflicts
/**
 * @route   GET /api/posts/bookmarks
 * @desc    Get all bookmarked posts for the current user
 * @access  Private
 */
router.get("/bookmarks", protect, getBookmarkedPosts);

/**
 * @route   POST /api/posts
 * @desc    Create a new post
 * @access  Private (Requires authentication)
 */
router.post("/", protect, createPost);

/**
 * @route   GET /api/posts
 * @desc    Get all posts
 * @access  Public
 */
router.get("/", getAllPosts);

/**
 * @route   GET /api/posts/:postId
 * @desc    Get a single post by ID
 * @access  Public
 */
router.get("/:postId", getPostById);

/**
 * @route   PUT /api/posts/:postId
 * @desc    Update a specific post
 * @access  Private (Only post owner can update)
 */
router.put("/:postId", protect, updatePost);

/**
 * @route   DELETE /api/posts/:postId
 * @desc    Delete a post
 * @access  Private (Only post owner or admin can delete)
 */
router.delete("/:postId", protect, deletePost);

/**
 * @route   POST /api/posts/:postId/like
 * @desc    Like or unlike a post
 * @access  Private
 */
router.post("/:postId/like", protect, likePost);

/**
 * @route   POST /api/posts/:postId/comment
 * @desc    Add a comment to a post
 * @access  Private
 */
router.post("/:postId/comment", protect, commentOnPost);

/**
 * @route   POST /api/posts/:postId/bookmark
 * @desc    Bookmark or unbookmark a post
 * @access  Private
 */
router.post("/:postId/bookmark", protect, bookmarkPost);

module.exports = router;
