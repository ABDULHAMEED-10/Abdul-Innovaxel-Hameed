const Reservation = require("../models/Reservation");

// Create a Reservation
exports.createReservation = async (req, res) => {
  const { user, movie, showtime, seatNumbers } = req.body;
  try {
    const reservation = await Reservation.create({
      user,
      movie,
      showtime,
      seatNumbers,
    });
    res
      .status(201)
      .json({ message: "Reservation created successfully", reservation });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Reservations by User
exports.getUserReservations = async (req, res) => {
  const { userId } = req.params;
  try {
    const reservations = await Reservation.find({ user: userId }).populate(
      "movie"
    );
    res.status(200).json(reservations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Cancel a Reservation
exports.cancelReservation = async (req, res) => {
  const { id } = req.params;
  try {
    const reservation = await Reservation.findByIdAndDelete(id);
    if (!reservation)
      return res.status(404).json({ message: "Reservation not found" });

    res.status(200).json({ message: "Reservation cancelled successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
