const Comment = require("../models/comment.model");
const Post = require("../models/post.model");
const Project = require("../models/project.model");

/**
 * @desc Create a new comment on a post or project
 * @route POST /api/comments
 * @access Private
 */
exports.createComment = async (req, res) => {
  try {
    const { content, postId, projectId } = req.body;
    const userId = req.user.id;

    if (!content) return res.status(400).json({ message: "Content is required" });

    if (!postId && !projectId) {
      return res.status(400).json({ message: "Post ID or Project ID is required" });
    }

    // Check if post or project exists
    if (postId && !(await Post.findById(postId))) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (projectId && !(await Project.findById(projectId))) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Create new comment
    const newComment = new Comment({
      content,
      author: userId,
      post: postId || null,
      project: projectId || null,
    });

    await newComment.save();

    res.status(201).json({ message: "Comment added successfully", comment: newComment });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc Get all comments for a post or project
 * @route GET /api/comments/:id
 * @access Public
 */
exports.getComments = async (req, res) => {
  try {
    const { id } = req.params;

    const comments = await Comment.find({
      $or: [{ post: id }, { project: id }],
    })
      .populate("author", "name email")
      .populate("replies.user", "name email")
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc Update a comment
 * @route PUT /api/comments/:id
 * @access Private
 */
exports.updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    let comment = await Comment.findById(id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.author.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized action" });
    }

    comment.content = content || comment.content;
    await comment.save();

    res.json({ message: "Comment updated", comment });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc Delete a comment
 * @route DELETE /api/comments/:id
 * @access Private
 */
exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findById(id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.author.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized action" });
    }

    await comment.deleteOne();

    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc Like a comment
 * @route POST /api/comments/:id/like
 * @access Private
 */
exports.likeComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findById(id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const alreadyLiked = comment.likes.includes(userId);

    if (alreadyLiked) {
      comment.likes = comment.likes.filter((like) => like.toString() !== userId);
      await comment.save();
      return res.json({ message: "Like removed", comment });
    }

    comment.likes.push(userId);
    await comment.save();

    res.json({ message: "Comment liked", comment });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc Reply to a comment
 * @route POST /api/comments/:id/reply
 * @access Private
 */
exports.replyToComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const userId = req.user.id;

    if (!text) return res.status(400).json({ message: "Reply text is required" });

    const comment = await Comment.findById(id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const reply = { user: userId, text, createdAt: new Date() };
    comment.replies.push(reply);

    await comment.save();

    res.json({ message: "Reply added", comment });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
