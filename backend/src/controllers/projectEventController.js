const projectEventService = require('../services/projectEventService');

const getEvents = async (req, res, next) => {
  try {
    const { limit } = req.query;
    const result = await projectEventService.getProjectEvents(req.params.id, req.user._id, parseInt(limit, 10) || 50);
    return res.status(200).json({
      success: true,
      data: result,
      message: 'Project events retrieved successfully'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getEvents
};
