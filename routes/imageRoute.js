require('dotenv').config();
const express = require("express");
const imageRouter = express.Router();
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


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "public/images");
    },
    filename: (req, file, cb) => {
      cb(null, file.fieldname + "_" + Date.now() + file.originalname);
    },
  });
  
  const upload = multer({
    storage: storage,
  });
  
  
  imageRouter.post(
    "/upload",
    authMiddleware,
    upload.array("images"),
    async (req, res) => {
      try {
        // Get the authenticated user from the request
        const user = req.user;
        console.log("User uploading images:", user._id);
  
        // Check if the user exists
        if (!user) {
          console.log("User not found");
          return res.status(404).json({ message: "User not found" });
        }
  
        // Get the existing images
        const existingImages = user.images || [];
  
        // Get the filenames of the uploaded images
        const newImages = req.files.map(file => file.filename);
  
        // Combine existing images with new images
        const allImages = existingImages.concat(newImages);
  
        // Update the user with the combined images array
        user.images = allImages;
  
        // Save the updated user
        await user.save();
  
        console.log("Files uploaded successfully for user:", user._id);
        res.status(200).json({ message: "Files uploaded successfully", user });
      } catch (error) {
        console.error("Error during file upload:", error);
        res.status(500).json({ message: "Server error" });
      }
    }
  );
  
  
  
  
  imageRouter.get('/get-images', async (req, res) => {
    try {
      // Fetch all users with their images array
      const usersWithImages = await User.find({}, { images: 1 });
  
      // Extract the images array from each user document
      const allImages = usersWithImages.map(user => user.images).flat();
  
      res.json(allImages);
    } catch (err) {
      console.error("Error while fetching images:", err);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  
  imageRouter.delete("/delete-image/:imageName", authMiddleware, async (req, res) => {
    try {
      const user = req.user;
  
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
  
      const imageName = req.params.imageName;
  
      // Remove the image from user's images array
      user.images = user.images.filter((image) => image !== imageName);
  
      // Save the updated user
      await user.save();
  
      res.status(200).json({ message: "Image deleted successfully" });
    } catch (error) {
      console.error("Error deleting image:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

module.exports = imageRouter;