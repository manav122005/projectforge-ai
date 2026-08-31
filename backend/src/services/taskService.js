const Task = require('../models/taskModel');
const Milestone = require('../models/milestoneModel');
const ProjectMember = require('../models/projectMemberModel');
const { verifyProjectAccess } = require('./projectService');

/**
 * Deterministic Cycle Detection in Task Dependencies using Depth First Search
 */
const hasDependencyCycle = async (taskId, newDependencies = []) => {
  if (!newDependencies || newDependencies.length === 0) return false;

  const visited = new Set();
  const recursionStack = new Set();

  const dfs = async (currentId) => {
    visited.add(currentId.toString());
    recursionStack.add(currentId.toString());

    // Fetch dependencies of currentId
    let deps = [];
    if (currentId.toString() === taskId.toString()) {
      deps = newDependencies;
    } else {
      const taskObj = await Task.findById(currentId).select('dependencies');
      deps = taskObj ? taskObj.dependencies : [];
    }

    for (const depId of deps) {
      const depStr = depId.toString();
      if (!visited.has(depStr)) {
        if (await dfs(depId)) return true;
      } else if (recursionStack.has(depStr)) {
        return true; // Cycle detected!
      }
    }

    recursionStack.delete(currentId.toString());
    return false;
  };

  return await dfs(taskId);
};

const getTasks = async (projectId, userId, { milestoneId, assignedMember, status, priority } = {}) => {
  await verifyProjectAccess(projectId, userId);

  const query = { projectId };
  if (milestoneId) query.milestoneId = milestoneId;
  if (assignedMember) query.assignedMember = assignedMember;
  if (status && status !== 'all') query.status = status;
  if (priority && priority !== 'all') query.priority = priority;

  const tasks = await Task.find(query)
    .populate('assignedMember', 'displayName role skills availabilityHours workload')
    .populate('milestoneId', 'name status dueDate')
    .populate('dependencies', 'title status priority')
    .sort({ createdAt: -1 });

  return { tasks };
};

const createTask = async (projectId, userId, {
  milestoneId,
  title,
  description,
  status,
  priority,
  estimatedHours,
  requiredSkills,
  assignedMember,
  dependencies
}) => {
  await verifyProjectAccess(projectId, userId);

  // 1. Verify Milestone belongs to same Project
  const milestone = await Milestone.findById(milestoneId);
  if (!milestone || milestone.projectId.toString() !== projectId.toString()) {
    const error = new Error('Milestone does not belong to this project');
    error.statusCode = 400;
    error.code = 'INVALID_MILESTONE';
    throw error;
  }

  // 2. Verify Assigned Member belongs to same Project
  if (assignedMember) {
    const member = await ProjectMember.findById(assignedMember);
    if (!member || member.projectId.toString() !== projectId.toString()) {
      const error = new Error('Assigned member does not belong to this project');
      error.statusCode = 400;
      error.code = 'INVALID_ASSIGNMENT';
      throw error;
    }
  }

  // 3. Verify Dependencies belong to same Project & no duplicates
  let cleanDependencies = [];
  if (dependencies && Array.isArray(dependencies) && dependencies.length > 0) {
    const depSet = new Set();
    for (const depId of dependencies) {
      if (depSet.has(depId.toString())) {
        const error = new Error('Duplicate dependency IDs are not allowed');
        error.statusCode = 400;
        error.code = 'DUPLICATE_DEPENDENCY';
        throw error;
      }
      depSet.add(depId.toString());

      const depTask = await Task.findById(depId);
      if (!depTask || depTask.projectId.toString() !== projectId.toString()) {
        const error = new Error('Dependency task must belong to the same project');
        error.statusCode = 400;
        error.code = 'INVALID_DEPENDENCY';
        throw error;
      }
    }
    cleanDependencies = Array.from(depSet);
  }

  const isCompleted = status === 'completed';

  const task = await Task.create({
    projectId,
    milestoneId,
    title,
    description: description || '',
    status: status || 'todo',
    priority: priority || 'medium',
    estimatedHours: estimatedHours || 4,
    requiredSkills: requiredSkills || [],
    assignedMember: assignedMember || null,
    dependencies: cleanDependencies,
    completedAt: isCompleted ? new Date() : null
  });

  return {
    task: await task.populate([
      { path: 'assignedMember', select: 'displayName role skills availabilityHours' },
      { path: 'milestoneId', select: 'name status' }
    ])
  };
};

