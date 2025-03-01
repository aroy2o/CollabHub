const Post = require("../models/post.model");
const Comment = require("../models/comment.model");
const User = require("../models/user.model");
const { createPost, getAllPosts, getPostById, updatePost, deletePost } = require("../services/post.service");

/**
 * @desc Create a new post
 * @route POST /api/posts
 * @access Private
 */
exports.createPost = async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    const userId = req.user.id;
    const file = req.files ? req.files.file : null;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    const newPost = await createPost({ title, content, userId, tags }, file);
    res.status(201).json({ message: "Post created successfully", post: newPost });
  } catch (error) {
    console.error("Create post error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc Get all posts
 * @route GET /api/posts
 * @access Public
 */
exports.getAllPosts = async (req, res) => {
  try {
    let posts = await Post.find()
      .populate("author", "fullName email profilePicture")
      .sort({ createdAt: -1 })
      .lean();  // Convert to plain JS objects for better performance

    // Ensure all array properties are defined before accessing them
    posts = posts.map(post => ({
      ...post,
      comments: post.comments || [],
      likes: post.likes || [],
      tags: post.tags || [],
      attachments: post.attachments || []
    }));

    res.json(posts);
  } catch (error) {
    console.error("Error in getAllPosts:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc Get a single post by ID
 * @route GET /api/posts/:postId
 * @access Public
 */
exports.getPostById = async (req, res) => {
  try {
    const { postId } = req.params;
    
    if (!postId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid post ID format" });
    }
    
    const post = await Post.findById(postId)
      .populate("author", "fullName email profilePicture")
      .populate({
        path: "comments.user",
        select: "fullName email profilePicture"
      })
      .lean();  // Convert to plain object for better performance

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Ensure all array properties are defined
    const safePost = {
      ...post,
      comments: post.comments || [],
      likes: post.likes || [],
      tags: post.tags || [],
      attachments: post.attachments || []
    };

    res.json(safePost);
  } catch (error) {
    console.error("Error in getPostById:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc Update a post
 * @route PUT /api/posts/:postId
 * @access Private
 */
exports.updatePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { title, content, tags } = req.body;
    const userId = req.user.id;

    let post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.author.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized action" });
    }

    post.title = title || post.title;
    post.content = content || post.content;
    post.tags = tags || post.tags;
    
    await post.save();
    res.json({ message: "Post updated", post });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc Delete a post
 * @route DELETE /api/posts/:postId
 * @access Private
 */
exports.deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.author.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized action" });
    }

    await post.deleteOne();
    await Comment.deleteMany({ post: postId });

    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc Like or unlike a post
 * @route POST /api/posts/:postId/like
 * @access Private
 */
exports.likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Ensure likes array exists
    if (!post.likes) {
      post.likes = [];
    }

    const alreadyLiked = post.likes.includes(userId);

    if (alreadyLiked) {
      post.likes = post.likes.filter((like) => like.toString() !== userId);
      await post.save();
      return res.json({ message: "Like removed", post });
    }

    post.likes.push(userId);
    await post.save();

    res.json({ message: "Post liked", post });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc Add a comment to a post
 * @route POST /api/posts/:postId/comment
 * @access Private
 */
exports.commentOnPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content) {
      return res.status(400).json({ message: "Comment content is required" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Initialize comments array if it doesn't exist
    if (!post.comments) {
      post.comments = [];
    }

    // Create the comment
    const newComment = {
      user: userId,
      text: content,
      createdAt: new Date()
    };
    
    // Add comment to the array
    post.comments.push(newComment);
    
    await post.save();

    // Populate the user information for the new comment
    const populatedPost = await Post.findById(postId)
      .populate({
        path: "comments.user",
        select: "fullName email profilePicture"
      });
      
    const addedComment = populatedPost.comments[populatedPost.comments.length - 1];

    res.status(201).json({ 
      message: "Comment added successfully", 
      comment: addedComment
    });
  } catch (error) {
    console.error("Comment error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc Bookmark or unbookmark a post
 * @route POST /api/posts/:postId/bookmark
 * @access Private
 */
exports.bookmarkPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if post is already bookmarked
    const isBookmarked = user.bookmarks.includes(postId);

    if (isBookmarked) {
      // Remove from bookmarks if already bookmarked
      user.bookmarks = user.bookmarks.filter(
        bookmark => bookmark.toString() !== postId
      );
      await user.save();
      return res.json({
        message: "Post removed from bookmarks",
        bookmarked: false
      });
    } else {
      // Add to bookmarks
      user.bookmarks.push(postId);
      await user.save();
      return res.json({
        message: "Post bookmarked successfully",
        bookmarked: true
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Also add a method to get all bookmarked posts for the current user
/**
 * @desc Get all bookmarked posts for the current user
 * @route GET /api/posts/bookmarks
 * @access Private
 */
exports.getBookmarkedPosts = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId)
      .populate({
        path: "bookmarks",
        populate: { path: "author", select: "name email" }
      });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(user.bookmarks);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
