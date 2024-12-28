const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const sendEmail = require("../utils/sendEmail");

// Register a new user
const registerUser = (req, res) => {
  const { name, email, password } = req.body;

  User.findOne({ email })
    .then((userExists) => {
      if (userExists) {
        return res.status(400).json({ message: "User already exists" });
      }

      const newUser = new User({ name, email, password });
      return newUser.save();
    })
    .then((newUser) => {
      return sendEmail({
        to: email,
        subject: "Welcome to Movie Booking App",
        text: `Hi ${name}, Welcome to our platform!`,
        html: `<h1>Hi ${name},</h1><p>Welcome to our movie booking platform!</p>`,
      }).then(() => {
        res
          .status(201)
          .json({ message: "User registered successfully", user: newUser });
      });
    })
    .catch((error) => {
      res
        .status(500)
        .json({ message: "Failed to register user", error: error.message });
    });
};

// Login user
const loginUser = (req, res) => {
  const { email, password } = req.body;

  User.findOne({ email })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      return bcrypt.compare(password, user.password).then((isPasswordValid) => {
        if (!isPasswordValid) {
          return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
          { id: user._id, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: "1d" }
        );

        res.status(200).json({ message: "Login successful", token });
      });
    })
    .catch((error) => {
      res.status(500).json({ message: "Login failed", error: error.message });
    });
};

// Get user profile
const getUserProfile = (req, res) => {
  User.findById(req.user.id)
    .select("-password") // Exclude password from the response
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json(user);
    })
    .catch((error) => {
      res.status(500).json({
        message: "Failed to fetch user profile",
        error: error.message,
      });
    });
};

// Update user role (Admin only)
const updateUserRole = (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }

  User.findById(id)
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      user.role = role;
      return user.save();
    })
    .then((user) => {
      res.status(200).json({ message: "User role updated successfully", user });
    })
    .catch((error) => {
      res
        .status(500)
        .json({ message: "Failed to update user role", error: error.message });
    });
};

module.exports = { registerUser, loginUser, getUserProfile, updateUserRole };
