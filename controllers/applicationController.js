const Application = require('../models/Application');
const Job = require('../models/Job');
const Resume = require('../models/Resume');
const Notification = require('../models/Notification');

// POST /api/applications  (candidate only)
const applyForJob = async (req, res, next) => {
  try {
    const { jobId, resumeId, note } = req.body;

    if (!jobId || !resumeId) {
      return res.status(400).json({ message: 'jobId and resumeId are required' });
    }

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.status !== 'open') {
      return res.status(400).json({ message: 'This job is no longer accepting applications' });
    }

    const resume = await Resume.findOne({ _id: resumeId, candidate: req.user._id });
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found for this candidate' });
    }

    const existing = await Application.findOne({ job: jobId, candidate: req.user._id });
    if (existing) {
      return res.status(409).json({ message: 'You have already applied to this job' });
    }

    const application = await Application.create({
      job: jobId,
      candidate: req.user._id,
      resume: resumeId,
      note,
      statusHistory: [{ status: 'applied' }],
    });

    // Notify the employer of the new application
    await Notification.create({
      recipientType: 'employer',
      recipient: job.employer,
      message: `New application received for "${job.title}"`,
      type: 'new_application',
      relatedApplication: application._id,
    });

    res.status(201).json(application);
  } catch (err) {
    next(err);
  }
};

// GET /api/applications/candidate/me  (candidate's own applications)
const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ candidate: req.user._id })
      .populate({ path: 'job', populate: { path: 'employer', select: 'companyName logo' } })
      .populate('resume', 'originalName')
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (err) {
    next(err);
  }
};

// GET /api/applications/job/:jobId  (employer viewing applicants for their job)
const getApplicationsForJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only view applicants for your own jobs' });
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate('candidate', 'name email phone skills experienceYears')
      .populate('resume', 'originalName filePath')
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/applications/:id/status  (employer only, owner of the related job)
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['applied', 'reviewed', 'shortlisted', 'rejected', 'hired'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `status must be one of: ${validStatuses.join(', ')}` });
    }

    const application = await Application.findById(req.params.id).populate('job');
    if (!application) return res.status(404).json({ message: 'Application not found' });

    if (application.job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only update applications for your own jobs' });
    }

    application.status = status;
    application.statusHistory.push({ status });
    await application.save();

    // Notify the candidate of the status change
    await Notification.create({
      recipientType: 'candidate',
      recipient: application.candidate,
      message: `Your application for "${application.job.title}" is now: ${status}`,
      type: 'status_update',
      relatedApplication: application._id,
    });

    res.json(application);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  applyForJob,
  getMyApplications,
  getApplicationsForJob,
  updateApplicationStatus,
};
