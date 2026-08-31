const riskService = require('../services/riskService');

const getRisks = async (req, res, next) => {
  try {
    const { status, category, severity } = req.query;
    const result = await riskService.getRisks(req.params.id, req.user._id, {
      status,
      category,
      severity
    });
    return res.status(200).json({
      success: true,
      data: result,
      message: 'Project risks retrieved successfully'
    });
  } catch (err) {
    next(err);
  }
};

const detectRisks = async (req, res, next) => {
  try {
    const result = await riskService.detectRisks(req.params.id, req.user._id);
    return res.status(200).json({
      success: true,
      data: result,
      message: 'Risk detection completed successfully'
    });
  } catch (err) {
    next(err);
  }
};

const createRisk = async (req, res, next) => {
  try {
    const result = await riskService.createRisk(req.params.id, req.user._id, req.body);
    return res.status(201).json({
      success: true,
      data: result,
      message: 'Risk created successfully'
    });
  } catch (err) {
    next(err);
  }
};

const resolveRisk = async (req, res, next) => {
  try {
    const result = await riskService.resolveRisk(req.params.id, req.params.riskId, req.user._id);
    return res.status(200).json({
      success: true,
      data: result,
      message: 'Risk resolved successfully'
    });
  } catch (err) {
    next(err);
  }
};

const getRecoveryPlan = async (req, res, next) => {
  try {
    const result = await riskService.getProjectRecoveryPlan(req.params.id, req.user._id);
    return res.status(200).json({
      success: true,
      data: result,
      message: 'Recovery recommendations generated successfully'
    });
  } catch (err) {
    next(err);
  }
};

const applyRecoveryPlan = async (req, res, next) => {
  try {
    const result = await riskService.applyProjectRecoveryPlan(req.params.id, req.user._id, req.body);
    return res.status(200).json({
      success: true,
      data: result,
      message: 'Recovery action executed successfully'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getRisks,
  detectRisks,
  createRisk,
  resolveRisk,
  getRecoveryPlan,
  applyRecoveryPlan
};
