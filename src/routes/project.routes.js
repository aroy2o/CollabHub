const express = require("express");
const { protect } = require("../middleware/auth.middleware");
const {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
} = require("../controllers/project.controller");

const router = express.Router();

/**
 * @route   POST /api/projects
 * @desc    Create a new project
 * @access  Private (Requires authentication)
 */
router.post("/", protect, createProject);

/**
 * @route   GET /api/projects
 * @desc    Get all projects
 * @access  Public
 */
router.get("/", getAllProjects);

/**
 * @route   GET /api/projects/:projectId
 * @desc    Get a single project by ID
 * @access  Public
 */
router.get("/:projectId", getProjectById);

/**
 * @route   PUT /api/projects/:projectId
 * @desc    Update a specific project
 * @access  Private (Only project owner can update)
 */
router.put("/:projectId", protect, updateProject);

/**
 * @route   DELETE /api/projects/:projectId
 * @desc    Delete a project
 * @access  Private (Only project owner or admin can delete)
 */
router.delete("/:projectId", protect, deleteProject);

module.exports = router;
