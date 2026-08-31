const healthService = require('../services/healthService');

const getHealth = async (req, res, next) => {
  try {
    const health = await healthService.getHealthStatus();
    return res.status(200).json({
      success: true,
      data: health,
      message: 'System operational'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getHealth };
