const Movie = require("../models/Movie");

// Get all movies
const getAllMovies = async (req, res) => {
  try {
    const movies = await Movie.find();
    res.status(200).json(movies);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch movies", error: err.message });
  }
};

// Add a new movie with image upload
const addMovie = async (req, res) => {
  const { title, description, genres, showtimes } = req.body;

  try {
    const movie = new Movie({
      title,
      description,
      genres,
      showtimes,
      imageUrl: req.file.path, // Get the Cloudinary URL
    });

    await movie.save();
    res.status(201).json(movie);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to add movie", error: err.message });
  }
};

// Update movie details
const updateMovie = async (req, res) => {
  const { id } = req.params;
  const { title, description, genres, showtimes } = req.body;

  try {
    const movie = await Movie.findById(id);

    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    movie.title = title || movie.title;
    movie.description = description || movie.description;
    movie.genres = genres || movie.genres;
    movie.showtimes = showtimes || movie.showtimes;

    // Update image if a new file is uploaded
    if (req.file) {
      movie.imageUrl = req.file.path; // Get the new Cloudinary URL
    }

    await movie.save();
    res.status(200).json(movie);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update movie", error: err.message });
  }
};

// Delete a movie
const deleteMovie = async (req, res) => {
  const { id } = req.params;

  try {
    const movie = await Movie.findById(id);

    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    await movie.remove();
    res.status(200).json({ message: "Movie deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete movie", error: err.message });
  }
};

module.exports = {
  getAllMovies,
  addMovie,
  updateMovie,
  deleteMovie,
};
