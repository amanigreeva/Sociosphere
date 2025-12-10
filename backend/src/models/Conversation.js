const mongoose = require('mongoose');

const conversationSchema = mongoose.Schema({
    members: {
        type: Array,
        required: true,
    },
    lastMessage: {
        text: { type: String, default: '' },
        sender: { type: String, default: '' },
        timestamp: { type: Date, default: Date.now }
    },
    unreadCount: {
        type: Map,
        of: Number,
        default: {}
    },
    clearedHistory: {
        type: Map,
        of: Date,
        default: {}
    },
    isGroup: {
        type: Boolean,
        default: false,
    },
    name: {
        type: String,
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    groupImage: {
        type: String,
        default: "",
    },
    deletedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }]
}, { timestamps: true });

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
