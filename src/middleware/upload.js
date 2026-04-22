const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage(); // keep in memory for sharp processing

const fileFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) return cb(null, true);
  cb(new Error('Only JPG, PNG, and WebP images are allowed'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: (parseInt(process.env.MAX_FILE_SIZE_MB) || 5) * 1024 * 1024 },
});

module.exports = upload;
