// backend/src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in header (x-auth-token format used by frontend)
  if (req.headers['x-auth-token']) {
    token = req.headers['x-auth-token'];
  }
  // Also check for Bearer token format
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'testsecret123');

    // Try to get user from MongoDB, fallback to decoded data
    try {
      const User = require('../models/User');
      req.user = await User.findById(decoded.id).select('-password');
    } catch (err) {
      // MongoDB not available, use decoded data
      req.user = { id: decoded.id, _id: decoded.id };
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(401);
    throw new Error('Not authorized, token failed');
  }
});

const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as an admin');
  }
};

module.exports = { protect, admin };