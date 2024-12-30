const Showtime = require("../models/Showtime");
const Reservation = require("../models/Reservation");

const calculateRevenue = (req, res) => {
  const { startDate, endDate } = req.query;

  // Validate input dates
  if (!startDate || !endDate) {
    return res
      .status(400)
      .json({ message: "Start date and end date are required." });
  }

  // Ensure dates are valid
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return res.status(400).json({ message: "Invalid date format." });
  }

  Showtime.aggregate([
    // Match showtimes within the specified date range
    {
      $match: {
        date: { $gte: start, $lte: end },
      },
    },
    // Lookup reservation details and filter active reservations
    {
      $lookup: {
        from: "reservations",
        localField: "reservations",
        foreignField: "_id",
        as: "activeReservations",
      },
    },
    // Filter only active reservations
    {
      $addFields: {
        activeReservations: {
          $filter: {
            input: "$activeReservations",
            as: "reservation",
            cond: { $eq: ["$$reservation.status", "active"] },
          },
        },
      },
    },
    // Calculate revenue per showtime
    {
      $addFields: {
        showtimeRevenue: {
          $sum: "$activeReservations.totalPrice",
        },
      },
    },
    // Summarize total revenue
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$showtimeRevenue" },
      },
    },
  ])
    .then((result) => {
      const totalRevenue = result.length > 0 ? result[0].totalRevenue : 0;
      res.status(200).json({ totalRevenue });
    })
    .catch((error) => {
      console.error("Error calculating revenue:", error.message);
      res
        .status(500)
        .json({ message: "Failed to calculate revenue", error: error.message });
    });
};

module.exports = { calculateRevenue };
