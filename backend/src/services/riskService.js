const Risk = require('../models/riskModel');
const Task = require('../models/taskModel');
const ProjectMember = require('../models/projectMemberModel');
const { verifyProjectAccess } = require('./projectService');
const { analyzeProjectRisksWithAI } = require('./ai/riskAgent');
const { generateRecoveryPlan, applyRecoveryAction } = require('./ai/recoveryAgent');
const { monitorProjectHealth } = require('./ai/monitoringAgent');
const { logEvent } = require('./projectEventService');
const { createNotification } = require('./notificationService');

const getRisks = async (projectId, userId, { status, category, severity } = {}) => {
  const { project } = await verifyProjectAccess(projectId, userId);

  const query = { projectId };
  if (status && status !== 'all') query.status = status;
  if (category && category !== 'all') query.category = category;
  if (severity && severity !== 'all') query.severity = severity;

  let risks = await Risk.find(query).sort({ createdAt: -1 });

  // If no risks exist at all in DB, trigger auto-detection once
  if (risks.length === 0 && !status && !category && !severity) {
    const detected = await detectRisks(projectId, userId);
    risks = detected.risks;
  }

  const allRisks = await Risk.find({ projectId });
  const openRisks = allRisks.filter((r) => r.status === 'open');

  const summary = {
    total: allRisks.length,
    open: openRisks.length,
    resolved: allRisks.filter((r) => r.status === 'resolved').length,
    critical: openRisks.filter((r) => r.severity === 'critical').length,
    high: openRisks.filter((r) => r.severity === 'high').length,
    medium: openRisks.filter((r) => r.severity === 'medium').length,
    low: openRisks.filter((r) => r.severity === 'low').length,
  };

  return {
    risks,
    summary
  };
};

const detectRisks = async (projectId, userId) => {
  const { project } = await verifyProjectAccess(projectId, userId);

  const tasks = await Task.find({ projectId });
  const members = await ProjectMember.find({ projectId });

  const { risks: detectedRisks, provider, model } = await analyzeProjectRisksWithAI(project, tasks, members);

  // Sync detected risks into MongoDB: upsert open risks with similar title
  const savedRisks = [];
  for (const r of detectedRisks) {
    let existing = await Risk.findOne({
      projectId,
      title: r.title,
      status: 'open'
    });

    if (!existing) {
      existing = await Risk.create({
        projectId,
        title: r.title,
        description: r.description,
        category: r.category,
        severity: r.severity,
        probability: r.probability,
        impact: r.impact,
        recommendedAction: r.recommendedAction,
        source: r.source || 'deterministic_engine',
        status: 'open'
      });

      // Log event for newly discovered risk
      await logEvent({
        projectId,
        userId,
        type: 'RISK_DETECTED',
        message: `Detected ${r.severity} risk: "${r.title}"`,
        metadata: { category: r.category, severity: r.severity }
      });

      // Create notification for high/critical risks
      if (['critical', 'high'].includes(r.severity) && project.owner) {
        await createNotification({
          owner: project.owner,
          projectId,
          type: 'risk_alert',
          title: `⚠️ ${r.severity.toUpperCase()} Risk Detected`,
          message: `${r.title} — ${r.recommendedAction}`
        });
      }
    }
    savedRisks.push(existing);
  }

  // Recalibrate project health
  await monitorProjectHealth(projectId, userId);

  const openRisks = await Risk.find({ projectId, status: 'open' }).sort({ createdAt: -1 });

  return {
    risks: openRisks,
    detectedCount: detectedRisks.length,
    provider,
    model
  };
};

const createRisk = async (projectId, userId, riskData) => {
  await verifyProjectAccess(projectId, userId);

  const risk = await Risk.create({
    projectId,
    title: riskData.title,
    description: riskData.description || '',
    category: riskData.category || 'technical',
    severity: riskData.severity || 'medium',
    probability: riskData.probability || 'medium',
    impact: riskData.impact || 'medium',
    recommendedAction: riskData.recommendedAction || '',
    source: 'user_defined',
    status: 'open'
  });

  await logEvent({
    projectId,
    userId,
    type: 'RISK_DETECTED',
    message: `Manual risk registered: "${risk.title}"`,
    metadata: { severity: risk.severity, category: risk.category }
  });

  await monitorProjectHealth(projectId, userId);

  return { risk };
};

const resolveRisk = async (projectId, riskId, userId) => {
  await verifyProjectAccess(projectId, userId);

  const risk = await Risk.findOne({ _id: riskId, projectId });
  if (!risk) {
    const error = new Error('Risk not found');
    error.statusCode = 404;
    error.code = 'RISK_NOT_FOUND';
    throw error;
  }

  risk.status = 'resolved';
  risk.resolvedAt = new Date();
  await risk.save();

  await logEvent({
    projectId,
    userId,
    type: 'RISK_RESOLVED',
    message: `Risk resolved: "${risk.title}"`,
    metadata: { riskId: risk._id }
  });

  await monitorProjectHealth(projectId, userId);

  return { risk };
};

const getProjectRecoveryPlan = async (projectId, userId) => {
  const { project } = await verifyProjectAccess(projectId, userId);
  const activeRisks = await Risk.find({ projectId, status: 'open' });

  const result = await generateRecoveryPlan(project, activeRisks);

  await logEvent({
    projectId,
    userId,
    type: 'RECOVERY_RECOMMENDED',
    message: `Generated AI recovery strategy with ${result.recoveryPlan.strategies.length} recommendation(s).`,
    metadata: { strategiesCount: result.recoveryPlan.strategies.length }
  });

  return result;
};

const applyProjectRecoveryPlan = async (projectId, userId, action) => {
  await verifyProjectAccess(projectId, userId);
  const result = await applyRecoveryAction(projectId, userId, action);

  // Trigger monitoring health update
  await monitorProjectHealth(projectId, userId);

  return result;
};

module.exports = {
  getRisks,
  detectRisks,
  createRisk,
  resolveRisk,
  getProjectRecoveryPlan,
  applyProjectRecoveryPlan
};
