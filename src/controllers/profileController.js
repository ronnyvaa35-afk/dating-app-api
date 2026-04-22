const User = require('../models/User');

exports.updateProfile = async (req, res) => {
  const allowed = ['name', 'bio', 'location', 'preferences', 'photos'];
  const updates = {};
  allowed.forEach((field) => { if (req.body[field] !== undefined) updates[field] = req.body[field]; });

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
  res.json({ success: true, data: user });
};

exports.getProfile = async (req, res) => {
  const user = await User.findById(req.params.id).select('-likes -dislikes');
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, data: user });
};

exports.deleteAccount = async (req, res) => {
  await User.findByIdAndDelete(req.user._id);
  res.json({ success: true, message: 'Account deleted' });
};
