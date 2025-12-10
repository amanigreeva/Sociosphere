const Notification = require('../models/Notification');
const asyncHandler = require('express-async-handler');

// @desc    Get notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
    const notifications = await Notification.find({
        recipient: req.user._id,
        createdAt: { $gt: twelveHoursAgo }
    })
        .populate('sender', 'username profilePicture')
        .sort({ createdAt: -1 });
    res.status(200).json(notifications);
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
    const notification = await Notification.findById(req.params.id);
    if (notification.recipient.toString() === req.user._id.toString()) {
        notification.isRead = true;
        await notification.save();
        res.status(200).json('Notification marked as read');
    } else {
        res.status(403);
        throw new Error('You can only update your notification');
    }
});

module.exports = { getNotifications, markAsRead };
