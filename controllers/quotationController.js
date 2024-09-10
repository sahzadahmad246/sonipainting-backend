const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const DataURIParser = require("datauri/parser");
const parser = new DataURIParser();
const Quotation = require("../database/quotationSchema");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.updateQuotation = async (req, res) => {
  try {
    const { id } = req.params;
    const formData = req.files; // Assuming the signature is in `req.files`

    if (!formData.signature) {
      return res.status(400).json({ message: "No signature file found" });
    }

    // Upload the signature image to Cloudinary
    const result = await cloudinary.uploader.upload(formData.signature.tempFilePath, {
      folder: "signatures", // Optional: you can specify a folder
      public_id: `signature_${id}`, // Optional: create a unique public_id
      resource_type: "image",
    });

    // Update the quotation in the database
    const updatedQuotation = await Quotation.findByIdAndUpdate(
      id,
      {
        $set: {
          signatureUrl: result.secure_url, // Store the Cloudinary URL
          signaturePublicId: result.public_id, // Store the Cloudinary public ID
        },
      },
      { new: true }
    );

    if (!updatedQuotation) {
      return res.status(404).json({ message: "Quotation not found" });
    }

    res.status(200).json({ message: "Quotation updated successfully", data: updatedQuotation });
  } catch (error) {
    console.error("Error updating quotation:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    // Clean up temporary files
    if (req.files && req.files.signature) {
      fs.unlinkSync(req.files.signature.tempFilePath);
    }
  }
};

exports.createQuotation = async (req, res) => {
  try {
    const newQuotation = new Quotation(req.body);
    const savedQuotation = await newQuotation.save();
    res.status(201).json(savedQuotation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a quotation
exports.deleteQuotation = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedQuotation = await Quotation.findByIdAndDelete(id);
    if (!deletedQuotation) {
      return res.status(404).json({ error: "Quotation not found" });
    }
    res.json({ message: "Quotation deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get a single quotation by ID
exports.getQuotationById = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id); // Fetch the quotation by ID
    if (!quotation) {
      return res.status(404).json({ message: "Quotation not found" });
    }
    res.json(quotation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get all quotations
exports.getAllQuotations = async (req, res) => {
  try {
    const quotations = await Quotation.find();
    res.json(quotations);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
