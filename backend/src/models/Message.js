const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
    conversationId: {
        type: String,
        required: true,
    },
    sender: {
        type: String,
        required: true,
    },
    text: {
        type: String,
        default: '',
    },
    file: {
        url: { type: String, default: '' },
        name: { type: String, default: '' },
        type: { type: String, default: '' }, // image, document, video, etc.
        size: { type: Number, default: 0 }
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 172800 // 48 hours in seconds
    }
}, { timestamps: true });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
