const Project = require('../../models/projectModel');
const Task = require('../../models/taskModel');
const Milestone = require('../../models/milestoneModel');
const ProjectMember = require('../../models/projectMemberModel');
const Risk = require('../../models/riskModel');
const { computeLiveProjectHealth } = require('../healthEngineService');
const { logEvent } = require('../projectEventService');
const { createNotification } = require('../notificationService');

/**
 * Monitoring Agent
 * Evaluates current execution state, recalibrates health score, updates healthHistory,
 * creates alerts/notifications if health drops or critical risks are found.
 */
const monitorProjectHealth = async (projectId, userId = null) => {
  const project = await Project.findById(projectId);
  if (!project) return null;

  const tasks = await Task.find({ projectId });
  const milestones = await Milestone.find({ projectId });
  const members = await ProjectMember.find({ projectId });
  const risks = await Risk.find({ projectId });

  // Calculate new deterministic health from live database records
  const newHealth = computeLiveProjectHealth({
    project,
    tasks,
    milestones,
    members,
    risks
  });

  const previousScore = project.healthScore || 70;
  const scoreDiff = newHealth.score - previousScore;

  project.healthScore = newHealth.score;
  project.healthBreakdown = newHealth.breakdown;

  // Append to healthHistory for trend tracking
  if (!project.healthHistory) project.healthHistory = [];
  project.healthHistory.push({
    score: newHealth.score,
    recordedAt: new Date()
  });

  // Limit history to last 50 entries
  if (project.healthHistory.length > 50) {
    project.healthHistory = project.healthHistory.slice(-50);
  }

  await project.save();

  // If health score dropped significantly, log event and notify
  if (scoreDiff <= -10) {
    await logEvent({
      projectId,
      userId,
      type: 'HEALTH_SCORE_CHANGED',
      message: `Project health dropped by ${Math.abs(scoreDiff)} points to ${newHealth.score} (${newHealth.interpretation}).`,
      metadata: { previousScore, newScore: newHealth.score, breakdown: newHealth.breakdown }
    });

    if (project.owner) {
      await createNotification({
        owner: project.owner,
        projectId,
        type: 'health_warning',
        title: 'Project Health Warning',
        message: `Project health has dropped to ${newHealth.score}/100 (${newHealth.interpretation}). Review active risks and recovery recommendations.`
      });
    }
  }

  return {
    health: newHealth,
    previousScore,
    scoreDiff
  };
};

module.exports = {
  monitorProjectHealth
};
