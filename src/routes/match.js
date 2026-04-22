const express = require('express');
const { getDiscovery, likeUser, dislikeUser, getMatches } = require('../controllers/matchController');
const protect = require('../middleware/auth');

const router = express.Router();

router.get('/discover', protect, getDiscovery);
router.get('/matches', protect, getMatches);
router.post('/like/:id', protect, likeUser);
router.post('/dislike/:id', protect, dislikeUser);

module.exports = router;
