const mongoose = require("mongoose");

// =====================================================
// WISHLIST SCHEMA
// =====================================================

const wishlistSchema = new mongoose.Schema(
  {
    // ===============================================
    // USER WHO OWNS THE WISHLIST
    // ===============================================

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // ===============================================
    // PRODUCTS SAVED IN WISHLIST
    // ===============================================

    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// =====================================================
// PREVENT DUPLICATE PRODUCTS
// =====================================================
//
// We will also prevent duplicates inside the routes.
// This model keeps one wishlist document per user.
//
// Example:
//
// {
//   user: "USER_ID",
//   products: [
//     "PRODUCT_ID_1",
//     "PRODUCT_ID_2"
//   ]
// }
//
// =====================================================

// =====================================================
// CREATE MODEL
// =====================================================

const Wishlist = mongoose.model(
  "Wishlist",
  wishlistSchema
);

// =====================================================
// EXPORT MODEL
// =====================================================

module.exports = Wishlist;