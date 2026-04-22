const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');

const UPLOAD_DIR = path.join(__dirname, '../../uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

exports.uploadPhoto = async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file provided' });

  const user = await User.findById(req.user._id);
  if (user.photos.length >= 6)
    return res.status(400).json({ success: false, message: 'Maximum 6 photos allowed' });

  const filename = `${user._id}-${Date.now()}.webp`;
  const filepath = path.join(UPLOAD_DIR, filename);

  // Resize and convert to WebP — saves mobile data
  await sharp(req.file.buffer)
    .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(filepath);

  const photoUrl = `/uploads/${filename}`;
  user.photos.push(photoUrl);
  await user.save();

  res.status(201).json({ success: true, url: photoUrl, photos: user.photos });
};

exports.deletePhoto = async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ success: false, message: 'Photo URL required' });

  const user = await User.findById(req.user._id);
  if (!user.photos.includes(url))
    return res.status(404).json({ success: false, message: 'Photo not found' });

  user.photos = user.photos.filter((p) => p !== url);
  await user.save();

  const filepath = path.join(__dirname, '../..', url);
  if (fs.existsSync(filepath)) fs.unlinkSync(filepath);

  res.json({ success: true, photos: user.photos });
};
