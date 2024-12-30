const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const sendEmail = require("../utils/sendEmail");

// Register a new user
const registerUser = (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // Check if the email is already registered
  User.findOne({ email })
    .then((existingUser) => {
      if (existingUser) {
        return res
          .status(400)
          .json({ message: "Email is already registered." });
      }

      // Hash the password
      return bcrypt.hash(password, 10);
    })
    .then((hashedPassword) => {
      // Create the user
      return User.create({ name, email, password: hashedPassword });
    })
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

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

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

// Update user profile with avatar
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
    .select("-password")
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

// Reset user password
const resetPassword = (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  User.findOne({ email })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "10m",
      });

      user.resetPasswordToken = resetToken;
      user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

      return user.save().then(() => {
        sendEmail({
          to: user.email,
          subject: "Password Reset Request",
          text: `Reset your password here: ${process.env.CLIENT_URL}/reset/${resetToken}`,
        });

        res
          .status(200)
          .json({ message: "Password reset link sent to your email" });
      });
    })
    .catch((error) => {
      res
        .status(500)
        .json({ message: "Failed to send reset email", error: error.message });
    });
};

// Set new password
const setNewPassword = (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!token || !password) {
    return res
      .status(400)
      .json({ message: "Token and password are required." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
    if (error) {
      return res.status(401).json({ message: "Expired or invalid token." });
    }

    User.findById(decoded.id)
      .then((user) => {
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        return bcrypt.hash(password, 10).then((hashedPassword) => {
          user.password = hashedPassword;
          user.resetPasswordToken = undefined;
          user.resetPasswordExpire = undefined;

          return user.save().then(() => {
            res.status(200).json({ message: "Password updated successfully" });
          });
        });
      })
      .catch((error) => {
        res
          .status(500)
          .json({ message: "Failed to update password", error: error.message });
      });
  });
};

// Get all users (Admin only)
const getUsers = (req, res) => {
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

  if (!["admin", "user"].includes(role)) {
    return res.status(400).json({ message: "Invalid role." });
  }

  User.findById(id)
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      user.role = role;
      return user.save();
    })
    .then((updatedUser) => {
      res
        .status(200)
        .json({ message: "Role updated successfully", user: updatedUser });
    })
    .catch((error) => {
      res
        .status(500)
        .json({ message: "Failed to update role", error: error.message });
    });
};

// Delete user (Admin only)
const deleteUser = (req, res) => {
  const { id } = req.params;

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
