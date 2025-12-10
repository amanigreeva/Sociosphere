const express = require('express');
const router = express.Router();
const { getWeeklyAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/weekly', protect, getWeeklyAnalytics);

module.exports = router;
