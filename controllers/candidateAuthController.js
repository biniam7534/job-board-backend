const Candidate = require('../models/Candidate');
const generateToken = require('../utils/generateToken');

// POST /api/candidates/register
const registerCandidate = async (req, res, next) => {
  try {
    const { name, email, password, phone, skills, experienceYears, location } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email and password are required' });
    }

    const existing = await Candidate.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'A candidate with this email already exists' });
    }

    const candidate = await Candidate.create({
      name,
      email,
      password,
      phone,
      skills,
      experienceYears,
      location,
    });
    const token = generateToken(candidate._id, 'candidate');

    res.status(201).json({ candidate, token });
  } catch (err) {
    next(err);
  }
};

// POST /api/candidates/login
const loginCandidate = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const candidate = await Candidate.findOne({ email }).select('+password');

    if (!candidate || !(await candidate.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!candidate.isActive) {
      return res.status(403).json({ message: 'This account has been deactivated' });
    }

    const token = generateToken(candidate._id, 'candidate');
    res.json({ candidate, token });
  } catch (err) {
    next(err);
  }
};

// GET /api/candidates/me
const getCandidateProfile = async (req, res, next) => {
  try {
    const candidate = await req.user.populate('resumes');
    res.json(candidate);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/candidates/me
const updateCandidateProfile = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'phone', 'skills', 'experienceYears', 'location'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) req.user[field] = req.body[field];
    });
    await req.user.save();
    res.json(req.user);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  registerCandidate,
  loginCandidate,
  getCandidateProfile,
  updateCandidateProfile,
};
