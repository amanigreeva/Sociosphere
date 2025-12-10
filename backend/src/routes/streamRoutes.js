const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Stream = require('../models/Stream');
const User = require('../models/User');

// @route   POST api/streams
// @desc    Create a new stream
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { title, description, category, type, mediaUrl, liveLink } = req.body;

        const newStream = new Stream({
            user: req.user.id,
            title,
            description,
            category,
            type,
            mediaUrl,
            liveLink,
            isLive: type === 'live'
        });

        const stream = await newStream.save();

        // Determine thumbnail (use profile pic as fallback if no media)
        // In a real app we might generate one from video

        await stream.populate('user', 'username profilePicture');

        res.json(stream);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/streams
// @desc    Get all active streams
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const streams = await Stream.find()
            .sort({ createdAt: -1 })
            .populate('user', 'username profilePicture');
        res.json(streams);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
