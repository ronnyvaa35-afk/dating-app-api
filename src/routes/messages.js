const express = require('express');
const { sendMessage, getConversation, getInbox } = require('../controllers/messageController');
const protect = require('../middleware/auth');

const router = express.Router();

router.get('/inbox', protect, getInbox);
router.get('/:id', protect, getConversation);
router.post('/:id', protect, sendMessage);

module.exports = router;
