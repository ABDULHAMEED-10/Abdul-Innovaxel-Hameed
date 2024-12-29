const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const sendEmail = require("../utils/sendEmail");

// Register a new user
const registerUser = (req, res) => {
  const { name, email, password } = req.body;

  User.create({ name, email, password })
    .then((user) => {
      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      sendEmail({
        to: user.email,
        subject: "Account Created Successfully",
        text: `Welcome to our platform, ${user.name}`,
      });

      res
        .status(201)
        .json({ message: "User created successfully", token, user });
    })
    .catch((error) => {
      res
        .status(500)
        .json({ message: "Failed to create user", error: error.message });
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

        res.status(200).json({ message: "Login successful", token, user });
      });
    })
    .catch((error) => {
      res.status(500).json({ message: "Login failed", error: error.message });
    });
};

// update user profile with avatar
const updateUserProfile = (req, res) => {
  const { name, email, avatar } = req.body;
  User.findById(req.user.id)
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      user.name = name || user.name;
      user.email = email || user.email;
      user.avatar = avatar || user.avatar;

      return user.save();
    })
    .then((user) => {
      res.status(200).json({ message: "User updated successfully", user });
    })
    .catch((error) => {
      res
        .status(500)
        .json({ message: "Failed to update user", error: error.message });
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
// reset user password
const resetPassword = (req, res) => {
  const { email } = req.body;

  User.findOne({
    email,
  }).then((user) => {
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "10m",
    });

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    user.save();

    sendEmail(
      {
        to: user.email,
        subject: "Password Reset Request",
        text: `Reset your password here: ${process.env.CLIENT_URL}/reset/${resetToken}`,
      },
      (error) => {
        if (error) {
          console.error("Error sending email: ", error);
        }
      }
    );

    res.status(200).json({ message: "Password reset link sent to your email" });
  });
};
//set new password
const setNewPassword = (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!token) {
    return res.status(400).json({ message: "Invalid token" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
    if (error) {
      return res.status(401).json({ message: "Expired or invalid token" });
    }

    User.findOne({
      _id: decoded.id,
    }).then((user) => {
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      user.password = password;
      user.save();

      res.status(200).json({ message: "Password updated successfully" });
    });
  });
};
// Get all users (Admin only)
const getUsers = (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }

  User.find()
    .select("-password")
    .then((users) => {
      res.status(200).json(users);
    })
    .catch((error) => {
      res
        .status(500)
        .json({ message: "Failed to fetch users", error: error.message });
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

// delete user (Admin only)
const deleteUser = (req, res) => {
  const { id } = req.params;

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }

  User.findByIdAndDelete(id)
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({ message: "User deleted successfully" });
    })
    .catch((error) => {
      res
        .status(500)
        .json({ message: "Failed to delete user", error: error.message });
    });
};

// Logout user
const logoutUser = (req, res) => {
  // Clear the token from cookies
  res.clearCookie("token");
  res.status(200).json({ message: "Logout successful" });
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserRole,
  deleteUser,
  logoutUser,
  updateUserProfile,
  getUsers,
  resetPassword,
  setNewPassword,
};
