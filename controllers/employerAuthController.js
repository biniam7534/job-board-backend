const Employer = require('../models/Employer');
const generateToken = require('../utils/generateToken');

// POST /api/employers/register
const registerEmployer = async (req, res, next) => {
  try {
    const { companyName, email, password, industry, website } = req.body;

    if (!companyName || !email || !password) {
      return res.status(400).json({ message: 'companyName, email and password are required' });
    }

    const existing = await Employer.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'An employer with this email already exists' });
    }

    const employer = await Employer.create({ companyName, email, password, industry, website });
    const token = generateToken(employer._id, 'employer');

    res.status(201).json({ employer, token });
  } catch (err) {
    next(err);
  }
};

// POST /api/employers/login
const loginEmployer = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const employer = await Employer.findOne({ email }).select('+password');

    if (!employer || !(await employer.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!employer.isActive) {
      return res.status(403).json({ message: 'This account has been deactivated' });
    }

    const token = generateToken(employer._id, 'employer');
    res.json({ employer, token });
  } catch (err) {
    next(err);
  }
};

// GET /api/employers/me
const getEmployerProfile = async (req, res, next) => {
  try {
    res.json(req.user);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/employers/me
const updateEmployerProfile = async (req, res, next) => {
  try {
    const allowedFields = ['companyName', 'industry', 'website', 'logo'];
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
  registerEmployer,
  loginEmployer,
  getEmployerProfile,
  updateEmployerProfile,
};
