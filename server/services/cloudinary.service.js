// Upload a Buffer to Cloudinary (no disk writes) and return { secure_url, public_id }.
// Used by admin product/category controllers; called only behind requireAdmin.

const { getCloudinary } = require('../config/cloudinary');

function uploadBuffer(buffer, folder = 'food-ordering') {
  const cloudinary = getCloudinary();
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        // Reasonable transformations baked in — admin gets a CDN URL that's already optimal.
        transformation: [{ width: 1200, height: 1200, crop: 'limit' }],
      },
      (err, result) => {
        if (err) reject(err);
        else resolve({ url: result.secure_url, publicId: result.public_id });
      },
    );
    stream.end(buffer);
  });
}

async function destroy(publicId) {
  if (!publicId) return;
  const cloudinary = getCloudinary();
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch {
    // Best-effort cleanup; never fail the request because Cloudinary blipped.
  }
}

module.exports = { uploadBuffer, destroy };
