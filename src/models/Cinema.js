const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CinemaSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  capacity: {
    type: Number,
    required: true,
  },
  remainingSeats: { type: Number, required: true },
});

module.exports = mongoose.model("Cinema", CinemaSchema);
