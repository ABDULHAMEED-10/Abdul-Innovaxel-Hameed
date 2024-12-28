const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  genres: { type: [String], required: true },
  showtimes: { type: [String], required: true },
  imageUrl: { type: String, required: true }, // Store Cloudinary image URL
});

module.exports = mongoose.model("Movie", movieSchema);
