const mongoose = require("mongoose");

const showtimeSchema = new mongoose.Schema({
  movie: { type: mongoose.Schema.Types.ObjectId, ref: "Movie", required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  cinema: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cinema",
    required: true,
  },
  price: { type: Number, required: true }, // Price per ticket for this showtime in USD
  reservations: [{ type: mongoose.Schema.Types.ObjectId, ref: "Reservation" }],
});

module.exports = mongoose.model("Showtime", showtimeSchema);
