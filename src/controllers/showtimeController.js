const Showtime = require("../models/Showtime");

// Get all showtimes
const getShowtimes = (req, res) => {
  Showtime.find()
    .populate("movie cinema reservations") // Populate related fields for detailed information
    .then((showtimes) => res.status(200).json(showtimes))
    .catch((error) =>
      res
        .status(500)
        .json({ message: "Failed to fetch showtimes", error: error.message })
    );
};

// Add a new showtime
const addShowtime = (req, res) => {
  const { movie, cinema, date, time, price } = req.body;

  if (!movie || !cinema || !date || !time || !price) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const showtime = new Showtime({ movie, cinema, date, time, price });

  showtime
    .save()
    .then((savedShowtime) =>
      res.status(201).json({
        message: "Showtime added successfully",
        showtime: savedShowtime,
      })
    )
    .catch((error) =>
      res
        .status(500)
        .json({ message: "Failed to add showtime", error: error.message })
    );
};

// Update an existing showtime by ID
const updateShowtime = (req, res) => {
  const { movie, cinema, date, time, price } = req.body;
  const { id } = req.params;

  if (!movie || !cinema || !date || !time || !price) {
    return res
      .status(400)
      .json({ message: "All fields are required for update." });
  }

  Showtime.findByIdAndUpdate(
    id,
    { movie, cinema, date, time, price },
    { new: true } // Return the updated document
  )
    .then((updatedShowtime) => {
      if (!updatedShowtime) {
        return res.status(404).json({ message: "Showtime not found" });
      }

      res.status(200).json({
        message: "Showtime updated successfully",
        showtime: updatedShowtime,
      });
    })
    .catch((error) =>
      res
        .status(500)
        .json({ message: "Failed to update showtime", error: error.message })
    );
};

// Delete a showtime by ID
const deleteShowtime = (req, res) => {
  const { id } = req.params;

  Showtime.findByIdAndDelete(id)
    .then((deletedShowtime) => {
      if (!deletedShowtime) {
        return res.status(404).json({ message: "Showtime not found" });
      }

      res.status(200).json({ message: "Showtime deleted successfully" });
    })
    .catch((error) =>
      res
        .status(500)
        .json({ message: "Failed to delete showtime", error: error.message })
    );
};

module.exports = {
  getShowtimes,
  addShowtime,
  updateShowtime,
  deleteShowtime,
};
