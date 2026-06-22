const fs = require('fs');
const Resume = require('../models/Resume');
const Candidate = require('../models/Candidate');

// POST /api/resumes/upload  (candidate only)
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const resume = await Resume.create({
      candidate: req.user._id,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      filePath: req.file.path,
      mimeType: req.file.mimetype,
      sizeBytes: req.file.size,
    });

    await Candidate.findByIdAndUpdate(req.user._id, {
      $push: { resumes: resume._id },
    });

    res.status(201).json(resume);
  } catch (err) {
    next(err);
  }
};

// GET /api/resumes/mine  (candidate only)
const getMyResumes = async (req, res, next) => {
  try {
    const resumes = await Resume.find({ candidate: req.user._id }).sort({ createdAt: -1 });
    res.json(resumes);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/resumes/:id  (candidate who owns it only)
const deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) return res.status(404).json({ message: 'Resume not found' });

    if (resume.candidate.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own resumes' });
    }

    if (fs.existsSync(resume.filePath)) {
      fs.unlinkSync(resume.filePath);
    }

    await Candidate.findByIdAndUpdate(req.user._id, { $pull: { resumes: resume._id } });
    await resume.deleteOne();

    res.json({ message: 'Resume deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { uploadResume, getMyResumes, deleteResume };
