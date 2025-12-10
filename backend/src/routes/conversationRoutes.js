const express = require('express');
const router = express.Router();
const {
    createConversation,
    getConversations,
    getConversationTwoUsers,
    updateConversation,
} = require('../controllers/conversationController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createConversation);
router.get('/:userId', protect, getConversations);
router.get('/find/:firstUserId/:secondUserId', protect, getConversationTwoUsers);
// ...
router.put('/:conversationId', protect, updateConversation);
router.delete('/:conversationId', protect, require('../controllers/conversationController').deleteConversation);

module.exports = router;
