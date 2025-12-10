const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');

// Specific GET routes must come before /:id
router.get('/timeline/all', protect, getTimelinePosts);
router.get('/explore/all', getExplorePosts);
router.get('/archived', protect, getArchivedPosts);
router.get('/liked', protect, getLikedPosts);
router.get('/commented', protect, getCommentedPosts);
router.get('/profile/:username', getUserPosts);
router.get('/category/:category', getPostsByCategory);

router.post('/', protect, createPost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);
router.put('/:id/like', protect, likePost);
router.put('/:id/comment', protect, commentPost);
router.put('/:id/archive', protect, toggleArchivePost);

// Generic GET route (must be last among GETs)
router.get('/:id', getPost);

module.exports = router;

