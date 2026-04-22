const Message = require('../models/Message');
const User = require('../models/User');

exports.sendMessage = async (req, res) => {
  const me = req.user;
  const { content } = req.body;
  const receiverId = req.params.id;

  const isMatch = me.matches.some((id) => id.toString() === receiverId);
  if (!isMatch)
    return res.status(403).json({ success: false, message: 'You can only message your matches' });

  const message = await Message.create({ sender: me._id, receiver: receiverId, content });
  res.status(201).json({ success: true, data: message });
};

exports.getConversation = async (req, res) => {
  const me = req.user._id;
  const other = req.params.id;

  const messages = await Message.find({
    $or: [
      { sender: me, receiver: other },
      { sender: other, receiver: me },
    ],
  }).sort('createdAt');

  await Message.updateMany({ sender: other, receiver: me, read: false }, { read: true });

  res.json({ success: true, count: messages.length, data: messages });
};

exports.getInbox = async (req, res) => {
  const me = req.user._id;
  const messages = await Message.find({ receiver: me, read: false })
    .populate('sender', 'name photos')
    .sort('-createdAt');

  res.json({ success: true, count: messages.length, data: messages });
};
