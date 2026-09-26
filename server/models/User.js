const mongoose = require("mongoose");

// =========================
// USER SCHEMA
// =========================

const userSchema = new mongoose.Schema(
  {
    // =========================
    // BASIC INFORMATION
    // =========================

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // =========================
    // PASSWORD
    // =========================

    // Password is already hashed
    // inside the authentication route
    password: {
      type: String,
      required: true,
    },

    // =========================
    // USER ROLE
    // =========================

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    // =========================
    // PHONE NUMBER
    // =========================

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    // =========================
    // DELIVERY ADDRESS
    // =========================

    address: {
      type: String,
      trim: true,
      default: "",
    },

    city: {
      type: String,
      trim: true,
      default: "",
    },

    state: {
      type: String,
      trim: true,
      default: "",
    },

    pincode: {
      type: String,
      trim: true,
      default: "",
    },

    // =========================
    // PROFILE IMAGE
    // =========================
    // We will use this later if we
    // add profile-picture support.

    profileImage: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// =========================
// CREATE USER MODEL
// =========================

const User = mongoose.model(
  "User",
  userSchema
);

// =========================
// EXPORT MODEL
// =========================

module.exports = User;