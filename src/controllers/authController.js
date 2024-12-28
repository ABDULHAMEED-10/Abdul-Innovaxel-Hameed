const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// google signup Controller
const googleSignup = (req, res) => {
  const { token } = req.body;

  client
    .verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    })
    .then((ticket) => {
      const { email, name } = ticket.getPayload();
      return User.findOne({ email }).then((user) => {
        if (user) {
          return res.status(400).json({ message: "User already exists" });
        }
        return User.create({ name, email, password: "google-oauth" });
      });
    })
    .then((user) => {
      const jwtToken = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );
      res
        .status(201)
        .json({ message: "Google signup successful", token: jwtToken });
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
};

// Google Login Controller
const googleLogin = (req, res) => {
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

// google logout Controller
const googleLogout = (req, res) => {
  res.status(200).json({ message: "Google logout successful" });
};

module.exports = { googleSignup, googleLogin, googleLogout };
