const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { uploadResume, getMyResumes, deleteResume } = require('../controllers/resumeController');

router.post('/upload', protect('candidate'), upload.single('resume'), uploadResume);
router.get('/mine', protect('candidate'), getMyResumes);
router.delete('/:id', protect('candidate'), deleteResume);

module.exports = router;
