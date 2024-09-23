const Image = require("../database/imageSchema");
const cloudinary = require("cloudinary").v2;

exports.uploadImages = async (req, res) => {
  try {
    const descriptions = req.body["descriptions[]"]; 
    const files = req.files.images; 

    const descriptionsArray = Array.isArray(descriptions) ? descriptions : [descriptions];

  
    const filesArray = Array.isArray(files) ? files : [files];

   
    if (!filesArray || !descriptionsArray) {
      return res.status(400).json({
        message: "Images and descriptions are required.",
      });
    }

    if (filesArray.length !== descriptionsArray.length) {
      return res.status(400).json({
        message: "Images and descriptions should have the same length.",
      });
    }

    let uploadedImages = [];

    // Uploading each file to Cloudinary
    for (let i = 0; i < filesArray.length; i++) {
      const uploadedResponse = await cloudinary.uploader.upload(filesArray[i].tempFilePath, {
        folder: "images",
      });

      if (!uploadedResponse) {
        return res.status(500).json({ message: `Error uploading image ${i + 1} to Cloudinary` });
      }

      uploadedImages.push({
        url: uploadedResponse.secure_url,
        public_id: uploadedResponse.public_id,
        description: descriptionsArray[i],
      });
    }

    const newImageEntry = new Image({
      images: uploadedImages,
    });

    await newImageEntry.save();

    res.status(200).json({ message: "Images uploaded successfully", newImageEntry });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};


exports.updateImage = async (req, res) => {
  try {
    const { id } = req.params; // Get image ID from URL parameters
    const { description } = req.body; // Get the new description from request body
    const file = req.files?.image; // Optional: new image file to replace

    const imageEntry = await Image.findById(id);

    if (!imageEntry) {
      return res.status(404).json({ message: "Image not found." });
    }

    // Update description if provided
    if (description) {
      imageEntry.images[0].description = description;
    }

    // If a new image is provided, upload to Cloudinary and replace the old image
    if (file) {
      const uploadedResponse = await cloudinary.uploader.upload(file.tempFilePath, {
        folder: "images",
      });

      // Replace the old image in the database
      imageEntry.images[0].url = uploadedResponse.secure_url;
      imageEntry.images[0].public_id = uploadedResponse.public_id;
    }

    // Save the updated image entry to the database
    await imageEntry.save();

    res.status(200).json({ message: "Image updated successfully", imageEntry });
  } catch (error) {
    console.error("Error updating image:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

exports.getAllImages = async (req, res) => {
  try {
    const images = await Image.find(); // Fetch all image documents

    if (!images || images.length === 0) {
      return res.status(404).json({ message: "No images found." });
    }

    res.status(200).json({ message: "Images retrieved successfully", images });
  } catch (error) {
    console.error("Error fetching images:", error);
    res.status(500).json({ message: "Server error", error });
  }
};


exports.getImageById = async (req, res) => {
  try {
    const { id } = req.params; // Get image ID from URL parameters
    const image = await Image.findById(id); // Find the image by ID

    if (!image) {
      return res.status(404).json({ message: "Image not found." });
    }

    res.status(200).json({ message: "Image retrieved successfully", image });
  } catch (error) {
    console.error("Error fetching image:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

exports.deleteImage = async (req, res) => {
  try {
    const { id } = req.params; 
    const imageEntry = await Image.findById(id);

    if (!imageEntry) {
      return res.status(404).json({ message: "Image not found." });
    }

    // Remove the image from Cloudinary
    await cloudinary.uploader.destroy(imageEntry.images[0].public_id);

    // Remove the image from the database
    await Image.findByIdAndDelete(id);

    res.status(200).json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
