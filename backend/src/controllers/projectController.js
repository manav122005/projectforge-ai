const projectService = require('../services/projectService');

const create = async (req, res, next) => {
  try {
    const { name, description, originalIdea } = req.body;
    const result = await projectService.createProject({
      name,
      description,
      originalIdea,
      ownerId: req.user._id
    });

    return res.status(201).json({
      success: true,
      data: result,
      message: 'Project created successfully'
    });
  } catch (err) {
    next(err);
  }
};

const getProjects = async (req, res, next) => {
  try {
    const { search, status, sortBy, order, page, limit } = req.query;
    const result = await projectService.getUserProjects(req.user._id, {
      search,
      status,
      sortBy,
      order,
      page,
      limit
    });

    return res.status(200).json({
      success: true,
      data: result,
      message: 'Projects retrieved successfully'
    });
  } catch (err) {
    next(err);
  }
};

const getProject = async (req, res, next) => {
  try {
    const result = await projectService.getProjectById(req.params.id, req.user._id);
    return res.status(200).json({
      success: true,
      data: result,
      message: 'Project details retrieved successfully'
    });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const result = await projectService.updateProject(req.params.id, req.user._id, req.body);
    return res.status(200).json({
      success: true,
      data: result,
      message: 'Project updated successfully'
    });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const result = await projectService.deleteProject(req.params.id, req.user._id);
    return res.status(200).json({
      success: true,
      data: result,
      message: 'Project deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

const duplicate = async (req, res, next) => {
  try {
    const result = await projectService.duplicateProject(req.params.id, req.user._id);
    return res.status(201).json({
      success: true,
      data: result,
      message: 'Project duplicated successfully'
    });
  } catch (err) {
    next(err);
  }
};

const archive = async (req, res, next) => {
  try {
    const result = await projectService.archiveProject(req.params.id, req.user._id);
    return res.status(200).json({
      success: true,
      data: result,
      message: 'Project archived successfully'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  create,
  getProjects,
  getProject,
  update,
  remove,
  duplicate,
  archive
};
