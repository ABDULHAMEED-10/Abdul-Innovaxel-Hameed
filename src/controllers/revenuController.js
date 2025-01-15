const Showtime = require("../models/Showtime");
const Reservation = require("../models/Reservation");

const calculateRevenue = async (req, res) => {
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

  try {
    const revenue = await Showtime.aggregate([
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
          localField: "_id",
          foreignField: "showtime",
          as: "reservations",
        },
      },
      {
        $unwind: "$reservations",
      },
      {
        $match: {
          "reservations.status": "active",
        },
      },
      // Group by showtime and calculate total revenue
      {
        $group: {
          _id: "$_id",
          totalRevenue: { $sum: "$reservations.totalPrice" },
        },
      },
      // Sum up the total revenue from all showtimes
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalRevenue" },
        },
      },
    ]);

    const totalRevenue = revenue.length > 0 ? revenue[0].totalRevenue : 0;

    res.status(200).json({ totalRevenue });
  } catch (err) {
    console.error("Error calculating revenue:", err.message);
    res
      .status(500)
      .json({ message: "Failed to calculate revenue", error: err.message });
  }
};

module.exports = {
  calculateRevenue,
};
