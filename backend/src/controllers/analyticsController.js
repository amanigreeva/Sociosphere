const asyncHandler = require('express-async-handler');
const Message = require('../models/Message');
const Post = require('../models/Post');

// @desc    Get weekly analytics (estimated hours based on activity)
// @route   GET /api/analytics/weekly
// @access  Private
const getWeeklyAnalytics = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    try {
        // 1. Aggregate Messages (Sent by user)
        const messageStats = await Message.aggregate([
            {
                $match: {
                    sender: userId,
                    createdAt: { $gte: sevenDaysAgo, $lte: today }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            }
        ]);

        // 2. Aggregate Posts (Created by user)
        const postStats = await Post.aggregate([
            {
                $match: {
                    user: userId,
                    createdAt: { $gte: sevenDaysAgo, $lte: today }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            }
        ]);

        // 3. Combine and Format Data
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const formattedData = [];

        // Helper to find stats for a specific date string
        const getCount = (arr, dateStr) => {
            const found = arr.find(item => item._id === dateStr);
            return found ? found.count : 0;
        };

        // Loop through last 7 days
        for (let i = 0; i < 7; i++) {
            const d = new Date(sevenDaysAgo);
            d.setDate(d.getDate() + i);
            const dateString = d.toISOString().split('T')[0];
            const dayName = days[d.getDay()];

            const msgCount = getCount(messageStats, dateString);
            const postCount = getCount(postStats, dateString);

            // Heuristic: 1 Message = 5 mins, 1 Post = 30 mins
            // This is "Activity Hours", not just session time.
            const estimatedMinutes = (msgCount * 5) + (postCount * 30);
            const hours = Number((estimatedMinutes / 60).toFixed(1));

            formattedData.push({
                day: dayName,
                date: dateString,
                hours: hours,
                messages: msgCount,
                posts: postCount
            });
        }

        res.status(200).json(formattedData);

    } catch (err) {
        res.status(500).json({ message: "Error generating analytics", error: err.message });
    }
});

module.exports = { getWeeklyAnalytics };
