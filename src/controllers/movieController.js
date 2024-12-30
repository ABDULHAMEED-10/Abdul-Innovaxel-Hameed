const Movie = require("../models/Movie");
const Showtime = require("../models/Showtime");
const Reservation = require("../models/Reservation");

// Get all movies with video and image uploads
const getAllMovies = (req, res) => {
  Movie.find()
    .then((movies) => res.status(200).json(movies))
    .catch((err) =>
      res
        .status(500)
        .json({ message: "Failed to fetch movies", error: err.message })
    );
};

// Add a new movie with video and image uploads (Admin only)
const addMovie = (req, res) => {
  const { title, description, genres, showtimes } = req.body;

  // Extract file paths from uploaded files
  const videoUrl = req.files?.video?.[0]?.path;
  const imageUrl = req.files?.image?.[0]?.path;

  if (!videoUrl || !imageUrl) {
    return res
      .status(400)
      .json({ message: "Video and image files are required." });
  }

  Movie.create({ title, description, genres, showtimes, videoUrl, imageUrl })
    .then((movie) => res.status(201).json(movie))
    .catch((err) =>
      res
        .status(500)
        .json({ message: "Failed to add movie", error: err.message })
    );
};

// Update movie details with video and image uploads (Admin only)
const updateMovie = (req, res) => {
  const { id } = req.params;
  const { title, description, genres, showtimes } = req.body;

  // Extract file paths from uploaded files
  const videoUrl = req.files?.video?.[0]?.path;
  const imageUrl = req.files?.image?.[0]?.path;

  // Build the update object dynamically
  const updateData = {
    title,
    description,
    genres,
    showtimes,
    ...(videoUrl && { videoUrl }), // Add only if videoUrl exists
    ...(imageUrl && { imageUrl }), // Add only if imageUrl exists
  };

  Movie.findByIdAndUpdate(id, updateData, { new: true })
    .then((movie) => {
      if (!movie) {
        return res.status(404).json({ message: "Movie not found" });
      }

      res.status(200).json(movie);
    })
    .catch((err) =>
      res
        .status(500)
        .json({ message: "Failed to update movie", error: err.message })
    );
};

// Get movies by genre
const getMovieByGenre = (req, res) => {
  const { genre } = req.params;

  Movie.find({ genres: genre })
    .then((movies) => res.status(200).json(movies))
    .catch((err) =>
      res.status(500).json({
        message: "Failed to fetch movies by genre",
        error: err.message,
      })
    );
};

// Delete a movie by ID and remove associated showtimes and reservations (if any) (Admin only)
const deleteMovie = (req, res) => {
  const { id } = req.params;

  Movie.findByIdAndDelete(id)
    .then((movie) => {
      if (!movie) {
        return res.status(404).json({ message: "Movie not found" });
      }

      // Find and delete associated showtimes
      return Showtime.find({ movie: id }).then((showtimes) => {
        const showtimeIds = showtimes.map((showtime) => showtime._id);

        // Delete associated reservations
        return Reservation.deleteMany({ showtime: { $in: showtimeIds } })
          .then(() => {
            // Delete associated showtimes
            return Showtime.deleteMany({ movie: id });
          })
          .then(() => {
            res.status(200).json({
              message:
                "Movie, showtimes, and reservations deleted successfully",
            });
          });
      });
    })
    .catch((err) => {
      res
        .status(500)
        .json({ message: "Failed to delete movie", error: err.message });
    });
};

module.exports = {
  getAllMovies,
  addMovie,
  updateMovie,
  deleteMovie,
  getMovieByGenre,
};
