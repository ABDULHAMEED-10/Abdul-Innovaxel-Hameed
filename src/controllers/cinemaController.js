const Cinema = require("../models/Cinema");

// Get all cinemas
const getAllCinemas = (req, res) => {
  Cinema.find()
    .then((cinemas) => res.status(200).json(cinemas))
    .catch((err) =>
      res
        .status(500)
        .json({ message: "Failed to fetch cinemas", error: err.message })
    );
};

// get a single cinema by id
const getCinemaById = (req, res) => {
  const { id } = req.params;

  Cinema.findById(id)
    .then((cinema) => {
      if (!cinema) {
        return res.status(404).json({ message: "Cinema not found" });
      }
      res.status(200).json(cinema);
    })
    .catch((error) =>
      res
        .status(500)
        .json({ message: "Failed to fetch cinema", error: error.message })
    );
};

// Add a new cinema (Admin only)
const addCinema = (req, res) => {
  const { name, location, capacity } = req.body;

  if (!name || !location || !capacity) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const cinema = new Cinema({
    name,
    location,
    capacity,
  });

  cinema
    .save()
    .then((savedCinema) => {
      res.status(201).json({
        message: "Cinema added successfully",
        cinema: savedCinema,
      });
    })
    .catch((error) => {
      console.error("Error adding cinema:", error.message);
      res
        .status(500)
        .json({ message: "Failed to add cinema", error: error.message });
    });
};

// Update cinema details (Admin only)
const updateCinema = (req, res) => {
  const { id } = req.params;
  const { name, location } = req.body;

  if (!name || !location) {
    return res.status(400).json({ message: "All fields are required." });
  }

  Cinema.findByIdAndUpdate(id, { name, location }, { new: true })
    .then((updatedCinema) => {
      if (!updatedCinema) {
        return res.status(404).json({ message: "Cinema not found" });
      }
      res.status(200).json({
        message: "Cinema updated successfully",
        cinema: updatedCinema,
      });
    })
    .catch((error) =>
      res
        .status(500)
        .json({ message: "Failed to update cinema", error: error.message })
    );
};

// Delete a cinema (Admin only)
const deleteCinema = (req, res) => {
  const { id } = req.params;

  Cinema.findByIdAndDelete(id)
    .then((deletedCinema) => {
      if (!deletedCinema) {
        return res.status(404).json({ message: "Cinema not found" });
      }
      res.status(200).json({ message: "Cinema deleted successfully" });
    })
    .catch((error) =>
      res
        .status(500)
        .json({ message: "Failed to delete cinema", error: error.message })
    );
};

module.exports = {
  getAllCinemas,
  getCinemaById,
  addCinema,
  updateCinema,
  deleteCinema,
};
