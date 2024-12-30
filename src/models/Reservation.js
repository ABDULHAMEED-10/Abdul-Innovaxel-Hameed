const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  movie: { type: mongoose.Schema.Types.ObjectId, ref: "Movie", required: true },
  showtime: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Showtime",
    required: true,
  },
  seatNumbers: { type: [String], required: true },
  status: { type: String, enum: ["active", "cancelled"], default: "active" },
});

module.exports = mongoose.model("Reservation", reservationSchema);
