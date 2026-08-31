const Project = require('../models/projectModel');
const ProjectMember = require('../models/projectMemberModel');
const Task = require('../models/taskModel');
const Milestone = require('../models/milestoneModel');
const Risk = require('../models/riskModel');
const User = require('../models/userModel');
const { computeLiveProjectHealth } = require('./healthEngineService');

/**
 * Verify user has authorization to access project
 */
const verifyProjectAccess = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    error.code = 'PROJECT_NOT_FOUND';
    throw error;
  }

  // Check if owner
  if (project.owner.toString() === userId.toString()) {
    return { project, isOwner: true };
  }

  // Check if project member
  const member = await ProjectMember.findOne({ projectId, userId });
  if (member) {
    return { project, isOwner: false, member };
  }

  const error = new Error('Not authorized to access this project');
  error.statusCode = 403;
  error.code = 'FORBIDDEN_PROJECT_ACCESS';
  throw error;
};

/**
 * Create a new project workspace
 */
const createProject = async ({ name, description, originalIdea, ownerId }) => {
  const user = await User.findById(ownerId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    error.code = 'USER_NOT_FOUND';
    throw error;
  }

  const project = await Project.create({
    name,
    description: description || '',
    originalIdea: originalIdea || '',
    owner: ownerId,
    status: 'planning'
  });

  // Automatically add project owner as first team member
  const member = await ProjectMember.create({
    projectId: project._id,
    userId: ownerId,
    displayName: user.name,
    role: 'Project Lead',
    skills: [],
    experienceLevel: 'advanced',
    availabilityHours: 40,
    workload: 0
  });

  // Compute initial health score using the deterministic engine
  const liveHealth = computeLiveProjectHealth({
    project,
    tasks: [],
    milestones: [],
    members: [member],
    risks: []
  });
  project.healthScore = liveHealth.score;
  project.healthBreakdown = liveHealth.breakdown;
  await project.save();

  return {
    project: await project.populate('owner', 'name email role')
  };
};

/**
 * Get projects owned by or assigned to user with filtering, searching, sorting, and pagination
 */
const getUserProjects = async (userId, { search, status, sortBy = 'createdAt', order = 'desc', page = 1, limit = 20 }) => {
  // Find projects where user is owner or team member
  const memberRecords = await ProjectMember.find({ userId }).select('projectId');
  const memberProjectIds = memberRecords.map((m) => m.projectId);

  const query = {
    $or: [
      { owner: userId },
      { _id: { $in: memberProjectIds } }
    ]
  };

  // Filter by status if specified
  if (status && status !== 'all') {
    query.status = status;
  }

  // Text search filter
  if (search && search.trim() !== '') {
    const searchRegex = new RegExp(search.trim(), 'i');
    query.$and = [
      {
        $or: [
          { name: searchRegex },
          { description: searchRegex },
          { originalIdea: searchRegex }
        ]
      }
    ];
  }

  const sortOption = {};
  if (sortBy === 'health') {
    sortOption.healthScore = order === 'asc' ? 1 : -1;
  } else if (sortBy === 'name') {
    sortOption.name = order === 'asc' ? 1 : -1;
  } else if (sortBy === 'oldest') {
    sortOption.createdAt = 1;
  } else {
    sortOption.createdAt = -1; // default newest
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const total = await Project.countDocuments(query);
  const projects = await Project.find(query)
    .populate('owner', 'name email role')
    .sort(sortOption)
    .skip(skip)
    .limit(limitNum);

  // Fetch member counts and related data for each project
  const projectIds = projects.map((p) => p._id);
  const memberCounts = await ProjectMember.aggregate([
    { $match: { projectId: { $in: projectIds } } },
    { $group: { _id: '$projectId', count: { $sum: 1 } } }
  ]);

  const countMap = {};
  memberCounts.forEach((c) => {
    countMap[c._id.toString()] = c.count;
  });

  // Batch-fetch all related data for live health computation
  const [allTasks, allMilestones, allMembers, allRisks] = await Promise.all([
    Task.find({ projectId: { $in: projectIds } }),
    Milestone.find({ projectId: { $in: projectIds } }),
    ProjectMember.find({ projectId: { $in: projectIds } }),
    Risk.find({ projectId: { $in: projectIds } })
  ]);

  // Group by project ID for efficient lookup
  const groupByProject = (items) => {
    const map = {};
    items.forEach((item) => {
      const pid = item.projectId.toString();
      if (!map[pid]) map[pid] = [];
      map[pid].push(item);
    });
    return map;
  };

  const tasksByProject = groupByProject(allTasks);
  const milestonesByProject = groupByProject(allMilestones);
  const membersByProject = groupByProject(allMembers);
  const risksByProject = groupByProject(allRisks);

  // Compute live health for each project and persist
  const bulkOps = [];
  const formattedProjects = projects.map((p) => {
    const pid = p._id.toString();
    const liveHealth = computeLiveProjectHealth({
      project: p,
      tasks: tasksByProject[pid] || [],
      milestones: milestonesByProject[pid] || [],
      members: membersByProject[pid] || [],
      risks: risksByProject[pid] || []
    });

    const obj = p.toObject();
    obj.memberCount = countMap[pid] || 1;
    obj.healthScore = liveHealth.score;
    obj.healthBreakdown = liveHealth.breakdown;

    // Queue a bulk write to persist the computed health back to MongoDB
    bulkOps.push({
      updateOne: {
        filter: { _id: p._id },
        update: {
          $set: {
            healthScore: liveHealth.score,
            healthBreakdown: liveHealth.breakdown
          }
        }
      }
    });

    return obj;
  });

  // Persist computed health scores synchronously
  if (bulkOps.length > 0) {
    try {
      await Project.bulkWrite(bulkOps);
    } catch (_) {}
  }

  return {
    projects: formattedProjects,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum) || 1
    }
  };
};

