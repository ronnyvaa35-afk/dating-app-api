const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

const signAccess = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '15m' });

const signRefresh = (id) =>
  jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' });

const sendTokens = (user, statusCode, res) => {
  const accessToken = signAccess(user._id);
  const refreshToken = signRefresh(user._id);
  res.status(statusCode).json({
    success: true,
    accessToken,
    refreshToken,
    expiresIn: 900, // 15 min in seconds — mobile can schedule silent refresh
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      gender: user.gender,
      age: user.age,
      photos: user.photos,
    },
  });
};

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { name, email, password, age, gender, sexualOrientation } = req.body;
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });

  const user = await User.create({ name, email, password, age, gender, sexualOrientation });
  sendTokens(user, 201, res);
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: 'Provide email and password' });

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password)))
    return res.status(401).json({ success: false, message: 'Invalid credentials' });

  sendTokens(user, 200, res);
};

// Mobile apps call this when accessToken expires — no re-login needed
exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken)
    return res.status(400).json({ success: false, message: 'Refresh token required' });

  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  const user = await User.findById(decoded.id);
  if (!user) return res.status(401).json({ success: false, message: 'Invalid refresh token' });

  res.json({
    success: true,
    accessToken: signAccess(user._id),
    expiresIn: 900,
  });
};

// Register/update device push token (call on app open)
exports.registerPushToken = async (req, res) => {
  const { token, platform } = req.body;
  if (!token || !['android', 'ios'].includes(platform))
    return res.status(400).json({ success: false, message: 'token and platform (android/ios) required' });

  const user = await User.findById(req.user._id);
  // Replace existing token for same platform to avoid duplicates
  user.pushTokens = user.pushTokens.filter((t) => t.platform !== platform);
  user.pushTokens.push({ token, platform, updatedAt: new Date() });
  await user.save();

  res.json({ success: true, message: 'Push token registered' });
};

exports.getMe = async (req, res) => {
  res.json({ success: true, data: req.user });
};

// Update online status + last seen (call as heartbeat every 60s from mobile)
exports.heartbeat = async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { isOnline: true, lastSeen: new Date() });
  res.json({ success: true });
};

exports.logout = async (req, res) => {
  const { platform } = req.body;
  const user = await User.findById(req.user._id);
  if (platform) user.pushTokens = user.pushTokens.filter((t) => t.platform !== platform);
  user.isOnline = false;
  user.lastSeen = new Date();
  await user.save();
  res.json({ success: true, message: 'Logged out' });
};
