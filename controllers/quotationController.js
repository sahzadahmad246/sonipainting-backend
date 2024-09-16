const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const DataURIParser = require("datauri/parser");

const Quotation = require("../database/quotationSchema");

// create quotation
exports.createQuotation = async (req, res) => {
  try {
    const newQuotation = new Quotation(req.body);
    const savedQuotation = await newQuotation.save();
    res.status(201).json(savedQuotation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//update signature
exports.updateSignature = async (req, res) => {
  try {
    const { signature } = req.body;

    if (signature) {
      // Upload the signature to Cloudinary
      const uploadedResponse = await cloudinary.uploader
        .upload(signature, {
          folder: "signatures",
        })
        .catch((err) => {
          return res
            .status(500)
            .json({ message: "Error uploading signature to Cloudinary" });
        });

      const updatedQuotation = await Quotation.findByIdAndUpdate(
        req.params.id,
        {
          clientSignature: {
            public_id: uploadedResponse.public_id,
            url: uploadedResponse.secure_url,
          },
          status: "accepted",
          rejectionReason: " ",
        },
        { new: true } // Return the updated document
      );

      res.json(updatedQuotation);
    } else {
      res.status(400).json({ message: "No signature provided" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

//update Quotation
exports.updateQuotation = async (req, res) => {
  try {
    const {
      client,
      items,
      subtotal,
      discount,
      grandTotal,
      status,
      rejectionReason,
    } = req.body;

    // Build the update object
    let updateData = {};

    // Check if client data exists, and update it if provided
    if (client) {
      updateData.client = {};
      if (client.name) updateData.client.name = client.name;
      if (client.number) updateData.client.number = client.number;
      if (client.address) updateData.client.address = client.address;
    }

    // Only add fields to updateData if they are provided in the request
    if (items) updateData.items = items;
    if (subtotal) updateData.subtotal = subtotal;
    if (discount) updateData.discount = discount;
    if (grandTotal) updateData.grandTotal = grandTotal;
    if (status) updateData.status = status;
    if (rejectionReason) updateData.rejectionReason = rejectionReason;

    // Find and update the quotation (except clientSignature)
    const updatedQuotation = await Quotation.findByIdAndUpdate(
      req.params.id,
      { $set: updateData }, // Only update provided fields
      { new: true }
    );

    // Return the updated quotation
    res.json(updatedQuotation);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
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
