const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const errorHandler = require("./utils/errorHandler");
const authRoutes = require("./routes/authRoutes");
const movieRoutes = require("./routes/movieRoutes");
const reservationRoutes = require("./routes/reservationRoutes");
const userRoutes = require("./routes/userRoutes");
const revenueRoutes = require("./routes/revenuRoutes");
const showtimeRoutes = require("./routes/showtimeRoutes");
const cinemaRoutes = require("./routes/cinemaRoutes");

dotenv.config();

const app = express();
// Middleware
app.use(express.json());
app.use(
  cors()
  // {
  //     origin: "http://localhost:3000",
  //     credentials: true,
  // }
);

// Database Connection
connectDB();

// Routes

app.use("/api/Oauth", authRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/revenue", revenueRoutes);
app.use("/api/showtimes", showtimeRoutes);
app.use("/api/cinemas", cinemaRoutes);

// Error Handler
app.use(errorHandler);

module.exports = app;
