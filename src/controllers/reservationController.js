const Reservation = require("../models/Reservation");
const sendEmail = require("../utils/sendEmail");
const Showtime = require("../models/Showtime");
const Cinema = require("../models/Cinema");

// Create a Reservation
const createReservation = (req, res) => {
  const { user, movie, showtime, seatNumbers } = req.body;

  Showtime.findById(showtime)
    .populate("cinema")
    .then((showtimeDoc) => {
      if (!showtimeDoc) {
        return res.status(404).json({ message: "Showtime not found" });
      }

      const cinemaDoc = showtimeDoc.cinema;

      // Check if there are enough remaining seats
      if (cinemaDoc.remainingSeats < seatNumbers.length) {
        return res.status(400).json({ message: "Not enough remaining seats" });
      }

      // Create a new reservation
      return Reservation.create({ user, movie, showtime, seatNumbers }).then(
        (reservation) => {
          // Update remaining seats
          cinemaDoc.remainingSeats -= seatNumbers.length;
          return cinemaDoc.save().then(() => reservation);
        }
      );
    })
    .then((reservation) => {
      res.status(201).json({
        message: "Reservation created successfully",
        reservation,
      });

      // Send confirmation email
      return sendEmail({
        from: process.env.SMTP_USER,
        to: req.user.email,
        subject: "Reservation Confirmation",
        text: `Your reservation for the movie has been confirmed.`,
        html: `<p>Your reservation for the movie has been confirmed.</p>`,
      });
    })
    .catch((err) => {
      console.error("Error creating reservation:", err.message);
      res
        .status(500)
        .json({ message: "Failed to create reservation", error: err.message });
    });
};

// Cancel a Reservation
const cancelReservation = (req, res) => {
  const { id } = req.params;

  Reservation.findById(id)
    .then((reservation) => {
      if (!reservation) {
        return res.status(404).json({ message: "Reservation not found" });
      }

      reservation.status = "cancelled";
      return reservation.save().then(() => reservation);
    })
    .then((reservation) => {
      return Showtime.findById(reservation.showtime)
        .populate("cinema")
        .then((showtimeDoc) => {
          if (!showtimeDoc) {
            return res.status(404).json({ message: "Showtime not found" });
          }

          const cinemaDoc = showtimeDoc.cinema;

          // Update remaining seats
          cinemaDoc.remainingSeats += reservation.seatNumbers;
          return cinemaDoc.save().then(() => reservation);
        });
    })
    .then((updatedReservation) => {
      // Send cancellation email
      return sendEmail({
        from: process.env.SMTP_USER,
        to: req.user.email,
        subject: "Reservation Cancellation",
        text: `Your reservation for the movie has been cancelled.`,
        html: `<p>Your reservation for the movie has been cancelled.</p>`,
      }).then(() => {
        res.status(200).json({
          message: "Reservation cancelled successfully",
          reservation: updatedReservation,
        });
      });
    })
    .catch((err) => {
      console.error("Error cancelling reservation:", err.message);
      res
        .status(500)
        .json({ message: "Failed to cancel reservation", error: err.message });
    });
};

// Get Reservations by User ID
const getUserReservations = (req, res) => {
  const { userId } = req.params;

  Reservation.find({ user: userId })
    .populate("movie")
    .then((reservations) => {
      res.status(200).json(reservations);
    })
    .catch((err) => {
      console.error("Error fetching user reservations:", err.message);
      res
        .status(500)
        .json({ message: "Failed to fetch reservations", error: err.message });
    });
};

// Show Active Reservations (admin only)
const getActiveReservations = (req, res) => {
  Reservation.find({ status: "active" })
    .populate("movie")
    .then((reservations) => {
      res.status(200).json(reservations);
    })
    .catch((err) => {
      console.error("Error fetching active reservations:", err.message);
      res.status(500).json({
        message: "Failed to fetch active reservations",
        error: err.message,
      });
    });
};

// Show Cancelled Reservations (admin only)
const getCancelledReservations = (req, res) => {
  Reservation.find({ status: "cancelled" })
    .populate("movie")
    .then((reservations) => {
      res.status(200).json(reservations);
    })
    .catch((err) => {
      console.error("Error fetching cancelled reservations:", err.message);
      res.status(500).json({
        message: "Failed to fetch cancelled reservations",
        error: err.message,
      });
    });
};

// get all users reservations (admin only)
const getAllReservations = (req, res) => {
  Reservation.find()
    .populate("movie")
    .then((reservations) => {
      res.status(200).json(reservations);
    })
    .catch((err) => {
      console.error("Error fetching all reservations:", err.message);
      res.status(500).json({
        message: "Failed to fetch all reservations",
        error: err.message,
      });
    });
};

module.exports = {
  createReservation,
  getUserReservations,
  cancelReservation,
  getActiveReservations,
  getCancelledReservations,
  getAllReservations,
};
