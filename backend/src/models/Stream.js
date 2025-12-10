const mongoose = require('mongoose');

const streamSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    mediaUrl: {
        type: String, // URL for video or image cover
    },
    thumbnailUrl: {
        type: String
    },
    category: {
        type: String,
        enum: ['GYM', 'FOOD', 'ACT', 'ART', 'MOVIES', 'PRODUCTS', 'TECH', 'GAMING', 'OTHER'],
        default: 'OTHER'
    },
    type: {
        type: String,
        enum: ['live', 'non-live'],
        required: true
    },
    isLive: {
        type: Boolean,
        default: false
    },
    // For 'live' streams that are just links
    liveLink: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 86400 // Expires after 24 hours (86400 seconds)
    }
});

module.exports = mongoose.model('Stream', streamSchema);
