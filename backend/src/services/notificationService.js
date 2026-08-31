const Notification = require('../models/notificationModel');

const createNotification = async ({ owner, projectId = null, type = 'system_info', title, message }) => {
  try {
    return await Notification.create({
      owner,
      projectId,
      type,
      title,
      message,
      isRead: false
    });
  } catch (err) {
    console.error(`[Notification] Failed to create notification: ${err.message}`);
    return null;
  }
};

const getUserNotifications = async (userId, { limit = 20, unreadOnly = false } = {}) => {
  const query = { owner: userId };
  if (unreadOnly) {
    query.isRead = false;
  }

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .limit(parseInt(limit, 10) || 20)
    .populate('projectId', 'name');

  const unreadCount = await Notification.countDocuments({ owner: userId, isRead: false });

  return {
    notifications,
    unreadCount
  };
};

const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOne({ _id: notificationId, owner: userId });
  if (!notification) {
    const error = new Error('Notification not found');
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  notification.isRead = true;
  await notification.save();

  return { notification };
};

const markAllAsRead = async (userId) => {
  await Notification.updateMany({ owner: userId, isRead: false }, { isRead: true });
  return { success: true };
};

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead
};
