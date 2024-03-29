require('dotenv').config();
const express = require("express");
const router = express.Router();
const multer = require("multer");
const User = require("../database/userSchema");
const Review = require("../database/reviewSchema")
const argon2 = require("argon2");
const path = require("path");
const registerSchema = require("../validator");
const validate = require("../validateMiddleware");
const authMiddleware = require("../middleware/middleware");
const nodemailer = require("nodemailer");
const Contact = require("../database/contactSchema");


require("../database/connection");

router.get("/", (req, res) => {
  res.send("This is the homepage");
});

// Registration route
router.post("/register", validate(registerSchema), async (req, res) => {
  try {
    const { name, phone, password, email } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email or phone number already exists!" });
    }

    // Hash password using argon2
    const hashedPassword = await argon2.hash(password);

    const newUser = new User({
      name,
      phone,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    const token = newUser.generateToken(); // Assuming generateToken() returns the token
    const userId = newUser._id.toString();

    res.status(201).json({
      message: "You're registered as admin",
      token: token,
      userId: userId,
    });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { phone, password } = req.body;
    console.log(phone, password);
    // Check if user with provided phone number exists
    const user = await User.findOne({ phone });
    let token;
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify password
    const isPasswordValid = await argon2.verify(user.password, password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }
    token = await user.generateToken();
    // Respond with token and user id
    res.status(200).json({
      message: "Login successful",
      userId: user._id.toString(),
      token,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// sending user data to frontend
router.get("/user", authMiddleware, async (req, res) => {
  try {
    const userData = req.user;
    console.log(userData);
    return res.status(200).json({ data: userData });
  } catch (error) {
    console.log(error);
  }
});




// Route to save a review
router.post("/save-review", async (req, res) => {
  try {
    const { name, phone, rating, review } = req.body;

   

    // Check if the phone number is already associated with a review
    const existingReview = await Review.findOne({ phone });
    if (existingReview) {
      return res.status(400).json({ message: "A review from this phone number already exists" });
    }

    // Create a new review document
    const newReview = new Review({
      name,
      phone,
      rating,
      review
    });

    // Save the review to the database
    await newReview.save();

    res.status(201).json({ message: "Review saved successfully" });
  } catch (error) {
    console.error("Error saving review:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Route to get the average rating
router.get("/average-rating", async (req, res) => {
  try {
    const averageRating = await Review.aggregate([
      { $group: { _id: null, averageRating: { $avg: "$rating" } } }
    ]);

    const roundedAverageRating = averageRating[0].averageRating.toFixed(1);
    
    res.status(200).json({ averageRating: roundedAverageRating });
  } catch (error) {
    console.error("Error fetching average rating:", error);
    res.status(500).json({ message: "Server error" });
  }
});
router.get("/ratings-count", async (req, res) => {
  try {
    const ratingsCount = await Review.aggregate([
      { $group: { _id: "$rating", count: { $sum: 1 } } }
    ]);

    const ratingsMap = {};
    ratingsCount.forEach(rating => {
      ratingsMap[rating._id] = rating.count;
    });

    res.status(200).json({ ratingsMap });
  } catch (error) {
    console.error("Error fetching ratings count:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/reviews", async (req, res) => {
  try {
    const reviews = await Review.find({}, { name: 1, phone: 1, rating: 1, review: 1, replies: 1 });

    // Calculate the number of reviews
    const numberOfReviews = reviews.length;

    // Calculate the average rating
    const totalRating = reviews.reduce((acc, curr) => acc + curr.rating, 0);
    const averageRating = numberOfReviews > 0 ? totalRating / numberOfReviews : 0;

    res.status(200).json({ reviews, numberOfReviews, averageRating });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// Helper function to fetch replies for a review
async function fetchReplies(reviewId) {
  try {
    const review = await Review.findById(reviewId);
    return review ? review.replies : [];
  } catch (error) {
    console.error(`Error fetching replies for review ${reviewId}:`, error);
    return [];
  }
}



// Route to get each review with details
router.get("/reviews", async (req, res) => {
  try {
    const reviews = await Review.find({}, { name: 1, phone: 1, rating: 1, review: 1, replies: 1, });

    // Calculate the number of reviews
    const numberOfReviews = reviews.length;

    // Calculate the average rating
    const totalRating = reviews.reduce((acc, curr) => acc + curr.rating, 0);
    const averageRating = numberOfReviews > 0 ? totalRating / numberOfReviews : 0;

    res.status(200).json({ reviews, numberOfReviews, averageRating });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/add-reply/:reviewId", async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { text } = req.body;

    // Find the review by ID
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    // Ensure that the review object has a 'replies' property
    if (!review.replies) {
      review.replies = [];
    }

    // Add the reply to the review
    review.replies.push({ text, date: new Date() });
    await review.save();

    res.status(200).json({ success: true, message: "Reply added successfully" });
  } catch (error) {
    console.error("Error adding reply to review:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// Route to save contact data
router.post("/contact", async (req, res) => {
  try {
    const { fname, phone, message } = req.body;

    // Save contact details to the database
    const newContact = new Contact({ fname, phone, message });
    await newContact.save();

    res.status(200).json({ message: "Contact details saved successfully" });
  } catch (error) {
    console.error("Error saving contact details:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// Route to get all contact details from the database
router.get("/messages", async (req, res) => {
  try {

    const contacts = await Contact.find();

    res.status(200).json({ contacts });
  } catch (error) {
    console.error("Error fetching contact details:", error);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
