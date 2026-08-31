const { analyzeProjectIdea } = require('./ai/projectAnalystAgent');
const { generateArchitectureGraph } = require('./ai/architectureAgent');
const { generateProjectPlan } = require('./ai/planningAgent');
const { calculateProjectHealth, computeLiveProjectHealth } = require('./healthEngineService');
const { verifyProjectAccess } = require('./projectService');
const Project = require('../models/projectModel');
const AIAnalysis = require('../models/aiAnalysisModel');
const Task = require('../models/taskModel');
const Milestone = require('../models/milestoneModel');
const ProjectMember = require('../models/projectMemberModel');
const Risk = require('../models/riskModel');

/**
 * Preview analysis for a project idea without requiring an existing project
 */
const analyzeIdeaPreview = async ({ idea, context = '' }) => {
  if (!idea || typeof idea !== 'string' || idea.trim() === '') {
    const error = new Error('Project idea is required');
    error.statusCode = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  const { data, provider, model } = await analyzeProjectIdea(idea, context);

  const health = calculateProjectHealth({
    difficulty: data.difficulty,
    majorModulesCount: data.majorModules.length,
    estimatedDurationDays: data.estimatedDurationDays,
    recommendedTeamSize: data.recommendedTeamSize,
    mvpFeaturesCount: data.mvpFeatures.length,
    futureFeaturesCount: data.futureFeatures.length,
    requiredSkills: data.requiredSkills,
    analystSubscores: {
      feasibilitySubscore: data.feasibilitySubscore,
      skillReadinessSubscore: data.skillReadinessSubscore
    }
  });

  return {
    analysis: data,
    health,
    provider,
    model
  };
};

/**
 * Run full project analysis for an existing project and persist intelligence
 */
const analyzeExistingProject = async (projectId, userId) => {
  const { project } = await verifyProjectAccess(projectId, userId);

  const ideaText = project.originalIdea || project.name;
  const contextText = project.description || '';

  const { data, provider, model } = await analyzeProjectIdea(ideaText, contextText);

  // Update project fields with validated AI outputs
  project.technologyStack = data.recommendedTechnologies;
  project.requiredSkills = data.requiredSkills;
  project.recommendedMVP = data.mvpFeatures;
  project.risks = data.risks;

  // Fetch project entities to compute live deterministic health score
  const [tasks, milestones, members, risks] = await Promise.all([
    Task.find({ projectId: project._id }),
    Milestone.find({ projectId: project._id }),
    ProjectMember.find({ projectId: project._id }),
    Risk.find({ projectId: project._id })
  ]);

  const liveHealth = computeLiveProjectHealth({
    project,
    tasks,
    milestones,
    members,
    risks
  });

  project.healthScore = liveHealth.score;
  project.healthBreakdown = liveHealth.breakdown;
  await project.save();

  // Persist record in AIAnalysis collection
  await AIAnalysis.create({
    projectId: project._id,
    provider,
    model,
    analysisType: 'full_blueprint',
    promptVersion: 'v1.0',
    result: data,
    confidence: 0.90
  });

  return {
    project: await project.populate('owner', 'name email role'),
    analysis: data,
    health: liveHealth,
    provider,
    model
  };
};

/**
 * Generate and save system architecture diagram for an existing project
 */
const generateArchitectureForProject = async (projectId, userId) => {
  const { project } = await verifyProjectAccess(projectId, userId);

  const analystContext = {
    summary: project.description || project.name,
    recommendedTechnologies: project.technologyStack || [],
    majorModules: project.recommendedMVP || ['Auth', 'Core Engine', 'Database']
  };

  const { data, provider, model } = await generateArchitectureGraph(analystContext);

  project.architecture = data;

  // Recalculate deterministic health score with updated architecture nodes
  const [tasks, milestones, members, risks] = await Promise.all([
    Task.find({ projectId: project._id }),
    Milestone.find({ projectId: project._id }),
    ProjectMember.find({ projectId: project._id }),
    Risk.find({ projectId: project._id })
  ]);

  const liveHealth = computeLiveProjectHealth({
    project,
    tasks,
    milestones,
    members,
    risks
  });

  project.healthScore = liveHealth.score;
  project.healthBreakdown = liveHealth.breakdown;
  await project.save();

  await AIAnalysis.create({
    projectId: project._id,
    provider,
    model,
    analysisType: 'architecture',
    promptVersion: 'v1.0',
    result: data,
    confidence: 0.90
  });

  return {
    architecture: data,
    health: liveHealth,
    provider,
    model
  };
};

/**
 * Generate and save milestones/tasks plan for an existing project
 */
const generatePlanForProject = async (projectId, userId) => {
  const { project } = await verifyProjectAccess(projectId, userId);

  const analystContext = {
    projectName: project.name,
    summary: project.description || project.name,
    majorModules: project.recommendedMVP || ['Foundation', 'Backend API', 'Frontend'],
    mvpFeatures: project.recommendedMVP || ['Auth', 'Dashboard']
  };

  const { data, provider, model } = await generateProjectPlan(analystContext);

  await AIAnalysis.create({
    projectId: project._id,
    provider,
    model,
    analysisType: 'planning',
    promptVersion: 'v1.0',
    result: data,
    confidence: 0.90
  });

  return {
    plan: data,
    provider,
    model
  };
};

const { askProjectCopilot } = require('./ai/copilotAgent');
const { seedDemoProject } = require('./demoService');

/**
 * Ask Project Copilot with grounded real-time context
 */
const askCopilot = async (projectId, userId, message) => {
  const { project } = await verifyProjectAccess(projectId, userId);
  return await askProjectCopilot(project, userId, message);
};

/**
 * Seed full demo project for current user
 */
const seedDemo = async (userId) => {
  return await seedDemoProject(userId);
};

module.exports = {
  analyzeIdeaPreview,
  analyzeExistingProject,
  generateArchitectureForProject,
  generatePlanForProject,
  askCopilot,
  seedDemo
};

