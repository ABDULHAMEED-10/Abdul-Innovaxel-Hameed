const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    const isVideo = file.mimetype.startsWith("video/");
    return {
      folder: isVideo ? "videos" : "movies", // Specify the folder in Cloudinary
      allowed_formats: isVideo ? ["mp4", "avi", "mkv"] : ["jpg", "png", "jpeg"], // Allowed file formats
    };
  },
});

const upload = multer({ storage });

module.exports = upload;
