const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    // User who receives the notification
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Notification title
    title: {
      type: String,
      required: true,
      trim: true,
    },

    // Notification message
    message: {
      type: String,
      required: true,
      trim: true,
    },

    // Notification type
    type: {
      type: String,
      enum: [
        "order",
        "stock",
        "wishlist",
        "price",
        "system",
      ],
      default: "system",
    },

    // Optional order reference
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },

    // Optional product reference
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },

    // Has user read notification?
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model(
  "Notification",
  notificationSchema
);

module.exports = Notification;