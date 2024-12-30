const express = require("express");
const {
  getAllMovies,
  addMovie,
  updateMovie,
  deleteMovie,
  getMovieByGenre,
} = require("../controllers/movieController");
const authMiddleware = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");

const router = express.Router();

// public routes
router.get("/", getAllMovies);
router.get("/genre/:genre", getMovieByGenre);

// admin routes
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  addMovie
);
router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  updateMovie
);

router.delete("/:id", authMiddleware, adminMiddleware, deleteMovie);

module.exports = router;
