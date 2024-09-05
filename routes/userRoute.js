// userRoute.js
const express = require("express");
const passport = require("passport");
const { googleAuthSuccess, logout } = require("../controllers/userController");

const router = express.Router();

// Routes for Google OAuth2 authentication
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: "https://sonipainting.com/",
    failureRedirect: "https://sonipainting.com/login",
  })
);

// Route to handle successful login
router.get("/login/success", googleAuthSuccess);

// Route to handle logout
router.get("/logout", logout);

module.exports = router;
