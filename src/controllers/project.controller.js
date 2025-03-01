const Project = require("../models/project.model");
const User = require("../models/user.model");

/**
 * @desc Create a new project
 * @route POST /api/projects
 * @access Private
 */
exports.createProject = async (req, res) => {
  try {
    const { title, description, tags, technologies, deadline } = req.body;
    const userId = req.user.id;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    const newProject = new Project({
      title,
      description,
      technologies: technologies || [],
      tags: tags || [],
      deadline,
      owner: userId,
      members: [userId], // The creator is automatically a member
    });

    await newProject.save();
    res.status(201).json({ message: "Project created successfully", project: newProject });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc Get all projects
 * @route GET /api/projects
 * @access Public
 */
exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate("owner", "name email")
      .populate("members", "name email")
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc Get a single project by ID
 * @route GET /api/projects/:id
 * @access Public
 */
exports.getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id)
      .populate("owner", "name email")
      .populate("members", "name email");

    if (!project) return res.status(404).json({ message: "Project not found" });

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc Update a project
 * @route PUT /api/projects/:id
 * @access Private (Only owner)
 */
exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, tags, technologies, deadline } = req.body;
    const userId = req.user.id;

    let project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (project.owner.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized action" });
    }

    project.title = title || project.title;
    project.description = description || project.description;
    project.technologies = technologies || project.technologies;
    project.tags = tags || project.tags;
    project.deadline = deadline || project.deadline;

    await project.save();
    res.json({ message: "Project updated successfully", project });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc Delete a project
 * @route DELETE /api/projects/:id
 * @access Private (Only owner)
 */
exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (project.owner.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized action" });
    }

    await project.deleteOne();
    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc Join a project
 * @route POST /api/projects/:id/join
 * @access Private
 */
exports.joinProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    let project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (project.members.includes(userId)) {
      return res.status(400).json({ message: "You are already a member of this project" });
    }

    project.members.push(userId);
    await project.save();

    res.json({ message: "Successfully joined the project", project });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc Leave a project
 * @route POST /api/projects/:id/leave
 * @access Private
 */
exports.leaveProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    let project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (!project.members.includes(userId)) {
      return res.status(400).json({ message: "You are not a member of this project" });
    }

    // Prevent owner from leaving
    if (project.owner.toString() === userId) {
      return res.status(400).json({ message: "Owner cannot leave the project" });
    }

    project.members = project.members.filter((member) => member.toString() !== userId);
    await project.save();

    res.json({ message: "Successfully left the project", project });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc Remove a member from a project
 * @route POST /api/projects/:id/remove/:userId
 * @access Private (Only owner)
 */
exports.removeMember = async (req, res) => {
  try {
    const { id, userId } = req.params;
    const currentUserId = req.user.id;

    let project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (project.owner.toString() !== currentUserId) {
      return res.status(403).json({ message: "Unauthorized action" });
    }

    if (!project.members.includes(userId)) {
      return res.status(400).json({ message: "User is not a member of this project" });
    }

    project.members = project.members.filter((member) => member.toString() !== userId);
    await project.save();

    res.json({ message: "Member removed successfully", project });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
