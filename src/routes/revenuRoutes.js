const express = require("express");
const { calculateRevenue } = require("../controllers/revenuController");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");

const router = express.Router();

// Calculate revenue route (protected, admin only)
router.get("/", authMiddleware, adminMiddleware, calculateRevenue);

module.exports = router;
