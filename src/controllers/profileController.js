const User = require('../models/User');

exports.updateProfile = async (req, res) => {
  const allowed = [
    'name', 'bio', 'photos', 'height', 'weight', 'ethnicity', 'languages',
    'tribes', 'lookingFor', 'hivStatus', 'lastTestedDate', 'pronouns',
    'sexualOrientation', 'location', 'showDistance', 'discreetMode', 'trustedContacts',
  ];
  const updates = {};
  allowed.forEach((field) => { if (req.body[field] !== undefined) updates[field] = req.body[field]; });

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
  res.json({ success: true, data: user });
};

exports.updateLocation = async (req, res) => {
  const { longitude, latitude, city, state } = req.body;
  if (longitude === undefined || latitude === undefined)
    return res.status(400).json({ success: false, message: 'longitude and latitude required' });

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
        city: city || '',
        state: state || '',
        country: 'India',
      },
      isOnline: true,
      lastSeen: new Date(),
    },
    { new: true }
  );
  res.json({ success: true, data: user.location });
};

exports.getProfile = async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('-taps -blocks -reports -trustedContacts');
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, data: user });
};

exports.reportUser = async (req, res) => {
  const me = await User.findById(req.user._id);
  const target = await User.findById(req.params.id);
  if (!target) return res.status(404).json({ success: false, message: 'User not found' });

  if (!target.reports.includes(me._id)) target.reports.push(me._id);
  // Auto-block on report
  if (!me.blocks.includes(target._id)) me.blocks.push(target._id);
  await Promise.all([target.save(), me.save()]);

  res.json({ success: true, message: 'User reported and blocked' });
};

exports.deleteAccount = async (req, res) => {
  await User.findByIdAndDelete(req.user._id);
  res.json({ success: true, message: 'Account deleted' });
};
