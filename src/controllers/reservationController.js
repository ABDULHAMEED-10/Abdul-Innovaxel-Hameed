const Reservation = require("../models/Reservation");
const sendEmail = require("../utils/sendEmail");
const Showtime = require("../models/Showtime");
const mongoose = require("mongoose");

// Unlock expired seats
const unlockExpiredSeats = () => {
  const now = new Date();
  Reservation.updateMany(
    { status: "locked", lockExpiresAt: { $lte: now } },
    { status: "cancelled", lockExpiresAt: null }
  ).exec();
};
setInterval(unlockExpiredSeats, 60 * 1000);

// Get Reserved Seats Info
const getReservedSeatsInfo = (req, res) => {
  const { showtimeId } = req.params;

  Showtime.findById(showtimeId)
    .populate("cinema")
    .then((showtimeDoc) => {
      if (!showtimeDoc) {
        return res.status(404).json({ message: "Showtime not found" });
      }

      Reservation.find({
        showtime: showtimeId,
        status: { $in: ["active", "locked"] },
      }).then((reservations) => {
        const reservedSeats = reservations.flatMap(
          (reservation) => reservation.seatNumbers
        );

        const remainingSeats = showtimeDoc.cinema.availableSeats.filter(
          (seat) => !reservedSeats.includes(seat)
        );

        res.status(200).json({
          cinemaCapacity: showtimeDoc.cinema.capacity,
          reservedSeatsCount: reservedSeats.length,
          remainingSeatsCount: remainingSeats.length,
          reservedSeats,
          remainingSeats,
        });
      });
    })
    .catch((err) => {
      console.error("Error getting reserved seats info:", err.message);
      res.status(500).json({
        message: "Failed to get reserved seats info",
        error: err.message,
      });
    });
};

// Create a Reservation
const createReservation = (req, res) => {
  const { user, movie, showtime, seatNumbers } = req.body;

  if (
    !mongoose.Types.ObjectId.isValid(movie) ||
    !mongoose.Types.ObjectId.isValid(showtime)
  ) {
    return res.status(400).json({ message: "Invalid movie or showtime ID" });
  }

  if (!Array.isArray(seatNumbers) || seatNumbers.length === 0) {
    return res
      .status(400)
      .json({ message: "Seat numbers are required and must be an array" });
  }

  Showtime.findById(showtime)
    .populate("cinema")
    .then((showtimeDoc) => {
      if (!showtimeDoc) {
        return res.status(404).json({ message: "Showtime not found" });
      }

      Reservation.find({
        showtime,
        status: { $in: ["active", "locked"] },
      }).then((reservations) => {
        const reservedSeats = reservations.flatMap(
          (reservation) => reservation.seatNumbers
        );
        const unavailableSeats = seatNumbers.filter((seat) =>
          reservedSeats.includes(seat)
        );

        if (unavailableSeats.length > 0) {
          return res.status(400).json({
            message: `Seats ${unavailableSeats.join(
              ", "
            )} are already reserved or locked`,
          });
        }

        // Lock the seats
        const lockExpiresAt = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes from now

        Reservation.create({
          user,
          movie,
          showtime,
          seatNumbers,
          totalPrice: showtimeDoc.price * seatNumbers.length,
          status: "active",
          lockExpiresAt,
        })
          .then((reservation) => {
            res.status(201).json({
              message: "Reservation created successfully",
              reservation,
            });

            // Send confirmation email
            sendEmail({
              from: process.env.SMTP_USER,
              to: req.user.email,
              subject: "Reservation Confirmation",
              text: `Your reservation for the movie has been confirmed.`,
              html: `
                  <p>Your reservation for the movie <strong>${
                    reservation.movie
                  }</strong> has been confirmed.</p>
                  <p><strong>Seats:</strong> ${reservation.seatNumbers.join(
                    ", "
                  )}</p>
                  <p><strong>Total Price:</strong> $${reservation.totalPrice.toFixed(
                    2
                  )}</p>
                `,
            });
          })
          .catch((err) => {
            console.error("Error creating reservation:", err.message);
            res.status(500).json({
              message: "Failed to create reservation",
              error: err.message,
            });
          });
      });
    })
    .catch((err) => {
      console.error("Error processing reservation:", err.message);
      res.status(500).json({
        message: "Failed to process reservation",
        error: err.message,
      });
    });
};

// Cancel a Reservation
const cancelReservation = (req, res) => {
  const { reservationId } = req.params;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(reservationId)) {
    return res.status(400).json({ message: "Invalid reservation ID" });
  }

  Reservation.findById(reservationId)
    .then((reservation) => {
      if (!reservation) {
        return res.status(404).json({ message: "Reservation not found" });
      }

      if (reservation.status === "cancelled") {
        return res
          .status(400)
          .json({ message: "Reservation is already cancelled" });
      }

      reservation.status = "cancelled";
      return reservation.save().then(() => reservation);
    })
    .then(async (reservation) => {
      return Showtime.findById(reservation.showtime)
        .populate("cinema")
        .then((showtimeDoc) => {
          if (!showtimeDoc) {
            return res.status(404).json({ message: "Showtime not found" });
          }

          const cinemaDoc = showtimeDoc.cinema;

          // Update available seats
          cinemaDoc.availableSeats.push(...reservation.seatNumbers);
          cinemaDoc.availableSeats = [...new Set(cinemaDoc.availableSeats)]; // Remove duplicates

          return cinemaDoc.save().then(() => reservation);
        });
    })
    .then((updatedReservation) => {
      res.status(200).json({
        message: "Reservation cancelled successfully",
        reservation: updatedReservation,
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
    .populate({
      path: "showtime",
      populate: {
        path: "cinema",
        model: "Cinema",
      },
    })
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
    .populate({
      path: "showtime",
      populate: {
        path: "cinema",
        model: "Cinema",
      },
    })
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

// Get all users reservations (admin only)
const getAllReservations = (req, res) => {
  Reservation.find()
    .populate("user movie showtime")
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
  getReservedSeatsInfo,
};
