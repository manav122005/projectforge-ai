const teamService = require('../services/teamService');

const getMembers = async (req, res, next) => {
  try {
    const result = await teamService.getMembers(req.params.id, req.user._id);
    return res.status(200).json({
      success: true,
      data: result,
      message: 'Project members retrieved successfully'
    });
  } catch (err) {
    next(err);
  }
};

const addMember = async (req, res, next) => {
  try {
    const result = await teamService.addMember(req.params.id, req.user._id, req.body);
    return res.status(201).json({
      success: true,
      data: result,
      message: 'Team member added successfully'
    });
  } catch (err) {
    next(err);
  }
};

const updateMember = async (req, res, next) => {
  try {
    const result = await teamService.updateMember(req.params.memberId, req.user._id, req.body);
    return res.status(200).json({
      success: true,
      data: result,
      message: 'Team member updated successfully'
    });
  } catch (err) {
    next(err);
  }
};

const removeMember = async (req, res, next) => {
  try {
    const result = await teamService.removeMember(req.params.memberId, req.user._id);
    return res.status(200).json({
      success: true,
      data: result,
      message: 'Team member removed successfully'
    });
  } catch (err) {
    next(err);
  }
};

const getSkillGap = async (req, res, next) => {
  try {
    const result = await teamService.getSkillGapAnalysis(req.params.id, req.user._id);
    return res.status(200).json({
      success: true,
      data: result,
      message: 'Skill gap analysis completed successfully'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMembers,
  addMember,
  updateMember,
  removeMember,
  getSkillGap
};
