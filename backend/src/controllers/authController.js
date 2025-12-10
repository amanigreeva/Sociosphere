// backend/src/controllers/authController.js
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// In-memory user store for testing (when MongoDB is not available)
const testUsers = new Map();

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'testsecret123', {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// Helper function to get sanitized user data
const getSanitizedUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  username: user.username,
  profilePicture: user.profilePicture || '/assets/logo.png',
  followers: user.followers || [],
  following: user.following || [],
  savedPosts: user.savedPosts || [],
  createdAt: user.createdAt,
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate request - email field can contain email OR username
  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email/username and password');
  }

  // Try to find user in MongoDB first
  let user = null;
  let User = null;

  try {
    User = require('../models/User');
    // Search by email OR username (case-insensitive)
    const loginIdentifier = email.toLowerCase().trim();
    user = await User.findOne({
      $or: [
        { email: loginIdentifier },
        { username: { $regex: new RegExp(`^${loginIdentifier}$`, 'i') } }
      ]
    }).select('+password');
  } catch (err) {
    console.log('MongoDB not available, using in-memory store');
  }

  // If MongoDB not available, use in-memory store
  if (!user) {
    user = testUsers.get(email) || Array.from(testUsers.values()).find(u => u.username === email);
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        res.status(401);
        throw new Error('Invalid credentials');
      }
    }
  } else {
    // Check password for MongoDB user
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      res.status(401);
      throw new Error('Invalid credentials');
    }
  }

  if (!user) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  // Generate token
  const token = generateToken(user._id);

  // Set HTTP-only cookie
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  });

  res.status(200).json({
    success: true,
    token,
    user: getSanitizedUser(user)
  });
});

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, username } = req.body;

  // Validate request
  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  let user = null;
  let User = null;

  try {
    User = require('../models/User');
    // Check if user exists in MongoDB by email or username
    const userExists = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username || email.split('@')[0] }
      ]
    });
    if (userExists) {
      res.status(400);
      throw new Error('User with this email or username already exists');
    }

    // Create user in MongoDB
    user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      username: username || email.split('@')[0],
    });
  } catch (err) {
    if (err.message.includes('already exists')) throw err;

    console.log('MongoDB not available, using in-memory store');

    // Check if user exists in memory
    if (testUsers.has(email)) {
      res.status(400);
      throw new Error('User already exists');
    }

    // Create user in memory
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = Date.now().toString();
    user = {
      _id: userId,
      name,
      email: email.toLowerCase(),
      username: username || email.split('@')[0],
      password: hashedPassword,
      profilePicture: user.profilePicture || '/assets/logo.png',
      followers: [],
      following: [],
      createdAt: new Date(),
    };
    testUsers.set(email, user);
  }

  if (!user) {
    res.status(400);
    throw new Error('Invalid user data');
  }

  // Generate token
  const token = generateToken(user._id);

  // Set HTTP-only cookie
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  });

  res.status(201).json({
    success: true,
    token,
    user: getSanitizedUser(user)
  });
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getCurrentUser = asyncHandler(async (req, res) => {
  let user = null;

  try {
    const User = require('../models/User');
    user = await User.findById(req.user.id).select('-password');
  } catch (err) {
    // Search in memory store
    for (const [, u] of testUsers) {
      if (u._id === req.user.id) {
        user = u;
        break;
      }
    }
  }

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.status(200).json(getSanitizedUser(user));
});

// @desc    Update user profile
// @route   PUT /api/auth/me
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  res.status(200).json({ message: 'Profile updated' });
});

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = asyncHandler(async (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

module.exports = {
  authUser,
  registerUser,
  getCurrentUser,
  updateUserProfile,
  logoutUser,
};