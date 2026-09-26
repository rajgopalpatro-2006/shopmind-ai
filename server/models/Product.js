const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    icon: {
      type: String,
      default: "🛍️",
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    // =====================================
    // INVENTORY / STOCK
    // =====================================

    stock: {
      type: Number,
      default: 10,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message:
          "Stock must be a whole number.",
      },
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model(
  "Product",
  productSchema
);

module.exports = Product;