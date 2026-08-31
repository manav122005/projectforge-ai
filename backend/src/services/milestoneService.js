const Milestone = require('../models/milestoneModel');
const Task = require('../models/taskModel');
const { verifyProjectAccess } = require('./projectService');

/**
 * Calculate dynamic completion percentage for a milestone
 */
const calculateMilestoneProgress = async (milestoneId) => {
  const totalTasks = await Task.countDocuments({ milestoneId });
  if (totalTasks === 0) return 0;

  const completedTasks = await Task.countDocuments({ milestoneId, status: 'completed' });
  return Math.round((completedTasks / totalTasks) * 100);
};

const getMilestones = async (projectId, userId) => {
  await verifyProjectAccess(projectId, userId);

  const milestones = await Milestone.find({ projectId }).sort({ createdAt: 1 });

  const milestonesWithProgress = await Promise.all(
    milestones.map(async (m) => {
      const obj = m.toObject();
      obj.completionPercentage = await calculateMilestoneProgress(m._id);
      const totalTasks = await Task.countDocuments({ milestoneId: m._id });
      const completedTasks = await Task.countDocuments({ milestoneId: m._id, status: 'completed' });
      obj.taskStats = { total: totalTasks, completed: completedTasks };
      return obj;
    })
  );

  return { milestones: milestonesWithProgress };
};

const createMilestone = async (projectId, userId, { name, description, startDate, dueDate, status }) => {
  await verifyProjectAccess(projectId, userId);

  if (startDate && dueDate) {
    const start = new Date(startDate).getTime();
    const due = new Date(dueDate).getTime();
    if (!isNaN(start) && !isNaN(due) && due < start) {
      const error = new Error('Milestone due date cannot be earlier than start date');
      error.statusCode = 400;
      error.code = 'INVALID_DATES';
      throw error;
    }
  }

  const milestone = await Milestone.create({
    projectId,
    name,
    description: description || '',
    startDate: startDate || null,
    dueDate: dueDate || null,
    status: status || 'planning'
  });

  const obj = milestone.toObject();
  obj.completionPercentage = 0;
  obj.taskStats = { total: 0, completed: 0 };
  return { milestone: obj };
};

const updateMilestone = async (milestoneId, userId, updateData) => {
  const milestone = await Milestone.findById(milestoneId);
  if (!milestone) {
    const error = new Error('Milestone not found');
    error.statusCode = 404;
    error.code = 'MILESTONE_NOT_FOUND';
    throw error;
  }

  await verifyProjectAccess(milestone.projectId, userId);

  const startDate = updateData.startDate !== undefined ? updateData.startDate : milestone.startDate;
  const dueDate = updateData.dueDate !== undefined ? updateData.dueDate : milestone.dueDate;

  if (startDate && dueDate) {
    const start = new Date(startDate).getTime();
    const due = new Date(dueDate).getTime();
    if (!isNaN(start) && !isNaN(due) && due < start) {
      const error = new Error('Milestone due date cannot be earlier than start date');
      error.statusCode = 400;
      error.code = 'INVALID_DATES';
      throw error;
    }
  }

  const allowed = ['name', 'description', 'startDate', 'dueDate', 'status'];
  allowed.forEach((f) => {
    if (updateData[f] !== undefined) milestone[f] = updateData[f];
  });

  await milestone.save();

  const obj = milestone.toObject();
  obj.completionPercentage = await calculateMilestoneProgress(milestone._id);
  return { milestone: obj };
};

const deleteMilestone = async (milestoneId, userId) => {
  const milestone = await Milestone.findById(milestoneId);
  if (!milestone) {
    const error = new Error('Milestone not found');
    error.statusCode = 404;
    error.code = 'MILESTONE_NOT_FOUND';
    throw error;
  }

  await verifyProjectAccess(milestone.projectId, userId);

  // Safety Check: Reject deletion if milestone contains associated tasks
  const taskCount = await Task.countDocuments({ milestoneId });
  if (taskCount > 0) {
    const error = new Error(`Cannot delete milestone. It contains ${taskCount} associated task(s). Reassign or delete tasks first.`);
    error.statusCode = 400;
    error.code = 'MILESTONE_HAS_TASKS';
    throw error;
  }

  await Milestone.findByIdAndDelete(milestoneId);
  return { id: milestoneId };
};

module.exports = {
  calculateMilestoneProgress,
  getMilestones,
  createMilestone,
  updateMilestone,
  deleteMilestone
};
