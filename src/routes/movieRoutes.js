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

const router = express.Router();

router.get("/", getAllMovies);
router.get("/genre/:genre", getMovieByGenre);
router.post(
  "/",
  authMiddleware,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  addMovie
);
router.put(
  "/:id",
  authMiddleware,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  updateMovie
);

router.delete("/:id", authMiddleware, deleteMovie);

module.exports = router;
