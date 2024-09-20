const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Middleware to hash the password before saving the user
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Middleware to update the updatedAt field before save
userSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to generate JWT
userSchema.methods.generateJwtToken = function () {
  return jwt.sign(
    { id: this._id, isAdmin: this.isAdmin }, // Payload
    process.env.JWT_SECRET, // Secret key (keep it in environment variables)
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" } // Token expiration (default: 7 days)
  );
};

const User = mongoose.model("User", userSchema);

module.exports = User;
