const express = require('express');
const router = express.Router();
const { addMessage, getMessages, deleteMessage, markAsRead, sendFileMessage } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, addMessage);
router.post('/file', protect, sendFileMessage);
router.get('/:conversationId', protect, getMessages);
router.put('/read/:conversationId', protect, markAsRead);
router.delete('/:messageId', protect, deleteMessage);

module.exports = router;
