const mongoose = require("mongoose");

const quotationSchema = new mongoose.Schema({
  client: {
    name: { type: String, required: true },
    number: { type: String, required: true },
    address: { type: String, required: true },
  },
  items: [
    {
      description: { type: String, required: true },
      rate: { type: Number, required: true },
    },
  ],
  subtotal: { type: Number, required: true },
  discount: { type: Number, required: true },
  grandTotal: { type: Number, required: true },
  clientSignature: [
    {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
  ],
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending", // Default status before client review
  },
  rejectionReason: { type: String, default: "" }, // Optional, to be added upon rejection
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update the `updatedAt` field on document save
quotationSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Quotation = mongoose.model("Quotation", quotationSchema);

module.exports = Quotation;
