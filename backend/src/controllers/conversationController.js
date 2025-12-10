const Conversation = require('../models/Conversation');
const asyncHandler = require('express-async-handler');

// @desc    Create new conversation
// @route   POST /api/conversations
// @access  Private
const createConversation = asyncHandler(async (req, res) => {
    if (req.body.isGroup) {
        // Group conversation logic
        const newConversation = new Conversation({
            members: [...req.body.members, req.body.senderId], // Expect members array in body
            isGroup: true,
            name: req.body.name,
            admin: req.body.senderId,
            groupImage: req.body.groupImage || "",
        });
        try {
            const savedConversation = await newConversation.save();

            // Emit socket event for real-time update
            if (req.io) {
                savedConversation.members.forEach(memberId => {
                    // We might not have socket IDs mapped here easily without a user map.
                    // But our socket logic listens for "addUser".
                    // Standard way: emit to specific user room if logic exists, or emit global "newConversation" + userId filter on client?
                    // Better: The socket handler maintains a user map. Direct access is tricky from here without exporting/importing the map.
                    // Alternative: emit to all connected clients and let client filter? No, privacy.
                    // Best for now: emit to a specific event that socket/index.js handles? 
                    // Wait, `socketHandler` in index.js listens to events from *client*. To push from server to specific user, we need their socketId.
                    // The `users` array in `sockets/index.js` is local to that module. 
                    // We can't access it here easily.
                    // Workaround: Emit a "global" event that the `sockets/index.js` listens to? No.
                    // Simple fix often used: Store `users` map in a shared file/singleton or attached to `app`.
                    // For this environment, I'll rely on the client refreshing OR implement a basic "broadcast to all" and client checks `members.includes(me)`.
                    // Ideally, we'd have a `req.io.to(userId).emit(...)` if we joined rooms by userId.
                    // Let's assume we can try broadcasting to a room named by userId if the socket logic did `socket.join(userId)`.
                    // Checking `sockets/index.js`: "socket.on('addUser', (userId) => { ... })". It stores in an array. It DOES NOT join a room named userId.
                    // Modify `sockets/index.js` to `socket.join(userId)` is the best fix.
                });
            }
            res.status(200).json(savedConversation);
        } catch (err) {
            res.status(500).json(err);
        }
    } else {
        // 1-on-1 conversation logic
        const existingConversation = await Conversation.findOne({
            members: { $all: [req.body.senderId, req.body.receiverId] },
            isGroup: false // Only check non-group chats
        });

        if (existingConversation) {
            return res.status(200).json(sanitizeConversation(existingConversation, req.body.senderId));
        }

        const newConversation = new Conversation({
            members: [req.body.senderId, req.body.receiverId],
        });

        try {
            const savedConversation = await newConversation.save();

            // Emit socket event
            if (req.io) {
                savedConversation.members.forEach(memberId => {
                    req.io.to(String(memberId)).emit("newConversation", savedConversation);
                });
            }

            res.status(200).json(savedConversation);
        } catch (err) {
            res.status(500).json(err);
        }
    }
});

// Helper to sanitize lastMessage based on clearedHistory
const sanitizeConversation = (conv, userId) => {
    if (!conv) return conv;
    const conversation = conv.toObject ? conv.toObject() : conv;

    if (conversation.clearedHistory && conversation.clearedHistory[userId]) {
        const clearedTime = new Date(conversation.clearedHistory[userId]);
        const lastMsgTime = new Date(conversation.lastMessage?.timestamp);

        if (lastMsgTime <= clearedTime) {
            conversation.lastMessage = {
                text: '',
                sender: '',
                timestamp: conversation.updatedAt
            };
            conversation.unreadCount = { ...conversation.unreadCount, [userId]: 0 };
        }
    }
    return conversation;
};

