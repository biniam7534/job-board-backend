const jwt = require('jsonwebtoken');
const Employer = require('../models/Employer');
const Candidate = require('../models/Candidate');
const Admin = require('../models/Admin');

const protect = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      let token;
      const authHeader = req.headers.authorization;

      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }

      if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token provided' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (allowedRoles.length && !allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ message: 'Not authorized for this action' });
      }

      let user;
      if (decoded.role === 'employer') {
        user = await Employer.findById(decoded.id);
      } else if (decoded.role === 'candidate') {
        user = await Candidate.findById(decoded.id);
      } else if (decoded.role === 'admin') {
        user = await Admin.findById(decoded.id);
      }

      if (!user) {
        return res.status(401).json({ message: 'User belonging to this token no longer exists' });
      }

      req.user = user;
      req.role = decoded.role;
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Not authorized, invalid or expired token' });
    }
  };
};

module.exports = { protect };
