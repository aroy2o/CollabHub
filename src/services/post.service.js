const Post = require("../models/post.model");
const cloudinary = require("cloudinary").v2;

/**
 * Uploads a file to Cloudinary.
 * @param {Object} file - The file to upload.
 * @returns {Object} - The uploaded file's URL and other details.
 */
const uploadToCloudinary = async (file) => {
  const result = await cloudinary.uploader.upload(file.tempFilePath, {
    resource_type: "auto"
  });
  return {
    url: result.secure_url,
    filename: result.public_id
  };
};

/**
 * Creates a new post.
 * @param {Object} postData - The post details (title, content, userId, file).
 * @returns {Object} - The created post.
 */
const createPost = async (postData, file) => {
  const { title, content, userId } = postData;

  if (!title || !content) {
    throw new Error("Title and content are required");
  }

  let attachment = null;
  if (file) {
    attachment = await uploadToCloudinary(file);
  }

  const newPost = new Post({
    title,
    content,
    author: userId,
    attachments: attachment ? [attachment] : []
  });

  await newPost.save();
  return newPost;
};

/**
 * Fetches all posts.
 * @returns {Array} - List of all posts.
 */
const getAllPosts = async () => {
  return await Post.find().populate("author", "name email").sort({ createdAt: -1 });
};

/**
 * Fetches a single post by its ID.
 * @param {string} postId - The ID of the post.
 * @returns {Object} - The requested post.
 */
const getPostById = async (postId) => {
  const post = await Post.findById(postId).populate("author", "name email");
  if (!post) {
    throw new Error("Post not found");
  }
  return post;
};

/**
 * Updates a post.
 * @param {string} postId - The ID of the post to update.
 * @param {Object} updateData - The updated post details.
 * @param {string} userId - The ID of the user making the update.
 * @returns {Object} - The updated post.
 */
const updatePost = async (postId, updateData, userId) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new Error("Post not found");
  }

  if (post.author.toString() !== userId) {
    throw new Error("Unauthorized action");
  }

  Object.assign(post, updateData);
  await post.save();
  return post;
};

/**
 * Deletes a post.
 * @param {string} postId - The ID of the post to delete.
 * @param {string} userId - The ID of the user attempting deletion.
 * @returns {Object} - The deleted post.
 */
const deletePost = async (postId, userId) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new Error("Post not found");
  }

  if (post.author.toString() !== userId) {
    throw new Error("Unauthorized action");
  }

  await post.deleteOne();
  return post;
};

module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
};
