const User = require('../models/User');

exports.getDiscovery = async (req, res) => {
  const me = req.user;
  const exclude = [me._id, ...me.likes, ...me.dislikes, ...me.matches];

  const query = {
    _id: { $nin: exclude },
    isActive: true,
    age: { $gte: me.preferences.ageMin, $lte: me.preferences.ageMax },
  };
  if (me.preferences.genderInterest.length > 0) query.gender = { $in: me.preferences.genderInterest };

  const profiles = await User.find(query).select('name age gender bio photos location').limit(20);
  res.json({ success: true, count: profiles.length, data: profiles });
};

exports.likeUser = async (req, res) => {
  const me = await User.findById(req.user._id);
  const target = await User.findById(req.params.id);

  if (!target) return res.status(404).json({ success: false, message: 'User not found' });
  if (me._id.equals(target._id))
    return res.status(400).json({ success: false, message: 'Cannot like yourself' });

  if (!me.likes.includes(target._id)) me.likes.push(target._id);

  const isMatch = target.likes.includes(me._id);
  if (isMatch) {
    me.matches.push(target._id);
    target.matches.push(me._id);
    await target.save();
  }
  await me.save();

  res.json({ success: true, match: isMatch, message: isMatch ? "It's a match!" : 'Like sent' });
};

exports.dislikeUser = async (req, res) => {
  const me = await User.findById(req.user._id);
  const target = await User.findById(req.params.id);
  if (!target) return res.status(404).json({ success: false, message: 'User not found' });

  if (!me.dislikes.includes(target._id)) me.dislikes.push(target._id);
  await me.save();

  res.json({ success: true, message: 'Passed' });
};

exports.getMatches = async (req, res) => {
  const user = await User.findById(req.user._id).populate('matches', 'name age bio photos location');
  res.json({ success: true, count: user.matches.length, data: user.matches });
};
