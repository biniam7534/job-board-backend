const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  registerCandidate,
  loginCandidate,
  getCandidateProfile,
  updateCandidateProfile,
} = require('../controllers/candidateAuthController');
const { getMyApplications } = require('../controllers/applicationController');

router.post('/register', registerCandidate);
router.post('/login', loginCandidate);
router.get('/me', protect('candidate'), getCandidateProfile);
router.patch('/me', protect('candidate'), updateCandidateProfile);
router.get('/me/applications', protect('candidate'), getMyApplications);

module.exports = router;
