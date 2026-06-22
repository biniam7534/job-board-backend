const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { registerAdmin, loginAdmin } = require('../controllers/adminAuthController');
const {
  getStats,
  listEmployers,
  listCandidates,
  setEmployerActive,
  setCandidateActive,
  listAllJobs,
} = require('../controllers/adminController');

router.post('/register', registerAdmin);
router.post('/login', loginAdmin);

router.get('/stats', getStats);
router.get('/employers', protect('admin'), listEmployers);
router.get('/candidates', protect('admin'), listCandidates);
router.get('/jobs', protect('admin'), listAllJobs);
router.patch('/employers/:id/deactivate', protect('admin'), setEmployerActive);
router.patch('/candidates/:id/deactivate', protect('admin'), setCandidateActive);

module.exports = router;
