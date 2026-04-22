const express = require('express');
const { uploadPhoto, deletePhoto } = require('../controllers/uploadController');
const protect = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.post('/photo', protect, upload.single('photo'), uploadPhoto);
router.delete('/photo', protect, deletePhoto);

module.exports = router;
