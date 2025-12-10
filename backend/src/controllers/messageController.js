const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const asyncHandler = require('express-async-handler');
const { messagesSent } = require('../utils/metrics');

// @desc    Add new message
// @route   POST /api/messages
// @access  Private
const User = require('../models/User'); // Import User model

// Simple AI Logic
// Simple AI Logic
const generateBotResponse = (text) => {
    const lowerText = text.toLowerCase();

    // Greeting
    if (lowerText.includes('hello') || lowerText.includes('hi') || lowerText.includes('hey')) {
        return "Hello there! I'm the SocioSphere AI. How can I help you today? You can ask me about 'login', 'deleting account', 'posting', and more.";
    }

    // Account Management
    if (lowerText.includes('delete') && (lowerText.includes('account') || lowerText.includes('profile'))) {
        return "To delete your account: \n1. Go to your Profile. \n2. Click 'More' or 'Settings' in the sidebar/menu. \n3. Select 'Delete Account'. \n4. Confirm the action. \n\n⚠️ Warning: This action is irreversible!";
    }
    if (lowerText.includes('login') || lowerText.includes('sign in')) {
        return "To log in, simply visit the login page, enter your email and password. If you don't have an account, click 'Sign up' to register.";
    }
    if (lowerText.includes('register') || lowerText.includes('sign up')) {
        return "To register: \n1. Go to the Sign Up page. \n2. Fill in your Username, Email, and Password. \n3. Click 'Sign Up'.";
    }
    if (lowerText.includes('logout') || lowerText.includes('sign out')) {
        return "To log out: \n1. Click 'More' in the sidebar. \n2. Select 'Log out'.";
    }

    // User Identity
    if (lowerText.includes('who are you') || lowerText.includes('what are you')) {
        return "I am the Classic AI Bot, here to assist you with using SocioSphere.";
    }
    if (lowerText.includes('how are you')) {
        return "I'm just a few lines of code, but I'm functioning perfectly! How can I help you with the app?";
    }

    // App Features
    if (lowerText.includes('post') || lowerText.includes('upload')) {
        return "To create a post: \n1. Click the 'Create' button (Plus icon) in the sidebar. \n2. Select an image or video. \n3. Write a caption and click 'Share'.";
    }
    if (lowerText.includes('reel') || lowerText.includes('video')) {
        return "You can watch short videos in the 'Reels' section. Click the 'Reels' icon in the sidebar to start watching.";
    }

    // Fun / Misc
    if (lowerText.includes('joke')) return "Why did the developer go broke? Because he used up all his cache!";
    if (lowerText.includes('help')) {
        return "Here are some things you can ask me: \n- 'How to delete account?' \n- 'How to logout?' \n- 'How to create a post?' \n- 'Tell me a joke'";
    }

    // Default Fallback
    const randomResponses = [
        "I'm not sure about that. Try asking 'help' to see what I can do.",
        "That's interesting! I'm still learning. Ask me about app features.",
        "Could you rephrase that? I can help with account settings and general navigation.",
        "I am a bot designed to help you with SocioSphere. Ask me 'how to delete account'!"
    ];
    return randomResponses[Math.floor(Math.random() * randomResponses.length)];
};

