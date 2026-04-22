const User = require('../models/User');

// Grindr-style grid: nearby users sorted by distance
exports.getNearby = async (req, res) => {
  const me = req.user;
  const { maxDistance = 50000, tribes, lookingFor } = req.query; // distance in meters

  const query = {
    _id: { $nin: [me._id, ...me.blocks] },
    isActive: true,
    location: {
      $nearSphere: {
        $geometry: { type: 'Point', coordinates: me.location.coordinates },
        $maxDistance: parseInt(maxDistance),
      },
    },
  };

  if (tribes) query.tribes = { $in: tribes.split(',') };
  if (lookingFor) query.lookingFor = { $in: lookingFor.split(',') };

  const profiles = await User.find(query)
    .select('name age gender pronouns sexualOrientation tribes lookingFor bio photos height weight ethnicity hivStatus location showDistance isOnline lastSeen')
    .limit(100);

  res.json({ success: true, count: profiles.length, data: profiles });
};

// Send a tap (like)
exports.tapUser = async (req, res) => {
  const me = await User.findById(req.user._id);
  const target = await User.findById(req.params.id);

  if (!target) return res.status(404).json({ success: false, message: 'User not found' });
  if (me._id.equals(target._id))
    return res.status(400).json({ success: false, message: 'Cannot tap yourself' });
  if (me.blocks.includes(target._id))
    return res.status(403).json({ success: false, message: 'User is blocked' });

  if (!me.taps.includes(target._id)) me.taps.push(target._id);
  await me.save();

  res.json({ success: true, message: 'Tap sent' });
};

// Add to favorites
exports.favoriteUser = async (req, res) => {
  const me = await User.findById(req.user._id);
  const target = await User.findById(req.params.id);
  if (!target) return res.status(404).json({ success: false, message: 'User not found' });

  const idx = me.favorites.indexOf(target._id);
  if (idx === -1) {
    me.favorites.push(target._id);
  } else {
    me.favorites.splice(idx, 1);
  }
  await me.save();

  res.json({ success: true, favorited: idx === -1 });
};

// Block a user
exports.blockUser = async (req, res) => {
  const me = await User.findById(req.user._id);
  const target = await User.findById(req.params.id);
  if (!target) return res.status(404).json({ success: false, message: 'User not found' });

  if (!me.blocks.includes(target._id)) me.blocks.push(target._id);
  // Remove from taps/favorites if present
  me.taps = me.taps.filter((id) => !id.equals(target._id));
  me.favorites = me.favorites.filter((id) => !id.equals(target._id));
  await me.save();

  res.json({ success: true, message: 'User blocked' });
};

exports.getFavorites = async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('favorites', 'name age gender pronouns sexualOrientation bio photos isOnline lastSeen');
  res.json({ success: true, count: user.favorites.length, data: user.favorites });
};

exports.getTaps = async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('taps', 'name age gender pronouns bio photos isOnline');
  res.json({ success: true, count: user.taps.length, data: user.taps });
};
