const express = require("express");
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserRole,
  deleteUser,
  logoutUser,
  updateUserProfile,
  getUsers,
  resetPassword,
} = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.delete("/delete/:id", authMiddleware, deleteUser);
router.post("/logout", authMiddleware, logoutUser);
router.put("/profile", authMiddleware, updateUserProfile);
router.post("/resetpassword", resetPassword);
router.get("/profile", authMiddleware, getUserProfile);
router.put("/role/:id", authMiddleware, updateUserRole);
router.get("/", authMiddleware, getUsers);

module.exports = router;
