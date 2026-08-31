const notificationService = require('../services/notificationService');

const getNotifications = async (req, res, next) => {
  try {
    const { limit, unreadOnly } = req.query;
    const result = await notificationService.getUserNotifications(req.user._id, {
      limit,
      unreadOnly: unreadOnly === 'true'
    });
    return res.status(200).json({
      success: true,
      data: result,
      message: 'Notifications retrieved successfully'
    });
  } catch (err) {
    next(err);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const result = await notificationService.markAsRead(req.params.id, req.user._id);
    return res.status(200).json({
      success: true,
      data: result,
      message: 'Notification marked as read'
    });
  } catch (err) {
    next(err);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    const result = await notificationService.markAllAsRead(req.user._id);
    return res.status(200).json({
      success: true,
      data: result,
      message: 'All notifications marked as read'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead
};
