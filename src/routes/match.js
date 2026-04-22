const express = require('express');
const {
  getNearby, tapUser, favoriteUser, blockUser, getFavorites, getTaps,
} = require('../controllers/matchController');
const protect = require('../middleware/auth');

const router = express.Router();

router.get('/nearby', protect, getNearby);
router.get('/favorites', protect, getFavorites);
router.get('/taps', protect, getTaps);
router.post('/tap/:id', protect, tapUser);
router.post('/favorite/:id', protect, favoriteUser);
router.post('/block/:id', protect, blockUser);

module.exports = router;
