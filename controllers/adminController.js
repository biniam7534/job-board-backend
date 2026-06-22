const Job = require('../models/Job');
const Employer = require('../models/Employer');
const Candidate = require('../models/Candidate');
const Application = require('../models/Application');

// GET /api/admin/stats
const getStats = async (req, res, next) => {
  try {
    const [totalJobs, openJobs, totalEmployers, totalCandidates, totalApplications, statusBreakdown] =
      await Promise.all([
        Job.countDocuments(),
        Job.countDocuments({ status: 'open' }),
        Employer.countDocuments(),
        Candidate.countDocuments(),
        Application.countDocuments(),
        Application.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      ]);

    const statusCounts = statusBreakdown.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    const result = {
      totalJobs,
      openJobs,
      totalEmployers,
      totalCandidates,
      totalApplications,
      applicationsByStatus: statusCounts,
    };

    console.log('Admin Stats Result:', JSON.stringify(result, null, 2));

    res.json(result);
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/employers
const listEmployers = async (req, res, next) => {
  try {
    const employers = await Employer.find().sort({ createdAt: -1 });
    res.json(employers);
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/candidates
const listCandidates = async (req, res, next) => {
  try {
    const candidates = await Candidate.find().sort({ createdAt: -1 });
    res.json(candidates);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/admin/employers/:id/deactivate
const setEmployerActive = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    const employer = await Employer.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    );
    if (!employer) return res.status(404).json({ message: 'Employer not found' });
    res.json(employer);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/admin/candidates/:id/deactivate
const setCandidateActive = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    const candidate = await Candidate.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    );
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
    res.json(candidate);
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/jobs
const listAllJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find().populate('employer', 'companyName').sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getStats,
  listEmployers,
  listCandidates,
  setEmployerActive,
  setCandidateActive,
  listAllJobs,
};
