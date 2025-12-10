// backend/src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const {
  authUser,
  registerUser,
  logoutUser,
  getCurrentUser,
  updateUserProfile,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/login', authUser);
router.post('/register', registerUser);

// Protected routes
router.route('/me')
  .get(protect, getCurrentUser)     // GET /api/auth/me
  .put(protect, updateUserProfile); // PUT /api/auth/me

router.post('/logout', protect, logoutUser);

module.exports = router;