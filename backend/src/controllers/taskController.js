const taskService = require('../services/taskService');

const getTasks = async (req, res, next) => {
  try {
    const { milestoneId, assignedMember, status, priority } = req.query;
    const result = await taskService.getTasks(req.params.id, req.user._id, {
      milestoneId,
      assignedMember,
      status,
      priority
    });
    return res.status(200).json({
      success: true,
      data: result,
      message: 'Tasks retrieved successfully'
    });
  } catch (err) {
    next(err);
  }
};

const createTask = async (req, res, next) => {
  try {
    const result = await taskService.createTask(req.params.id, req.user._id, req.body);
    return res.status(201).json({
      success: true,
      data: result,
      message: 'Task created successfully'
    });
  } catch (err) {
    next(err);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const result = await taskService.updateTask(req.params.id, req.user._id, req.body);
    return res.status(200).json({
      success: true,
      data: result,
      message: 'Task updated successfully'
    });
  } catch (err) {
    next(err);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const result = await taskService.deleteTask(req.params.id, req.user._id);
    return res.status(200).json({
      success: true,
      data: result,
      message: 'Task deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

const assignTask = async (req, res, next) => {
  try {
    const { assignedMember } = req.body;
    const result = await taskService.assignTask(req.params.id, req.user._id, assignedMember);
    return res.status(200).json({
      success: true,
      data: result,
      message: 'Task assigned successfully'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  assignTask
};
