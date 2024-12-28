const express = require("express");
const {
  googleSignup,
  googleLogin,
  googleLogout,
} = require("../controllers/authController");

const router = express.Router();

router.post("/google-signup", googleSignup);
router.post("/google-login", googleLogin);
router.post("/google-logout", googleLogout);

module.exports = router;
