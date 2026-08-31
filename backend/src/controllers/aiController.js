const aiService = require('../services/aiService');

const previewAnalysis = async (req, res, next) => {
  try {
    const { idea, context } = req.body;
    const result = await aiService.analyzeIdeaPreview({ idea, context });
    return res.status(200).json({
      success: true,
      data: result,
      message: 'Idea analysis completed successfully'
    });
  } catch (err) {
    next(err);
  }
};

const analyzeProject = async (req, res, next) => {
  try {
    const result = await aiService.analyzeExistingProject(req.params.id, req.user._id);
    return res.status(200).json({
      success: true,
      data: result,
      message: 'Project analysis completed and persisted'
    });
  } catch (err) {
    next(err);
  }
};

const generateArchitecture = async (req, res, next) => {
  try {
    const result = await aiService.generateArchitectureForProject(req.params.id, req.user._id);
    return res.status(200).json({
      success: true,
      data: result,
      message: 'Architecture generated successfully'
    });
  } catch (err) {
    next(err);
  }
};

const generatePlan = async (req, res, next) => {
  try {
    const result = await aiService.generatePlanForProject(req.params.id, req.user._id);
    return res.status(200).json({
      success: true,
      data: result,
      message: 'Project execution plan generated successfully'
    });
  } catch (err) {
    next(err);
  }
};

const copilotChat = async (req, res, next) => {
  try {
    const { message } = req.body;
    const result = await aiService.askCopilot(req.params.id, req.user._id, message);
    return res.status(200).json({
      success: true,
      data: result,
      message: 'Copilot query answered successfully'
    });
  } catch (err) {
    next(err);
  }
};

const seedDemo = async (req, res, next) => {
  try {
    const result = await aiService.seedDemo(req.user._id);
    return res.status(201).json({
      success: true,
      data: result,
      message: 'Demo project seeded successfully'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  previewAnalysis,
  analyzeProject,
  generateArchitecture,
  generatePlan,
  copilotChat,
  seedDemo
};

