const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  getUserById,
  getAllUsers,
  getLoggedInUser,
} = require("../controllers/userController");

const router = express.Router();

// Register route
router.post("/register", registerUser);

// Login route
router.post("/login", loginUser);

// Logout route
router.get("/logout", logoutUser);

// get logged in user
router.get("/me", getLoggedInUser);

// Get User By id
router.post("/user", getUserById);

// Get all Users
router.get("/users", getAllUsers);

module.exports = router;
