const express = require("express");

const {
  getAllCinemas,
  getCinemaById,
  addCinema,
  updateCinema,
  deleteCinema,
} = require("../controllers/cinemaController");

const adminMiddleware = require("../middlewares/adminMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();
// Routes
router.get("/", authMiddleware, adminMiddleware, getAllCinemas);
router.get("/:id", authMiddleware, adminMiddleware, getCinemaById);
router.post("/", authMiddleware, adminMiddleware, addCinema);
router.put("/:id", authMiddleware, adminMiddleware, updateCinema);
router.delete("/:id", authMiddleware, adminMiddleware, deleteCinema);

module.exports = router;
