const Message = require('../models/Message');
const User = require('../models/User');

exports.sendMessage = async (req, res) => {
  const me = req.user;
  const { content } = req.body;
  const receiverId = req.params.id;

  const receiver = await User.findById(receiverId);
  if (!receiver) return res.status(404).json({ success: false, message: 'User not found' });

  const message = await Message.create({ sender: me._id, receiver: receiverId, content });
  const populated = await message.populate('sender', 'name photos');

  res.status(201).json({ success: true, data: populated });
};

// Cursor-based pagination — mobile-friendly (no offset drift on new messages)
exports.getConversation = async (req, res) => {
  const me = req.user._id;
  const other = req.params.id;
  const { before, limit = 30 } = req.query;

  const query = {
    $or: [
      { sender: me, receiver: other },
      { sender: other, receiver: me },
    ],
  };
  if (before) query._id = { $lt: before };

  const messages = await Message.find(query)
    .sort({ _id: -1 })
    .limit(parseInt(limit))
    .populate('sender', 'name photos');

  await Message.updateMany({ sender: other, receiver: me, read: false }, { read: true });

  res.json({
    success: true,
    count: messages.length,
    nextCursor: messages.length === parseInt(limit) ? messages[messages.length - 1]._id : null,
    data: messages.reverse(),
  });
};

// Inbox: one latest message per conversation
exports.getInbox = async (req, res) => {
  const me = req.user._id;

  const conversations = await Message.aggregate([
    { $match: { $or: [{ sender: me }, { receiver: me }] } },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: {
          $cond: [{ $lt: ['$sender', '$receiver'] },
            { a: '$sender', b: '$receiver' },
            { a: '$receiver', b: '$sender' }],
        },
        lastMessage: { $first: '$$ROOT' },
        unreadCount: {
          $sum: { $cond: [{ $and: [{ $eq: ['$receiver', me] }, { $eq: ['$read', false] }] }, 1, 0] },
        },
      },
    },
    { $sort: { 'lastMessage.createdAt': -1 } },
    { $limit: 50 },
  ]);

  await Message.populate(conversations, { path: 'lastMessage.sender', select: 'name photos isOnline' });
  await Message.populate(conversations, { path: 'lastMessage.receiver', select: 'name photos isOnline' });

  res.json({ success: true, count: conversations.length, data: conversations });
};
