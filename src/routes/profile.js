const express = require('express');
const { updateProfile, updateLocation, getProfile, reportUser, deleteAccount } = require('../controllers/profileController');
const protect = require('../middleware/auth');

const router = express.Router();

router.get('/:id', protect, getProfile);
router.put('/me', protect, updateProfile);
router.put('/me/location', protect, updateLocation);
router.post('/report/:id', protect, reportUser);
router.delete('/me', protect, deleteAccount);

module.exports = router;
