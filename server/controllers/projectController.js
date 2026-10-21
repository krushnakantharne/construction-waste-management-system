const Project = require('../models/Project');

const getProjects = async (req, res) => {
  try {
    const query = req.query.status ? { status: req.query.status } : {};
    const projects = await Project.find(query);
    res.json(projects);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (project) res.json(project);
    else res.status(404).json({ message: 'Project not found' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const createProject = async (req, res) => {
  try {
    const project = new Project({ ...req.body, createdBy: req.user._id });
    const createdProject = await project.save();
    res.status(201).json(createdProject);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (project) res.json(project);
    else res.status(404).json({ message: 'Project not found' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (project) {
      await project.deleteOne();
      res.json({ message: 'Project removed' });
    } else { res.status(404).json({ message: 'Project not found' }); }
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { getProjects, getProjectById, createProject, updateProject, deleteProject };
