const mongoose = require("mongoose");

const CinemaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  capacity: { type: Number, required: true },
  availableSeats: {
    type: [String],
    required: true,
    default: function () {
      return Array.from({ length: this.capacity }, (_, i) =>
        (i + 1).toString()
      );
    },
  },
});

module.exports = mongoose.model("Cinema", CinemaSchema);
