const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    // =====================================
    // PRODUCT
    // =====================================

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    // =====================================
    // USER
    // =====================================

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Store user name for easy display
    userName: {
      type: String,
      required: true,
      trim: true,
    },

    // =====================================
    // RATING
    // =====================================

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    // =====================================
    // REVIEW
    // =====================================

    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

// =====================================
// ONE REVIEW PER USER PER PRODUCT
// =====================================

reviewSchema.index(
  {
    product: 1,
    user: 1,
  },
  {
    unique: true,
  }
);

const Review = mongoose.model(
  "Review",
  reviewSchema
);

module.exports = Review;