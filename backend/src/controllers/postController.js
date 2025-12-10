const Post = require('../models/Post');
const User = require('../models/User');
const Notification = require('../models/Notification');
const asyncHandler = require('express-async-handler');
const cloudinary = require('../utils/cloudinary');
const redisClient = require('../config/redis');
const { notificationsCreated } = require('../utils/metrics');

// @desc    Create a post
// @route   POST /api/posts
// @access  Private
const createPost = asyncHandler(async (req, res) => {
    const { text, media, image } = req.body;

    // Accept either media array (from new upload flow) or image (legacy)
    if (!text && (!media || media.length === 0) && !image) {
        res.status(400);
        throw new Error('Post must have text or media');
    }

    let mediaUrls = [];

    // If media array is provided (new flow with pre-uploaded files)
    if (media && Array.isArray(media) && media.length > 0) {
        mediaUrls = media;
    }
    // Legacy: if image is provided (old Cloudinary flow)
    else if (image) {
        const uploadRes = await cloudinary.uploader.upload(image, {
            upload_preset: 'sociosphere',
        });
        mediaUrls = [uploadRes.secure_url];
    }

    const post = await Post.create({
        userId: req.user._id,
        text,
        media: mediaUrls,
        image: req.body.image || null, // Allow explicit cover image
        category: req.body.category || 'OTHER',
    });

    // Invalidate Feed Cache
    try {
        const user = await User.findById(req.user._id);
        const cacheKeys = [`timeline:${req.user._id}`];
        if (user.followers && user.followers.length > 0) {
            user.followers.forEach(id => cacheKeys.push(`timeline:${id}`));
        }
        await redisClient.del(...cacheKeys);
    } catch (err) {
        console.error('Redis Invalidation Error:', err);
    }

    res.status(201).json(post);
});

// @desc    Update a post
// @route   PUT /api/posts/:id
// @access  Private
const updatePost = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id);
    // Fixed: post.userId (schema) vs req.user._id (middleware)
    if (post.userId.toString() === req.user._id.toString()) {
        await post.updateOne({ $set: req.body });
        res.status(200).json('The post has been updated');
    } else {
        res.status(403);
        throw new Error('You can only update your post');
    }
});

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (!post) {
        res.status(404);
        throw new Error('Post not found');
    }
    // Fixed: post.userId vs req.user._id
    if (post.userId.toString() === req.user._id.toString()) {
        await post.deleteOne();
        res.status(200).json('The post has been deleted');
    } else {
        res.status(403);
        throw new Error('You can only delete your post');
    }
});

// @desc    Like/Dislike a post
// @route   PUT /api/posts/:id/like
// @access  Private
const likePost = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id);
    // Fixed: req.user._id
    if (!post.likes.includes(req.user._id)) {
        await post.updateOne({ $push: { likes: req.user._id } });

        // Fixed: post.userId vs req.user._id
        if (post.userId.toString() !== req.user._id.toString()) {
            const notification = new Notification({
                recipient: post.userId,
                sender: req.user._id,
                type: 'like',
                postId: post._id,
                text: `${req.user.username} liked your post.`, // Fixed: req.user.username
            });
            await notification.save();
            notificationsCreated.inc({ type: 'like' });
        }

        res.status(200).json('The post has been liked');
    } else {
        await post.updateOne({ $pull: { likes: req.user._id } });
        res.status(200).json('The post has been disliked');
    }
});

// @desc    Comment on a post
// @route   PUT /api/posts/:id/comment
// @access  Private
const commentPost = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id);
    const comment = {
        userId: req.user._id, // Fixed: match schema (userId in comment subdoc)
        text: req.body.text,
        username: req.user.username, // Fixed: match schema (username)
        avatar: req.user.profilePicture, // Fixed: match schema (avatar)
    };
    await post.updateOne({ $push: { comments: comment } });

    // Fixed: post.userId vs req.user._id
    if (post.userId.toString() !== req.user._id.toString()) {
        const notification = new Notification({
            recipient: post.userId,
            sender: req.user._id,
            type: 'comment',
            postId: post._id,
            text: `${req.user.username} commented on your post.`,
        });
        await notification.save();
        notificationsCreated.inc({ type: 'comment' });
    }

    res.status(200).json(comment);
});

