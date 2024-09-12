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

// update quotation
exports.updateQuotation = async (req, res) => {
  try {
    const {
      name,
      number,
      address,
      items,
      subtotal,
      discount,
      grandTotal,
      status,
      rejectionReason,
    } = req.body;

    // Build the update object
    let updateData = {
      client: {},
      items,
      subtotal,
      discount,
      grandTotal,
      status: status || "pending",
      rejectionReason: rejectionReason || "",
    };

    if (name) updateData.client.name = name;
    if (number) updateData.client.number = number;
    if (address) updateData.client.address = address;

    // Find and update the quotation (except clientSignature)
    const updatedQuotation = await Quotation.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    // Return the updated quotation
    res.json(updatedQuotation);
  } catch (error) {
    console.error("Error updating quotation:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//update signature
exports.updateSignature = async (req, res) => {
  try {
    const { signature } = req.body;

    if (signature) {
      const uploadedResponse = await cloudinary.uploader.upload(signature, {
        folder: "signatures",
      });

      // Update the quotation with the signature's public ID and URL
      const updatedQuotation = await Quotation.findByIdAndUpdate(
        req.params.id,
        {
          clientSignature: {
            public_id: uploadedResponse.public_id,
            url: uploadedResponse.secure_url,
          },
        },
        { new: true }
      );

      res.json(updatedQuotation);
    } else {
      res.status(400).json({ message: "No signature provided" });
    }
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
