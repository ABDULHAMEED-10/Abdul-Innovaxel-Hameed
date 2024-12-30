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
  availableSeats: {
    type: [String],
    required: true,
    default: function () {
      return Array.from({ length: this.capacity }, (_, i) => `Seat ${i + 1}`);
    },
  },
});

module.exports = mongoose.model("Cinema", CinemaSchema);