// @desc    Get a post
// @route   GET /api/posts/:id
// @access  Public
const getPost = asyncHandler(async (req, res) => {
    // Determine if we need to populate. Since schema stores userId as String,
    // we use lean() and manual lookup to ensure we return a populated object.
    const post = await Post.findById(req.params.id).lean();

    if (!post) {
        res.status(404);
        throw new Error('Post not found');
    }

    // Populate user details for the post author
    const user = await User.findById(post.userId).select('username profilePicture');
    if (user) {
        post.userId = user;
    }

    res.status(200).json(post);
});

// @desc    Get timeline posts
// @route   GET /api/posts/timeline/all
// @access  Private
const getTimelinePosts = asyncHandler(async (req, res) => {
    const cacheKey = `timeline:${req.user._id}`;

    try {
        const cachedPosts = await redisClient.get(cacheKey);
        if (cachedPosts) {
            return res.status(200).json(JSON.parse(cachedPosts));
        }
    } catch (err) {
        console.error('Redis Get Error:', err);
    }

    const currentUser = await User.findById(req.user._id);
    // Fixed: userId queries
    const userPosts = await Post.find({ userId: currentUser._id });
    const friendPosts = await Promise.all(
        currentUser.following.map((friendId) => {
            return Post.find({ userId: friendId });
        })
    );
    const timelinePosts = userPosts.concat(...friendPosts).sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    try {
        await redisClient.setex(cacheKey, 60, JSON.stringify(timelinePosts));
    } catch (err) {
        console.error('Redis SetEx Error:', err);
    }

    res.status(200).json(timelinePosts);
});

// @desc    Get explore posts
// @route   GET /api/posts/explore/all
// @access  Public
const getExplorePosts = asyncHandler(async (req, res) => {
    const posts = await Post.find({}).sort({ createdAt: -1 }).limit(20);
    res.status(200).json(posts);
});

// @desc    Get posts by category
// @route   GET /api/posts/category/:category
// @access  Public
const getPostsByCategory = asyncHandler(async (req, res) => {
    try {
        const category = req.params.category.toUpperCase();
        const query = category === 'ALL' ? {} : { category };

        const posts = await Post.find(query)
            .sort({ createdAt: -1 })
            .limit(50);

        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json(err);
    }
});

// @desc    Toggle archive status of a post
// @route   PUT /api/posts/:id/archive
// @access  Private
const toggleArchivePost = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (!post) {
        res.status(404);
        throw new Error('Post not found');
    }
    // Only owner can archive
    if (post.userId.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('You can only archive your own posts');
    }

    post.isArchived = !post.isArchived;
    await post.save();
    res.status(200).json(post.isArchived ? 'Post archived' : 'Post unarchived');
});

// @desc    Get user's archived posts
// @route   GET /api/posts/archived
// @access  Private
const getArchivedPosts = asyncHandler(async (req, res) => {
    const posts = await Post.find({ userId: req.user._id, isArchived: true }).sort({ createdAt: -1 });
    res.status(200).json(posts);
});

// @desc    Get posts liked by user
// @route   GET /api/posts/liked
// @access  Private
const getLikedPosts = asyncHandler(async (req, res) => {
    // Find posts where likes array contains user ID
    // We also likely want to hide archived posts from others here, or archived by self?
    // Generally liked posts list usually shows public posts.
    const posts = await Post.find({
        likes: req.user._id,
        isArchived: false // Don't show archived posts of others (if any logic allows it)
    })
        .populate('userId', 'username profilePicture') // Populate author
        .sort({ createdAt: -1 });
    res.status(200).json(posts);
});

// @desc    Get posts commented by user
// @route   GET /api/posts/commented
// @access  Private
const getCommentedPosts = asyncHandler(async (req, res) => {
    // Find posts where comments array has an object with userId == req.user._id
    const posts = await Post.find({
        'comments.userId': req.user._id,
        isArchived: false
    })
        .populate('userId', 'username profilePicture')
        .sort({ createdAt: -1 });
    res.status(200).json(posts);
});

// @desc    Get user's posts by username (Filtered: No Archive)
// @route   GET /api/posts/profile/:username
// @access  Public
const getUserPosts = asyncHandler(async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }
        // Exclude archived posts
        const posts = await Post.find({ userId: user._id, isArchived: false }).sort({ createdAt: -1 });
        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = {
    createPost,
    updatePost,
    deletePost,
    likePost,
    commentPost,
    getPost,
    getTimelinePosts,
    getExplorePosts,
    getUserPosts,
    getPostsByCategory,
    toggleArchivePost,
    getArchivedPosts,
    getLikedPosts,
    getCommentedPosts
};

