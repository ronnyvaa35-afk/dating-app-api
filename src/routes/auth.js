const express = require('express');
const { body } = require('express-validator');
const { register, login, getMe } = require('../controllers/authController');
const protect = require('../middleware/auth');

const router = express.Router();

router.post('/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('age').isInt({ min: 18 }).withMessage('Must be at least 18'),
  body('gender').isIn([
    'man', 'woman', 'non-binary', 'genderqueer', 'genderfluid',
    'transgender man', 'transgender woman', 'agender', 'two-spirit',
    'intersex', 'questioning', 'other',
  ]).withMessage('Invalid gender'),
  body('sexualOrientation').isIn([
    'gay', 'lesbian', 'bisexual', 'pansexual', 'queer',
    'asexual', 'demisexual', 'fluid', 'questioning', 'other',
  ]).withMessage('Invalid sexual orientation'),
], register);

router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router;
