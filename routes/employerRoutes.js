const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  registerEmployer,
  loginEmployer,
  getEmployerProfile,
  updateEmployerProfile,
} = require('../controllers/employerAuthController');
const { getMyJobs } = require('../controllers/jobController');

router.post('/register', registerEmployer);
router.post('/login', loginEmployer);
router.get('/me', protect('employer'), getEmployerProfile);
router.patch('/me', protect('employer'), updateEmployerProfile);
router.get('/me/jobs', protect('employer'), getMyJobs);

module.exports = router;
