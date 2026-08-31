const milestoneService = require('../services/milestoneService');

const getMilestones = async (req, res, next) => {
  try {
    const result = await milestoneService.getMilestones(req.params.id, req.user._id);
    return res.status(200).json({
      success: true,
      data: result,
      message: 'Milestones retrieved successfully'
    });
  } catch (err) {
    next(err);
  }
};

const createMilestone = async (req, res, next) => {
  try {
    const result = await milestoneService.createMilestone(req.params.id, req.user._id, req.body);
    return res.status(201).json({
      success: true,
      data: result,
      message: 'Milestone created successfully'
    });
  } catch (err) {
    next(err);
  }
};

const updateMilestone = async (req, res, next) => {
  try {
    const result = await milestoneService.updateMilestone(req.params.id, req.user._id, req.body);
    return res.status(200).json({
      success: true,
      data: result,
      message: 'Milestone updated successfully'
    });
  } catch (err) {
    next(err);
  }
};

const deleteMilestone = async (req, res, next) => {
  try {
    const result = await milestoneService.deleteMilestone(req.params.id, req.user._id);
    return res.status(200).json({
      success: true,
      data: result,
      message: 'Milestone deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMilestones,
  createMilestone,
  updateMilestone,
  deleteMilestone
};
