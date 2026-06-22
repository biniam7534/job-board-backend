const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  applyForJob,
  updateApplicationStatus,
} = require('../controllers/applicationController');

router.post('/', protect('candidate'), applyForJob);
router.patch('/:id/status', protect('employer'), updateApplicationStatus);

module.exports = router;