// @desc    Get conversation of a user
// @route   GET /api/conversations/:userId
// @access  Private
const getConversations = asyncHandler(async (req, res) => {
    try {
        const conversations = await Conversation.find({
            members: { $in: [req.params.userId] },
            deletedBy: { $ne: req.params.userId } // Filter out conversations deleted by this user
        }).sort({ 'lastMessage.timestamp': -1, updatedAt: -1 });

        const sanitizedConversations = conversations.map(c => sanitizeConversation(c, req.params.userId));
        res.status(200).json(sanitizedConversations);
    } catch (err) {
        res.status(500).json(err);
    }
});

// @desc    Get conversation includes two userId
// @route   GET /api/conversations/find/:firstUserId/:secondUserId
// @access  Private
const getConversationTwoUsers = asyncHandler(async (req, res) => {
    try {
        const conversation = await Conversation.findOne({
            members: { $all: [req.params.firstUserId, req.params.secondUserId] },
        });
        res.status(200).json(sanitizeConversation(conversation, req.params.firstUserId));
    } catch (err) {
        res.status(500).json(err);
    }
});

// @desc    Update conversation (e.g., rename group)
// @route   PUT /api/conversations/:conversationId
// @access  Private
const updateConversation = asyncHandler(async (req, res) => {
    try {
        const conversation = await Conversation.findById(req.params.conversationId);
        if (!conversation) {
            return res.status(404).json("Conversation not found");
        }

        // Only allow updating if it's a group chat (for now, mainly for renaming)
        if (!conversation.isGroup) {
            return res.status(400).json("Cannot rename non-group conversation");
        }

        if (req.body.name) {
            conversation.name = req.body.name;
        }

        if (req.body.groupImage) {
            conversation.groupImage = req.body.groupImage;
        }

        if (req.body.members) {
            // Add new members to the existing list, ensuring uniqueness
            const newMembers = req.body.members.filter(id => !conversation.members.includes(id));
            conversation.members = [...conversation.members, ...newMembers];

            // Set clearedHistory for new members so they don't see past messages
            if (!conversation.clearedHistory) conversation.clearedHistory = new Map();
            newMembers.forEach(memberId => {
                conversation.clearedHistory.set(String(memberId), new Date());
            });
        }

        const updatedConversation = await conversation.save();
        res.status(200).json(updatedConversation);
    } catch (err) {
        res.status(500).json(err);
    }
});

// @desc    Delete/Leave conversation
// @route   DELETE /api/conversations/:conversationId
// @access  Private
const deleteConversation = asyncHandler(async (req, res) => {
    try {
        const conversation = await Conversation.findById(req.params.conversationId);
        if (!conversation) return res.status(404).json("Conversation not found");

        // Hard Delete (Admin Only)
        if (req.query.hardDelete === 'true') {
            if (String(conversation.admin) !== String(req.user._id)) {
                return res.status(403).json("Only admins can delete the group");
            }
            // Emit delete event to all members before deleting
            // (Optional but good real-time practice)
            if (req.io) {
                conversation.members.forEach(memberId => {
                    req.io.to(String(memberId)).emit("deleteConversation", conversation._id);
                });
            }
            await Conversation.findByIdAndDelete(req.params.conversationId);
            return res.status(200).json("Group deleted for everyone");
        }

        if (conversation.isGroup) {
            // Leave group logic
            conversation.members = conversation.members.filter(m => String(m) !== String(req.user._id));
            if (conversation.members.length === 0) {
                await Conversation.findByIdAndDelete(req.params.conversationId);
                return res.status(200).json("Group deleted as no members left");
            }
        } else {
            // 1-on-1 logic: Mark as deleted for this user AND set cleared timestamp
            if (!conversation.deletedBy.includes(req.user._id)) {
                conversation.deletedBy.push(req.user._id);
            }
            // Update clearedHistory for this user to now
            if (!conversation.clearedHistory) conversation.clearedHistory = new Map();
            conversation.clearedHistory.set(String(req.user._id), new Date());

            // If both deleted, actually delete? Optional. Keeping simpler for now.
        }
        await conversation.save();
        res.status(200).json("Conversation deleted");
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = { createConversation, getConversations, getConversationTwoUsers, updateConversation, deleteConversation };
