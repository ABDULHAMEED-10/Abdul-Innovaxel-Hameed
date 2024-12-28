const express = require("express");
const {
  createReservation,
  getUserReservations,
  cancelReservation,
} = require("../controllers/reservationController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, createReservation);
router.get("/:userId", authMiddleware, getUserReservations);
router.delete("/:id", authMiddleware, cancelReservation);

module.exports = router;
