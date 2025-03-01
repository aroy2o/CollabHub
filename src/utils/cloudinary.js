const cloudinary = require('cloudinary').v2;

/**
 * Upload an image to Cloudinary
 * @param {Object} file - The file object from express-fileupload
 * @returns {Promise<Object>} - Cloudinary upload result
 */
const uploadProfileImage = async (file) => {
  try {
    // Upload the image to Cloudinary
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: 'community-profile-pictures',
      width: 500, 
      height: 500,
      crop: 'fill',
      quality: 'auto'
    });

    return {
      url: result.secure_url,
      public_id: result.public_id
    };
  } catch (error) {
    throw new Error(`Failed to upload image to Cloudinary: ${error.message}`);
  }
};

/**
 * Delete an image from Cloudinary by public ID
 * @param {string} publicId - Cloudinary image public ID
 * @returns {Promise<Object>} - Cloudinary delete result
 */
const deleteProfileImage = async (publicId) => {
  try {
    if (!publicId) return null;
    
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new Error(`Failed to delete image from Cloudinary: ${error.message}`);
  }
};

module.exports = {
  uploadProfileImage,
  deleteProfileImage
};
