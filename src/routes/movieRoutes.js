const express = require("express");
const {
  getAllMovies,
  addMovie,
  updateMovie,
  deleteMovie,
} = require("../controllers/movieController");
const authMiddleware = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

const router = express.Router();

router.get("/", getAllMovies);
router.post("/", authMiddleware, upload.single("image"), addMovie); // Single file upload
router.put("/:id", authMiddleware, upload.single("image"), updateMovie);
router.delete("/:id", authMiddleware, deleteMovie);

module.exports = router;
