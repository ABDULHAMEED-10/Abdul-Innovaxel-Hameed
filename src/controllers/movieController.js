const Movie = require("../models/Movie");

// Get all movies
const getAllMovies = (req, res) => {
  Movie.find()
    .then((movies) => res.status(200).json(movies))
    .catch((err) =>
      res
        .status(500)
        .json({ message: "Failed to fetch movies", error: err.message })
    );
};
// Add a new movie with video url
const addMovie = (req, res) => {
  const { title, description, genres, showtimes, videoUrl, imageUrl } =
    req.body;

  Movie.create({ title, description, genres, showtimes, videoUrl, imageUrl })
    .then((movie) => res.status(201).json(movie))
    .catch((err) =>
      res
        .status(500)
        .json({ message: "Failed to add movie", error: err.message })
    );
};

// Update movie details
const updateMovie = (req, res) => {
  const { id } = req.params;
  const { title, description, genres, showtimes, videoUrl, imageUrl } =
    req.body;

  Movie.findByIdAndUpdate(
    id,
    { title, description, genres, showtimes, videoUrl, imageUrl },
    { new: true }
  )
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

//get movie by genre
const getMovieByGenre = (req, res) => {
  const { genre } = req.params;
  Movie.find({ genres: genre })
    .then((movies) => {
      res.status(200).json(movies);
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
};

// Delete a movie
const deleteMovie = (req, res) => {
  const { id } = req.params;

  Movie.findByIdAndDelete(id)
    .then((movie) => {
      if (!movie) {
        return res.status(404).json({ message: "Movie not found" });
      }

      res.status(200).json({ message: "Movie deleted successfully" });
    })
    .catch((err) =>
      res
        .status(500)
        .json({ message: "Failed to delete movie", error: err.message })
    );
};

module.exports = {
  getAllMovies,
  addMovie,
  updateMovie,
  deleteMovie,
  getMovieByGenre,
};
