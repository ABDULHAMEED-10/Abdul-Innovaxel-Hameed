const mongoose = require("mongoose");

const ReservationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  movie: { type: mongoose.Schema.Types.ObjectId, ref: "Movie", required: true },
  showtime: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Showtime",
    required: true,
  },
  totalPrice: { type: Number, required: true },
  status: {
    type: String,
    enum: ["active", "cancelled", "locked"],
    default: "active",
  },
  seatNumbers: {
    type: [String],
    required: true, // Seats must be provided at the time of reservation
  },
});

module.exports = mongoose.model("Reservation", ReservationSchema);
