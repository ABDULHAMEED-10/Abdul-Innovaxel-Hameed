const Reservation = require("../models/Reservation");
const sendEmail = require("../utils/sendEmail");

// Create a Reservation
const createReservation = (req, res) => {
  const { user, movie, showtime, seatNumbers } = req.body;
  Reservation.create({ user, movie, showtime, seatNumbers })
    .then((reservation) => {
      res
        .status(201)
        .json({ message: "Reservation created successfully", reservation });

      // Send confirmation email
      sendEmail(
        {
          to: reservation.user.email,
          subject: "Reservation Confirmation",
          text: `Your reservation for ${reservation.movie.title} has been confirmed`,
          html: `<p>Your reservation for ${reservation.movie.title} has been confirmed</p>`,
        },
        (error) => {
          if (error) {
            console.error("Error sending email: ", error);
          }
        }
      );
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
};

// Get Reservations by User
const getUserReservations = (req, res) => {
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
const cancelReservation = (req, res) => {
  const { id } = req.params;
  Reservation.findById(id)
    .then((reservation) => {
      if (!reservation)
        return res.status(404).json({ message: "Reservation not found" });

      reservation.status = "cancelled";
      return reservation.save();
    })
    .then((updatedReservation) => {
      res.status(200).json({
        message: "Reservation cancelled successfully",
        reservation: updatedReservation,
      });
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
};

module.exports = { createReservation, getUserReservations, cancelReservation };
