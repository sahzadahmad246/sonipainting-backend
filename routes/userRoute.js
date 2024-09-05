const express = require("express");
const passport = require("passport");
const { googleAuthSuccess, logout } = require("../controllers/userController");

const router = express.Router();

// Determine the redirect URLs based on the environment
const successRedirectURL =
  process.env.NODE_ENV === "production"
    ? "https://sonipainting.com/"
    : "http://localhost:5173/";

const failureRedirectURL =
  process.env.NODE_ENV === "production"
    ? "https://sonipainting.com/login"
    : "http://localhost:5173/login";

// Routes for Google OAuth2 authentication
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: successRedirectURL,
    failureRedirect: failureRedirectURL,
  })
);

// Route to handle successful login
router.get("/login/success", googleAuthSuccess);

// Route to handle logout
router.get("/logout", logout);

module.exports = router;
