const mongoose = require("mongoose");

const replySchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const reviewSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true
  },
  review: {
    type: String,
    required: true
  },
  replies: [replySchema] // Array of replies
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
