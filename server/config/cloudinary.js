// Cloudinary client singleton. Throws AppError 503 if used without credentials.
const cloudinary = require('cloudinary').v2;
const { env } = require('./env');
const { AppError } = require('../utils/errors');

let _configured = false;

function getCloudinary() {
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    throw new AppError(
      'Image uploads are not configured on this server',
      { status: 503, code: 'CLOUDINARY_NOT_CONFIGURED' },
    );
  }
  if (!_configured) {
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    _configured = true;
  }
  return cloudinary;
}

module.exports = { getCloudinary };
