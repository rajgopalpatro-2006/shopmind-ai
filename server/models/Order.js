const mongoose = require("mongoose");

// =========================================================
// ORDER ITEM SCHEMA
// =========================================================

const orderItemSchema = new mongoose.Schema({
  // Product reference
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },

  // Product name at the time of purchase
  name: {
    type: String,
    required: true,
    trim: true,
  },

  // Product price at the time of purchase
  price: {
    type: Number,
    required: true,
    min: 0,
  },

  // Quantity purchased
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },

  // Product emoji fallback
  icon: {
    type: String,
    default: "📦",
  },

  // =====================================================
  // PRODUCT IMAGE
  // Stores the product image URL with the order
  // =====================================================

  image: {
    type: String,
    default: "",
    trim: true,
  },
});

// =========================================================
// ORDER SCHEMA
// =========================================================

const orderSchema = new mongoose.Schema(
  {
    // =====================================================
    // USER WHO PLACED THE ORDER
    // =====================================================

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // =====================================================
    // PRODUCTS IN THE ORDER
    // =====================================================

    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: function (items) {
          return (
            Array.isArray(items) &&
            items.length > 0
          );
        },
        message:
          "Order must contain at least one product.",
      },
    },

    // =====================================================
    // DELIVERY INFORMATION
    // =====================================================

    shippingAddress: {
      fullName: {
        type: String,
        required: true,
        trim: true,
      },

      phone: {
        type: String,
        required: true,
        trim: true,
      },

      address: {
        type: String,
        required: true,
        trim: true,
      },

      city: {
        type: String,
        required: true,
        trim: true,
      },

      state: {
        type: String,
        required: true,
        trim: true,
      },

      pincode: {
        type: String,
        required: true,
        trim: true,
      },
    },

    // =====================================================
    // PAYMENT METHOD
    // =====================================================

    paymentMethod: {
      type: String,
      enum: ["COD"],
      default: "COD",
    },

    // =====================================================
    // TOTAL AMOUNT
    // =====================================================

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    // =====================================================
    // ORDER STATUS
    // =====================================================

    status: {
      type: String,
      enum: [
        "Placed",
        "Confirmed",
        "Shipped",
        "Delivered",
        "Cancelled",
      ],
      default: "Placed",
    },

    // =====================================================
    // PAYMENT STATUS
    // =====================================================

    paymentStatus: {
      type: String,
      enum: [
        "Pending",
        "Paid",
        "Failed",
      ],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

// =========================================================
// ORDER MODEL
// =========================================================

const Order = mongoose.model(
  "Order",
  orderSchema
);

module.exports = Order;