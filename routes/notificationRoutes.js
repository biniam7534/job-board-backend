const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getMyNotifications,
  markNotificationRead,
} = require('../controllers/notificationController');

router.get('/', protect('employer', 'candidate'), getMyNotifications);
router.patch('/:id/read', protect('employer', 'candidate'), markNotificationRead);

module.exports = router;