const updateTask = async (taskId, userId, updateData) => {
  const task = await Task.findById(taskId);
  if (!task) {
    const error = new Error('Task not found');
    error.statusCode = 404;
    error.code = 'TASK_NOT_FOUND';
    throw error;
  }

  await verifyProjectAccess(task.projectId, userId);

  // Milestone validation if updated
  if (updateData.milestoneId && updateData.milestoneId.toString() !== task.milestoneId.toString()) {
    const milestone = await Milestone.findById(updateData.milestoneId);
    if (!milestone || milestone.projectId.toString() !== task.projectId.toString()) {
      const error = new Error('Milestone does not belong to this project');
      error.statusCode = 400;
      error.code = 'INVALID_MILESTONE';
      throw error;
    }
  }

  // Assigned Member validation if updated
  if (updateData.assignedMember !== undefined) {
    if (updateData.assignedMember) {
      const member = await ProjectMember.findById(updateData.assignedMember);
      if (!member || member.projectId.toString() !== task.projectId.toString()) {
        const error = new Error('Assigned member does not belong to this project');
        error.statusCode = 400;
        error.code = 'INVALID_ASSIGNMENT';
        throw error;
      }
    }
  }

  // Dependencies validation & cycle detection
  if (updateData.dependencies !== undefined) {
    const deps = updateData.dependencies || [];
    const depSet = new Set();
    for (const depId of deps) {
      const depStr = depId.toString();

      // Prevent self-dependency
      if (depStr === taskId.toString()) {
        const error = new Error('A task cannot depend on itself');
        error.statusCode = 400;
        error.code = 'SELF_DEPENDENCY';
        throw error;
      }

      // Prevent duplicates
      if (depSet.has(depStr)) {
        const error = new Error('Duplicate dependency IDs are not allowed');
        error.statusCode = 400;
        error.code = 'DUPLICATE_DEPENDENCY';
        throw error;
      }
      depSet.add(depStr);

      const depTask = await Task.findById(depId);
      if (!depTask || depTask.projectId.toString() !== task.projectId.toString()) {
        const error = new Error('Dependency task must belong to the same project');
        error.statusCode = 400;
        error.code = 'INVALID_DEPENDENCY';
        throw error;
      }
    }

    // Cycle Check
    const hasCycle = await hasDependencyCycle(taskId, Array.from(depSet));
    if (hasCycle) {
      const error = new Error('Dependency cycle detected. Circular dependencies are not allowed.');
      error.statusCode = 400;
      error.code = 'DEPENDENCY_CYCLE_DETECTED';
      throw error;
    }

    updateData.dependencies = Array.from(depSet);
  }

  // Handle completion timestamp logic
  if (updateData.status !== undefined) {
    if (updateData.status === 'completed' && task.status !== 'completed') {
      task.completedAt = new Date();
    } else if (updateData.status !== 'completed' && task.status === 'completed') {
      task.completedAt = null;
    }
  }

  const allowed = [
    'milestoneId', 'title', 'description', 'status', 'priority',
    'estimatedHours', 'actualHours', 'requiredSkills', 'assignedMember', 'dependencies'
  ];

  allowed.forEach((field) => {
    if (updateData[field] !== undefined) {
      task[field] = updateData[field];
    }
  });

  await task.save();

  return {
    task: await task.populate([
      { path: 'assignedMember', select: 'displayName role skills availabilityHours' },
      { path: 'milestoneId', select: 'name status' },
      { path: 'dependencies', select: 'title status priority' }
    ])
  };
};

const deleteTask = async (taskId, userId) => {
  const task = await Task.findById(taskId);
  if (!task) {
    const error = new Error('Task not found');
    error.statusCode = 404;
    error.code = 'TASK_NOT_FOUND';
    throw error;
  }

  await verifyProjectAccess(task.projectId, userId);

  // Remove task reference from any other tasks' dependencies
  await Task.updateMany(
    { projectId: task.projectId, dependencies: taskId },
    { $pull: { dependencies: taskId } }
  );

  await Task.findByIdAndDelete(taskId);
  return { id: taskId };
};

const assignTask = async (taskId, userId, assignedMemberId) => {
  return await updateTask(taskId, userId, { assignedMember: assignedMemberId });
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  assignTask
};
