const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getUserByUsername);
router.get('/suggested', protect, getSuggestedUsers);
router.get('/search', searchUsers);
router.put('/:id/password', protect, updatePassword);
router.put('/:id', protect, updateUser);
router.delete('/:id', protect, deleteUser);
router.get('/:id', getUser);
router.put('/:id/follow', protect, followUser);
router.put('/:id/unfollow', protect, unfollowUser);
router.put('/:id/removefollower', protect, removeFollower);
router.get('/friends/:userId', getUserFriends);
router.put('/:id/save/:postId', protect, savePost);
router.get('/:id/saved', protect, getSavedPosts);

module.exports = router;
