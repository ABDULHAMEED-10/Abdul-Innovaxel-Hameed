const Reservation = require("../models/Reservation");
const sendEmail = require("../utils/sendEmail");
const Showtime = require("../models/Showtime");
const Cinema = require("../models/Cinema");

// Get Reserved Seats Info
const getReservedSeatsInfo = (req, res) => {
  const { showtimeId } = req.params;

  Showtime.findById(showtimeId)
    .populate("cinema")
    .then((showtimeDoc) => {
      if (!showtimeDoc) {
        return res.status(404).json({ message: "Showtime not found" });
      }

      const cinemaDoc = showtimeDoc.cinema;

      // Calculate the number of reserved seats
      return Reservation.find({ showtime: showtimeId }).then((reservations) => {
        const reservedSeats = reservations.flatMap(
          (reservation) => reservation.seatNumbers
        );
        const remainingSeats = Array.from(
          { length: cinemaDoc.capacity },
          (_, i) => (i + 1).toString()
        ).filter((seat) => !reservedSeats.includes(seat));
        const reservedSeatsCount = reservedSeats.length;
        const remainingSeatsCount = remainingSeats.length;

        res.status(200).json({
          cinemaCapacity: cinemaDoc.capacity,
          reservedSeatsCount,
          remainingSeatsCount,
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

  Showtime.findById(showtime)
    .populate("cinema")
    .then((showtimeDoc) => {
      if (!showtimeDoc) {
        return res.status(404).json({ message: "Showtime not found" });
      }

      const cinemaDoc = showtimeDoc.cinema;

      // Check if there are enough remaining seats
      if (
        cinemaDoc.capacity - showtimeDoc.reservations.length <
        seatNumbers.length
      ) {
        return res.status(400).json({ message: "Not enough remaining seats" });
      }

      // Check if the requested seat numbers are available
      return Reservation.find({ showtime }).then((reservations) => {
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
            )} are already reserved`,
          });
        }

        // Calculate total price
        const totalPrice = showtimeDoc.price * seatNumbers.length;

        // Create a new reservation
        return Reservation.create({
          user,
          movie,
          showtime,
          seatNumbers,
          totalPrice,
        }).then((reservation) => {
          // Add the new reservation to the showtime's reservations
          showtimeDoc.reservations.push(reservation._id);
          return showtimeDoc.save().then(() => reservation);
        });
      });
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
        html: `
          <p>Your reservation for the movie <strong>${
            reservation.movie.title
          }</strong> has been confirmed.</p>
          <p><strong>Cinema:</strong> ${reservation.showtime.cinema.name}</p>
          <p><strong>Showtime:</strong> ${reservation.showtime.date} at ${
          reservation.showtime.time
        }</p>
          <p><strong>Seats:</strong> ${reservation.seatNumbers.join(", ")}</p>
          <p><strong>Total Price:</strong> $${reservation.totalPrice.toFixed(
            2
          )}</p>
        `,
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

      // Check if reservation is already cancelled
      if (reservation.status === "cancelled") {
        return res
          .status(400)
          .json({ message: "Reservation already cancelled" });
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
          cinemaDoc.capacity += reservation.seatNumbers.length;
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
        html: `<p>Your reservation for the movie <strong>${updatedReservation.movie.title}</strong> has been cancelled.</p>`,
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
