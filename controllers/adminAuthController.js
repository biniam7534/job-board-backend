const Admin = require('../models/Admin');
const generateToken = require('../utils/generateToken');

// POST /api/admin/register
// In production, lock this route down (e.g. one-time setup script, or require an existing admin's token).
const registerAdmin = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email and password are required' });
    }

    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'An admin with this email already exists' });
    }

    const admin = await Admin.create({ name, email, password });
    const token = generateToken(admin._id, 'admin');

    res.status(201).json({ admin, token });
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/login
const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email }).select('+password');

    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(admin._id, 'admin');
    res.json({ admin, token });
  } catch (err) {
    next(err);
  }
};

module.exports = { registerAdmin, loginAdmin };
