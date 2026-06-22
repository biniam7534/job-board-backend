const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createJob,
  searchJobs,
  getJobById,
  updateJob,
  deleteJob,
} = require('../controllers/jobController');
const { getApplicationsForJob } = require('../controllers/applicationController');

router.get('/', searchJobs);
router.post('/', protect('employer'), createJob);
router.get('/:id', getJobById);
router.patch('/:id', protect('employer'), updateJob);
router.delete('/:id', protect('employer'), deleteJob);
router.get('/:jobId/applications', protect('employer'), getApplicationsForJob);

module.exports = router;
