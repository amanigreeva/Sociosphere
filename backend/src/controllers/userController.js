const User = require('../models/User');
const Notification = require('../models/Notification');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const redisClient = require('../config/redis');
const { notificationsCreated } = require('../utils/metrics');

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
const updateUser = asyncHandler(async (req, res) => {
    if (req.user._id.toString() === req.params.id || req.user.isAdmin) {
        if (req.body.password) {
            try {
                const salt = await bcrypt.genSalt(10);
                req.body.password = await bcrypt.hash(req.body.password, salt);
            } catch (err) {
                return res.status(500).json(err);
            }
        }
        try {
            const user = await User.findByIdAndUpdate(req.params.id, {
                $set: req.body,
            }, { new: true });
            await redisClient.del(`user:${req.params.id}`);
            res.status(200).json(user);
        } catch (err) {
            return res.status(500).json(err);
        }
    } else {
        return res.status(403).json('You can update only your account!');
    }
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private
const deleteUser = asyncHandler(async (req, res) => {
    if (req.user._id.toString() === req.params.id || req.user.isAdmin) {
        try {
            const userId = req.params.id;
            const Post = require('../models/Post');
            const Message = require('../models/Message');
            const Conversation = require('../models/Conversation');

            // Delete all posts created by the user
            await Post.deleteMany({ userId: userId });

            // Delete all messages sent by the user
            await Message.deleteMany({ sender: userId });

            // Delete conversations where user is the only member, or remove user from group conversations
            const conversations = await Conversation.find({ members: userId });
            for (const conv of conversations) {
                if (conv.members.length === 2 && !conv.isGroup) {
                    // Delete 1-on-1 conversations
                    await Conversation.findByIdAndDelete(conv._id);
                    // Delete all messages in this conversation
                    await Message.deleteMany({ conversationId: conv._id.toString() });
                } else if (conv.isGroup) {
                    // Remove user from group conversation
                    await Conversation.findByIdAndUpdate(conv._id, {
                        $pull: { members: userId }
                    });
                    // If user was admin, assign new admin or delete group if no members left
                    if (conv.admin && conv.admin.toString() === userId) {
                        const updatedConv = await Conversation.findById(conv._id);
                        if (updatedConv.members.length > 0) {
                            updatedConv.admin = updatedConv.members[0];
                            await updatedConv.save();
                        } else {
                            await Conversation.findByIdAndDelete(conv._id);
                            await Message.deleteMany({ conversationId: conv._id.toString() });
                        }
                    }
                }
            }

            // Delete all notifications sent by or to the user
            await Notification.deleteMany({
                $or: [{ sender: userId }, { recipient: userId }]
            });

            // Remove user from followers/following arrays of other users
            await User.updateMany(
                { followers: userId },
                { $pull: { followers: userId } }
            );
            await User.updateMany(
                { following: userId },
                { $pull: { following: userId } }
            );

            // Clear Redis cache for the user
            await redisClient.del(`user:${userId}`);

            // Finally, delete the user
            await User.findByIdAndDelete(userId);

            res.status(200).json('Account has been deleted');
        } catch (err) {
            console.error('Error deleting user:', err);
            return res.status(500).json(err);
        }
    } else {
        return res.status(403).json('You can delete only your account!');
    }
});

// @desc    Get a user
// @route   GET /api/users/:id
// @access  Public
const getUser = asyncHandler(async (req, res) => {
    try {
        const userId = req.params.id;
        // Check if input is a valid ObjectId
        // Check if input is a valid ObjectId
        if (require('mongoose').Types.ObjectId.isValid(userId)) {
            let cachedUser = null;
            try {
                cachedUser = await redisClient.get(`user:${userId}`);
            } catch (redisErr) {
                console.error("Redis get error:", redisErr);
            }

            if (cachedUser) {
                return res.status(200).json(JSON.parse(cachedUser));
            }

            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json('User not found');
            }
            const { password, updatedAt, ...other } = user._doc;

            try {
                await redisClient.setEx(`user:${userId}`, 3600, JSON.stringify(other));
            } catch (redisErr) {
                console.error("Redis set error:", redisErr);
            }

            res.status(200).json(other);
        } else {
            return res.status(404).json('User not found');
        }

    } catch (err) {
        res.status(500).json(err);
    }
});

// @desc    Get user by username
// @route   GET /api/users?username=...
// @access  Public
const getUserByUsername = asyncHandler(async (req, res) => {
    const username = req.query.username;
    try {
        const user = await User.findOne({ username: username });
        if (!user) {
            return res.status(404).json("User not found");
        }
        const { password, updatedAt, ...other } = user._doc;
        res.status(200).json(other);
    } catch (err) {
        res.status(500).json(err);
    }
});

// @desc    Search users
// @route   GET /api/users/search
// @access  Public
const searchUsers = asyncHandler(async (req, res) => {
    const keyword = req.query.search
        ? {
            username: {
                $regex: req.query.search,
                $options: 'i',
            },
        }
        : {};

    const users = await User.find({ ...keyword }).select('-password');
    res.json(users);
});

// @desc    Follow a user
// @route   PUT /api/users/:id/follow
// @access  Private
const followUser = asyncHandler(async (req, res) => {
    if (req.user._id.toString() !== req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.user._id);
            if (!user.followers.includes(req.user._id)) {
                await user.updateOne({ $push: { followers: req.user._id } });
                await currentUser.updateOne({ $push: { following: req.params.id } });

                const notification = new Notification({
                    recipient: user._id,
                    sender: req.user._id,
                    type: 'follow',
                    text: `${req.user.username} is following you.`,
                });
                await notification.save();
                notificationsCreated.inc({ type: 'follow' }); // Increment notification counter

                res.status(200).json('User has been followed');
            } else {
                res.status(403).json('You already follow this user');
            }
        } catch (err) {
            res.status(500).json(err);
        }
    } else {
        res.status(403).json('You cannot follow yourself');
    }
});

