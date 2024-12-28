const Reservation = require("../models/Reservation");

// Create a Reservation
exports.createReservation = (req, res) => {
  const { user, movie, showtime, seatNumbers } = req.body;
  Reservation.create({ user, movie, showtime, seatNumbers })
    .then((reservation) => {
      res
        .status(201)
        .json({ message: "Reservation created successfully", reservation });
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
};

// Get Reservations by User
exports.getUserReservations = (req, res) => {
  const { userId } = req.params;
  Reservation.find({ user: userId })
    .populate("movie")
    .then((reservations) => {
      res.status(200).json(reservations);
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
};

// Cancel a Reservation
exports.cancelReservation = (req, res) => {
  const { id } = req.params;
  Reservation.findByIdAndDelete(id)
    .then((reservation) => {
      if (!reservation)
        return res.status(404).json({ message: "Reservation not found" });

      res.status(200).json({ message: "Reservation cancelled successfully" });
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
};
