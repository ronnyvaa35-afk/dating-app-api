const express = require('express');
const { updateProfile, getProfile, deleteAccount } = require('../controllers/profileController');
const protect = require('../middleware/auth');

const router = express.Router();

router.get('/:id', protect, getProfile);
router.put('/me', protect, updateProfile);
router.delete('/me', protect, deleteAccount);

module.exports = router;