// @desc    Unfollow a user
// @route   PUT /api/users/:id/unfollow
// @access  Private
const unfollowUser = asyncHandler(async (req, res) => {
    if (req.user._id.toString() !== req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.user._id);
            if (user.followers.includes(req.user._id)) {
                await user.updateOne({ $pull: { followers: req.user._id } });
                await currentUser.updateOne({ $pull: { following: req.params.id } });
                res.status(200).json('User has been unfollowed');
            } else {
                res.status(403).json('You dont follow this user');
            }
        } catch (err) {
            res.status(500).json(err);
        }
    } else {
        res.status(403).json('You cannot unfollow yourself');
    }
});

// @desc    Get suggested users
// @route   GET /api/users/suggested
// @access  Private
const getSuggestedUsers = asyncHandler(async (req, res) => {
    try {
        const currentUser = await User.findById(req.user._id);
        const users = await User.aggregate([
            { $match: { _id: { $ne: req.user._id } } }, // Exclude current user
            { $match: { _id: { $nin: currentUser.following } } }, // Exclude already followed users
            { $sample: { size: 5 } } // Randomly select 5
        ]);
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json(err);
    }
});

// @desc    Get user friends (followers and following)
// @route   GET /api/users/friends/:userId
// @access  Public
const getUserFriends = asyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json('User not found');
        }
        const followers = (await Promise.all(
            user.followers.map((friendId) => {
                return User.findById(friendId).select('username profilePicture name');
            })
        )).filter(u => u !== null);
        const following = (await Promise.all(
            user.following.map((friendId) => {
                return User.findById(friendId).select('username profilePicture name');
            })
        )).filter(u => u !== null);

        // Self-healing: Update database if ghost users were found
        let needsUpdate = false;
        if (followers.length !== user.followers.length) {
            user.followers = followers.map(u => u._id);
            needsUpdate = true;
        }
        if (following.length !== user.following.length) {
            user.following = following.map(u => u._id);
            needsUpdate = true;
        }

        if (needsUpdate) {
            await user.save();
        }

        res.status(200).json({ followers, following });
    } catch (err) {
        res.status(500).json(err);
    }
});

// @desc    Remove a follower
// @route   PUT /api/users/:id/removefollower
// @access  Private
const removeFollower = asyncHandler(async (req, res) => {
    // Current user (req.user._id) wants to remove req.params.id from their followers list
    const followerId = req.params.id;
    const currentUserId = req.user._id;

    try {
        const currentUser = await User.findById(currentUserId);
        const follower = await User.findById(followerId);

        if (currentUser.followers.includes(followerId)) {
            await currentUser.updateOne({ $pull: { followers: followerId } });
            await follower.updateOne({ $pull: { following: currentUserId } });
            res.status(200).json('Follower has been removed');
        } else {
            res.status(403).json('This user is not following you');
        }
    } catch (err) {
        res.status(500).json(err);
    }
});

// @desc    Save or Unsave a post
// @route   PUT /api/users/:id/save/:postId
// @access  Private
const savePost = asyncHandler(async (req, res) => {
    if (req.user._id.toString() !== req.params.id) {
        return res.status(403).json('You can only save posts to your own account');
    }

    try {
        const user = await User.findById(req.params.id);
        const postId = req.params.postId;

        if (!user.savedPosts.includes(postId)) {
            await user.updateOne({ $push: { savedPosts: postId } });
            res.status(200).json('Post saved');
        } else {
            await user.updateOne({ $pull: { savedPosts: postId } });
            res.status(200).json('Post unsaved');
        }
    } catch (err) {
        res.status(500).json(err);
    }
});

// @desc    Get saved posts
// @route   GET /api/users/:id/saved
// @access  Private
const getSavedPosts = asyncHandler(async (req, res) => {
    if (req.user._id.toString() !== req.params.id) {
        return res.status(403).json('You can only view your own saved posts');
    }

    try {
        const user = await User.findById(req.params.id).populate({
            path: 'savedPosts',
            populate: { path: 'userId', select: 'username profilePicture' } // Populate author details if needed
        });

        // Return the posts in reverse order (newest saved first) if desired, or as is
        // The populate returns the actual post documents
        const savedPosts = user.savedPosts.reverse();
        res.status(200).json(savedPosts);
    } catch (err) {
        res.status(500).json(err);
    }
});

// @desc    Update user password
// @route   PUT /api/users/:id/password
// @access  Private
const updatePassword = asyncHandler(async (req, res) => {
    if (req.user._id.toString() !== req.params.id) {
        return res.status(403).json('You can only update your own password');
    }

    try {
        const user = await User.findById(req.params.id).select('+password');
        if (!user) return res.status(404).json('User not found');

        // 1. Verify old password
        const validPassword = await bcrypt.compare(req.body.oldPassword, user.password);
        if (!validPassword) {
            return res.status(400).json('Wrong current password');
        }

        // 2. Hash new password
        // 3. Update user
        user.password = req.body.newPassword; // Hook will hash this
        await user.save();

        // Clear cache
        await redisClient.del(`user:${req.params.id}`);

        res.status(200).json('Password updated successfully');
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = {
    updateUser,
    deleteUser,
    getUser,
    getUserByUsername,
    searchUsers,
    followUser,
    unfollowUser,
    getSuggestedUsers,
    getUserFriends,
    removeFollower,
    savePost,
    getSavedPosts,
    updatePassword
};
