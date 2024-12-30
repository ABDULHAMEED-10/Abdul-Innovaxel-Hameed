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
  setNewPassword,
  updateUserPassword,
} = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");

const router = express.Router();
// user routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/resetpassword", resetPassword);
router.put("/setnewpassword", setNewPassword);

// protected routes
router.post("/logout", authMiddleware, logoutUser);
router.put("/profile", authMiddleware, updateUserProfile);
router.get("/profile", authMiddleware, getUserProfile);
router.put("/updatepassword", authMiddleware, updateUserPassword);

// admin routes
router.delete("/delete/:id", authMiddleware, adminMiddleware, deleteUser);
router.put("/role/:id", authMiddleware, adminMiddleware, updateUserRole);
router.get("/", authMiddleware, adminMiddleware, getUsers);

module.exports = router;