/**
 * Get single project detail by ID
 */
const getProjectById = async (projectId, userId) => {
  const { project, isOwner } = await verifyProjectAccess(projectId, userId);

  const populatedProject = await Project.findById(projectId).populate('owner', 'name email role');
  const members = await ProjectMember.find({ projectId }).populate('userId', 'name email role');
  const tasks = await Task.find({ projectId });
  const milestones = await Milestone.find({ projectId });
  const risks = await Risk.find({ projectId });

  // Compute live deterministic health score from actual collections
  const liveHealth = computeLiveProjectHealth({
    project: populatedProject,
    tasks,
    milestones,
    members,
    risks
  });

  // Keep project object synchronized
  populatedProject.healthScore = liveHealth.score;
  populatedProject.healthBreakdown = liveHealth.breakdown;

  // Persist the computed health to MongoDB
  try {
    await Project.updateOne(
      { _id: projectId },
      { $set: { healthScore: liveHealth.score, healthBreakdown: liveHealth.breakdown } }
    );
  } catch (_) {}

  return {
    project: populatedProject,
    members,
    isOwner
  };
};

/**
 * Update project details
 */
const updateProject = async (projectId, userId, updateData) => {
  const { project } = await verifyProjectAccess(projectId, userId);

  const allowedFields = ['name', 'description', 'originalIdea', 'status', 'requiredSkills'];
  allowedFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      project[field] = updateData[field];
    }
  });

  await project.save();
  return {
    project: await project.populate('owner', 'name email role')
  };
};

/**
 * Delete project and associated members
 */
const deleteProject = async (projectId, userId) => {
  const { project, isOwner } = await verifyProjectAccess(projectId, userId);

  if (!isOwner) {
    const error = new Error('Only the project owner can delete this project');
    error.statusCode = 403;
    error.code = 'FORBIDDEN_DELETE';
    throw error;
  }

  await ProjectMember.deleteMany({ projectId });
  await Project.findByIdAndDelete(projectId);

  return { id: projectId };
};

/**
 * Duplicate an existing project
 */
const duplicateProject = async (projectId, userId) => {
  const { project } = await verifyProjectAccess(projectId, userId);

  const newProject = await Project.create({
    name: `${project.name} (Copy)`,
    description: project.description,
    originalIdea: project.originalIdea,
    owner: userId,
    status: 'planning',
    healthScore: project.healthScore,
    healthBreakdown: project.healthBreakdown,
    architecture: project.architecture,
    technologyStack: project.technologyStack,
    requiredSkills: project.requiredSkills,
    skillGaps: project.skillGaps,
    recommendedMVP: project.recommendedMVP,
    risks: project.risks
  });

  const user = await User.findById(userId);
  await ProjectMember.create({
    projectId: newProject._id,
    userId,
    displayName: user ? user.name : 'Owner',
    role: 'Project Lead',
    experienceLevel: 'advanced',
    availabilityHours: 40,
    workload: 0
  });

  return {
    project: await newProject.populate('owner', 'name email role')
  };
};

/**
 * Archive a project
 */
const archiveProject = async (projectId, userId) => {
  const { project } = await verifyProjectAccess(projectId, userId);

  project.status = 'archived';
  await project.save();

  return {
    project: await project.populate('owner', 'name email role')
  };
};

module.exports = {
  verifyProjectAccess,
  createProject,
  getUserProjects,
  getProjectById,
  updateProject,
  deleteProject,
  duplicateProject,
  archiveProject
};
