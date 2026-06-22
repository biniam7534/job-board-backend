const Job = require('../models/Job');
const Application = require('../models/Application');

// POST /api/jobs  (employer only)
const createJob = async (req, res, next) => {
  try {
    const {
      title,
      description,
      location,
      jobType,
      skillsRequired,
      salaryMin,
      salaryMax,
      experienceRequired,
    } = req.body;

    if (!title || !description || !location || !jobType) {
      return res.status(400).json({
        message: 'title, description, location and jobType are required',
      });
    }

    const job = await Job.create({
      title,
      description,
      location,
      jobType,
      skillsRequired,
      salaryMin,
      salaryMax,
      experienceRequired,
      employer: req.user._id,
    });

    res.status(201).json(job);
  } catch (err) {
    next(err);
  }
};

// GET /api/jobs  (public search with filters)
// Query params: q, location, jobType, minSalary, maxSalary, skills, page, limit
const searchJobs = async (req, res, next) => {
  try {
    const {
      q,
      location,
      jobType,
      minSalary,
      maxSalary,
      skills,
      page = 1,
      limit = 10,
    } = req.query;

    const filter = { status: 'open' };

    if (q) {
      filter.$text = { $search: q };
    }
    if (location) {
      filter.location = new RegExp(location, 'i');
    }
    if (jobType) {
      filter.jobType = jobType;
    }
    if (skills) {
      const skillList = skills.split(',').map((s) => s.trim());
      filter.skillsRequired = { $in: skillList.map((s) => new RegExp(s, 'i')) };
    }
    if (minSalary || maxSalary) {
      filter.salaryMin = {};
      if (minSalary) filter.salaryMin.$gte = Number(minSalary);
      if (maxSalary) filter.salaryMax = { $lte: Number(maxSalary) };
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .populate('employer', 'companyName logo industry')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Job.countDocuments(filter),
    ]);

    res.json({
      jobs,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/jobs/:id
const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      'employer',
      'companyName logo industry website'
    );
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/jobs/:id  (employer who owns the job only)
const updateJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only edit your own job postings' });
    }

    const allowedFields = [
      'title',
      'description',
      'location',
      'jobType',
      'skillsRequired',
      'salaryMin',
      'salaryMax',
      'experienceRequired',
      'status',
    ];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) job[field] = req.body[field];
    });

    await job.save();
    res.json(job);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/jobs/:id  (employer who owns the job only)
const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own job postings' });
    }

    await Application.deleteMany({ job: job._id });
    await job.deleteOne();

    res.json({ message: 'Job deleted' });
  } catch (err) {
    next(err);
  }
};

// GET /api/jobs/employer/mine  (employer's own postings)
const getMyJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ employer: req.user._id }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createJob,
  searchJobs,
  getJobById,
  updateJob,
  deleteJob,
  getMyJobs,
};
