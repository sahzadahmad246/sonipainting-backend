const User = require("../database/userSchema");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register (Create User) controller
exports.registerUser = async (req, res) => {
  const { name, phoneNumber, password } = req.body;
  try {
    // Check if user already exists
    let user = await User.findOne({ phoneNumber });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user
    user = new User({
      name,
      phoneNumber,
      password,
    });

    // Save user to the database
    await user.save();

    // Generate JWT
    const token = user.generateJwtToken();

    // Send token as cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.status(201).json({ message: "User created successfully", token });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Login controller
exports.loginUser = async (req, res) => {
  const { phoneNumber, password } = req.body;

  try {
    // Check if the user exists
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid phone number or password" });
    }

    // Check if the password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Invalid phone number or password" });
    }

    // Generate JWT
    const token = user.generateJwtToken();

    // Send token as cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Logout controller
exports.logoutUser = (req, res) => {
  res.clearCookie("token");

  res.status(200).json({ message: "Logged out successfully" });
};

// Get logged-in user data controller
exports.getLoggedInUser = async (req, res) => {
  try {
    // Get token from cookies
    const token = req.cookies.token;

    // Verify token and decode payload
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by ID from the decoded token
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Exclude sensitive information
    const { password, ...userData } = user.toObject();

    res.status(200).json({ user: userData });
  } catch (error) {
    console.error("Error in getLoggedInUser:", error); // Log the error
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get user by ID controller
exports.getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    // Find user by ID
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get all users controller
exports.getAllUsers = async (req, res) => {
  try {
    // Find all users
    const users = await User.find();
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
