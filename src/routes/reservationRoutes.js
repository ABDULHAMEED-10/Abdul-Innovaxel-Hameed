const express = require("express");
const {
  createReservation,
  getUserReservations,
  cancelReservation,
  getActiveReservations,
  getCancelledReservations,
} = require("../controllers/reservationController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, createReservation);
router.get("/active", authMiddleware, getActiveReservations);
router.get("/cancelled", authMiddleware, getCancelledReservations);
router.get("/:userId", authMiddleware, getUserReservations);
router.delete("/:id", authMiddleware, cancelReservation);

module.exports = router;
