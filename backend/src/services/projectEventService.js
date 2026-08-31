const ProjectEvent = require('../models/projectEventModel');
const { verifyProjectAccess } = require('./projectService');

const logEvent = async ({ projectId, userId = null, type, message, metadata = {} }) => {
  try {
    return await ProjectEvent.create({
      projectId,
      userId,
      type,
      message,
      metadata
    });
  } catch (err) {
    console.error(`[ProjectEvent] Failed to log event: ${err.message}`);
    return null;
  }
};

const getProjectEvents = async (projectId, userId, limit = 50) => {
  await verifyProjectAccess(projectId, userId);

  const events = await ProjectEvent.find({ projectId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('userId', 'name email role');

  return { events };
};

module.exports = {
  logEvent,
  getProjectEvents
};
