const express = require("express");
const {
  createReservation,
  getUserReservations,
  cancelReservation,
  getActiveReservations,
  getCancelledReservations,
  getAllReservations,
} = require("../controllers/reservationController");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");

const router = express.Router();

router.post("/", authMiddleware, createReservation);
router.get("/:userId", authMiddleware, getUserReservations);
router.delete("/:id", authMiddleware, cancelReservation);

router.get("/", authMiddleware, adminMiddleware, getAllReservations);
router.get("/active", authMiddleware, adminMiddleware, getActiveReservations);
router.get(
  "/cancelled",
  authMiddleware,
  adminMiddleware,
  getCancelledReservations
);

module.exports = router;
