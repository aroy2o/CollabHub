const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const fs = require('fs');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cloudinary storage configuration
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'profile_pictures',
    allowed_formats: ['jpg', 'jpeg', 'png']
  }
});

// Multer middleware for handling file uploads
const upload = multer({ storage: storage });

/**
 * Upload profile image to Cloudinary
 * @param {Object} file - The file object from express-fileupload 
 * @returns {Promise<Object>} - Cloudinary upload result
 */
const uploadProfileImage = async (file) => {
  try {
    // Check if the file exists
    if (!file) {
      throw new Error('Missing required parameter - file');
    }

    // If using tempFilePath (from express-fileupload with useTempFiles: true)
    if (file.tempFilePath) {
      const result = await cloudinary.uploader.upload(file.tempFilePath, {
        folder: 'profile-pictures',
        resource_type: 'image',
        width: 150,
        height: 150,
        crop: 'fill',
        gravity: 'face'
      });

      // Clean up the temp file
      fs.unlinkSync(file.tempFilePath);
      return result;
    } 
    // If using the file's data buffer (when useTempFiles is false)
    else {
      const result = await new Promise((resolve, reject) => {
        // Use the data URI approach if tempFilePath is not available
        const b64 = Buffer.from(file.data).toString('base64');
        const dataURI = `data:${file.mimetype};base64,${b64}`;
        
        cloudinary.uploader.upload(
          dataURI,
          {
            folder: 'profile-pictures',
            resource_type: 'image',
            width: 150,
            height: 150,
            crop: 'fill',
            gravity: 'face'
          },
          (err, result) => {
            if (err) return reject(err);
            resolve(result);
          }
        );
      });
      
      return result;
    }
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

/**
 * Delete profile image from Cloudinary
 * @param {string} publicId - Cloudinary public ID of the image
 * @returns {Promise<Object>} - Cloudinary delete result
 */
const deleteProfileImage = async (publicId) => {
  try {
    if (!publicId) {
      throw new Error('Missing required parameter - publicId');
    }
    
    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
};

module.exports = {
  upload,
  uploadProfileImage,
  deleteProfileImage
};
