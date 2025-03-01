const Project = require("../models/project.model");

/**
 * Creates a new project.
 * @param {Object} projectData - The project details (title, description, ownerId, technologies, collaborators).
 * @returns {Object} - The created project.
 */
const createProject = async (projectData) => {
  const { title, description, ownerId, technologies, collaborators } = projectData;

  if (!title || !description) {
    throw new Error("Title and description are required");
  }

  const newProject = new Project({
    title,
    description,
    owner: ownerId,
    technologies: technologies || [],
    collaborators: collaborators || [],
  });

  await newProject.save();
  return newProject;
};

/**
 * Fetches all projects.
 * @returns {Array} - List of all projects.
 */
const getAllProjects = async () => {
  return await Project.find()
    .populate("owner", "name email")
    .populate("collaborators", "name email")
    .sort({ createdAt: -1 });
};

/**
 * Fetches a single project by its ID.
 * @param {string} projectId - The ID of the project.
 * @returns {Object} - The requested project.
 */
const getProjectById = async (projectId) => {
  const project = await Project.findById(projectId)
    .populate("owner", "name email")
    .populate("collaborators", "name email");
  
  if (!project) {
    throw new Error("Project not found");
  }
  
  return project;
};

/**
 * Updates a project.
 * @param {string} projectId - The ID of the project to update.
 * @param {Object} updateData - The updated project details.
 * @param {string} userId - The ID of the user making the update.
 * @returns {Object} - The updated project.
 */
const updateProject = async (projectId, updateData, userId) => {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new Error("Project not found");
  }

  if (project.owner.toString() !== userId) {
    throw new Error("Unauthorized action");
  }

  Object.assign(project, updateData);
  await project.save();
  return project;
};

/**
 * Deletes a project.
 * @param {string} projectId - The ID of the project to delete.
 * @param {string} userId - The ID of the user attempting deletion.
 * @returns {Object} - The deleted project.
 */
const deleteProject = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new Error("Project not found");
  }

  if (project.owner.toString() !== userId) {
    throw new Error("Unauthorized action");
  }

  await project.deleteOne();
  return project;
};

/**
 * Adds a collaborator to a project.
 * @param {string} projectId - The ID of the project.
 * @param {string} collaboratorId - The ID of the user to be added.
 * @param {string} userId - The ID of the project owner.
 * @returns {Object} - The updated project.
 */
const addCollaborator = async (projectId, collab)
