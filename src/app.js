const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const errorHandler = require("./utils/errorHandler");

const authRoutes = require("./routes/authRoutes");
const movieRoutes = require("./routes/movieRoutes");
const reservationRoutes = require("./routes/reservationRoutes");
const userRoutes = require("./routes/userRoutes");

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Database Connection
connectDB();

// Routes

app.use("/api/auth", authRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/users", userRoutes);

// Error Handler
app.use(errorHandler);

module.exports = app;
