const Notification = require('../models/Notification');

// GET /api/notifications  (any authenticated employer or candidate)
const getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      recipientType: req.role,
      recipient: req.user._id,
    })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(notifications);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/notifications/:id/read
const markNotificationRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipientType: req.role,
      recipient: req.user._id,
    });

    if (!notification) return res.status(404).json({ message: 'Notification not found' });

    notification.isRead = true;
    await notification.save();
    res.json(notification);
  } catch (err) {
    next(err);
  }
};

module.exports = { getMyNotifications, markNotificationRead };
