const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const bcrypt = require("bcryptjs");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Signup Controller
exports.signup = (req, res) => {
  const { name, email, password } = req.body;

  User.findOne({ email })
    .then((userExists) => {
      if (userExists) {
        return res.status(400).json({ message: "User already exists" });
      }
      return User.create({ name, email, password });
    })
    .then((user) => {
      res.status(201).json({ message: "User registered successfully", user });
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
};

// Login Controller
exports.login = (req, res) => {
  const { email, password } = req.body;

  User.findOne({ email })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      return bcrypt.compare(password, user.password).then((isMatch) => {
        if (!isMatch) {
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
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
};

// Google Login Controller
exports.googleLogin = (req, res) => {
  const { token } = req.body;

  client
    .verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    })
    .then((ticket) => {
      const { email, name } = ticket.getPayload();
      return User.findOne({ email }).then((user) => {
        if (!user) {
          return User.create({ name, email, password: "google-oauth" });
        }
        return user;
      });
    })
    .then((user) => {
      const jwtToken = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );
      res
        .status(200)
        .json({ message: "Google login successful", token: jwtToken });
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
};