// @desc    Add new message
// @route   POST /api/messages
// @access  Private
const addMessage = asyncHandler(async (req, res) => {
    const newMessage = new Message(req.body);

    try {
        const savedMessage = await newMessage.save();

        // Update conversation with last message and increment unread for receiver
        const conversation = await Conversation.findById(req.body.conversationId);
        if (conversation) {
            // Find the receiver (the other member)
            const receiverId = conversation.members.find(m => m !== req.body.sender);

            // Update last message
            conversation.lastMessage = {
                text: req.body.text,
                sender: req.body.sender,
                timestamp: new Date()
            };

            // Update unread count for ALL other members (works for both 1-on-1 and Groups)
            conversation.members.forEach(memberId => {
                if (String(memberId) !== String(req.body.sender)) {
                    const currentCount = conversation.unreadCount.get(String(memberId)) || 0;
                    conversation.unreadCount.set(String(memberId), currentCount + 1);
                }
            });

            conversation.deletedBy = [];
            await conversation.save();

            // Socket IO Emission
            if (req.io) {
                conversation.members.forEach(memberId => {
                    req.io.to(String(memberId)).emit("getMessage", savedMessage);
                });
            }

            // *** AI BOT LOGIC ***
            // Check if receiver is the AI Bot
            if (receiverId) {
                const receiverUser = await User.findById(receiverId);
                if (receiverUser && receiverUser.username === 'Classic_AI') {

                    // Delay response slightly to feel natural
                    setTimeout(async () => {
                        try {
                            const botResponseText = generateBotResponse(req.body.text);
                            const botMessage = new Message({
                                conversationId: req.body.conversationId,
                                sender: receiverId, // Bot is sender
                                text: botResponseText
                            });

                            const savedBotMessage = await botMessage.save();

                            // Update conversation again for bot reply
                            const botConv = await Conversation.findById(req.body.conversationId);
                            if (botConv) {
                                botConv.lastMessage = {
                                    text: botResponseText,
                                    sender: receiverId,
                                    timestamp: new Date()
                                };
                                // Increment unread for the USER (who sent the original message)
                                const userCount = botConv.unreadCount.get(req.body.sender) || 0;
                                botConv.unreadCount.set(req.body.sender, userCount + 1);
                                await botConv.save();
                            }

                            // Emit bot message via Socket
                            if (req.io) {
                                conversation.members.forEach(memberId => {
                                    req.io.to(String(memberId)).emit("getMessage", savedBotMessage);
                                });
                            }

                        } catch (botErr) {
                            console.error("Bot Error:", botErr);
                        }
                    }, 1500); // 1.5s delay
                }
            }
            // *** END AI BOT LOGIC ***
        }

        messagesSent.inc({ status: 'success' }); // Increment message counter
        res.status(200).json(savedMessage);
    } catch (err) {
        messagesSent.inc({ status: 'failed' }); // Increment failed counter
        res.status(500).json(err);
    }
});

// @desc    Get messages
// @route   GET /api/messages/:conversationId
// @access  Private
const getMessages = asyncHandler(async (req, res) => {
    try {
        const conversation = await Conversation.findById(req.params.conversationId);
        let filter = { conversationId: req.params.conversationId };

        // If user cleared history, filter messages older than that time
        if (conversation && conversation.clearedHistory && conversation.clearedHistory.get(req.user.id)) {
            const clearedDate = conversation.clearedHistory.get(req.user.id);
            filter.createdAt = { $gt: clearedDate };
        }

        const messages = await Message.find(filter);
        res.status(200).json(messages);
    } catch (err) {
        res.status(500).json(err);
    }
});

// @desc    Mark messages as read (reset unread count)
// @route   PUT /api/messages/read/:conversationId
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
    try {
        const userId = req.user.id;
        const conversation = await Conversation.findById(req.params.conversationId);

        if (conversation) {
            conversation.unreadCount.set(userId, 0);
            await conversation.save();
        }

        res.status(200).json({ message: 'Messages marked as read' });
    } catch (err) {
        res.status(500).json(err);
    }
});

// @desc    Delete a message
// @route   DELETE /api/messages/:messageId
// @access  Private
const deleteMessage = asyncHandler(async (req, res) => {
    try {
        const message = await Message.findById(req.params.messageId);

        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        // Verify the sender is the one deleting
        if (message.sender !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this message' });
        }

        await Message.findByIdAndDelete(req.params.messageId);
        res.status(200).json({ message: 'Message deleted successfully', messageId: req.params.messageId });
    } catch (err) {
        res.status(500).json(err);
    }
});

// @desc    Send file message
// @route   POST /api/messages/file
// @access  Private
const sendFileMessage = asyncHandler(async (req, res) => {
    try {
        const { conversationId, sender, file } = req.body;

        const newMessage = new Message({
            conversationId,
            sender,
            text: file.name || 'File attachment',
            file: {
                url: file.url,
                name: file.name,
                type: file.type,
                size: file.size
            }
        });

        const savedMessage = await newMessage.save();

        // Update conversation with last message
        const conversation = await Conversation.findById(conversationId);
        if (conversation) {
            const receiverId = conversation.members.find(m => m !== sender);

            conversation.lastMessage = {
                text: `📎 ${file.name}`,
                sender: sender,
                timestamp: new Date()
            };

            if (receiverId) {
                const currentCount = conversation.unreadCount.get(receiverId) || 0;
                conversation.unreadCount.set(receiverId, currentCount + 1);
            }

            // Revive conversation if deleted by any user
            conversation.deletedBy = [];

            await conversation.save();

            // Socket IO Emission for Files
            if (req.io) {
                conversation.members.forEach(memberId => {
                    req.io.to(String(memberId)).emit("getMessage", savedMessage);
                });
            }
        }

        messagesSent.inc({ status: 'success' });
        res.status(200).json(savedMessage);
    } catch (err) {
        messagesSent.inc({ status: 'failed' });
        res.status(500).json(err);
    }
});

module.exports = { addMessage, getMessages, deleteMessage, markAsRead, sendFileMessage };
