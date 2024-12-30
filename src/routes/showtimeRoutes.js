const express = require("express");
const {
  addShowtime,
  updateShowtime,
  deleteShowtime,
  getShowtimes,
} = require("../controllers/showtimeController");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");

const router = express.Router();

// public routes
router.get("/", getShowtimes);

// admin routes
router.post("/", authMiddleware, adminMiddleware, addShowtime);
router.put("/:id", authMiddleware, adminMiddleware, updateShowtime);
router.delete("/:id", authMiddleware, adminMiddleware, deleteShowtime);

module.exports = router;
