// Multer config for in-memory uploads.
// - memoryStorage so we never touch disk; uploads are piped to Cloudinary.
// - 2 MB cap; admin should compress before uploading anyway.
// - image/* only.

const multer = require('multer');
const { BadRequest } = require('../utils/errors');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    if (!file.mimetype?.startsWith('image/')) {
      cb(new BadRequest('Only image files are allowed', 'INVALID_FILE_TYPE'));
      return;
    }
    cb(null, true);
  },
});

module.exports = upload;
