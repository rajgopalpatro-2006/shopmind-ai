const express = require("express");

const Order = require("../models/Order");
const Product = require("../models/Product");
const Notification = require("../models/Notification");

const {
  sendSMS,
} = require("../services/smsService");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

// =====================================
// HELPER - SHORT ORDER ID
// =====================================

const getShortOrderId = (orderId) => {
  return orderId
    .toString()
    .slice(-8)
    .toUpperCase();
};

// =====================================
// HELPER - CREATE NOTIFICATION
// =====================================

const createNotification = async ({
  user,
  title,
  message,
  type = "order",
  order = null,
  product = null,
}) => {
  try {
    await Notification.create({
      user,
      title,
      message,
      type,
      order,
      product,
    });
  } catch (error) {
    // Notification failure should never
    // break the order flow.
    console.error(
      "Notification creation error:",
      error
    );
  }
};

// =====================================
// PLACE NEW ORDER
// LOGGED-IN USER
// =====================================

router.post("/", protect, async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      paymentMethod,
    } = req.body;

    // =====================================
    // VALIDATE CART
    // =====================================

    if (
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty.",
      });
    }

    // =====================================
    // VALIDATE SHIPPING ADDRESS
    // =====================================

    if (
      !shippingAddress ||
      !shippingAddress.fullName ||
      !shippingAddress.phone ||
      !shippingAddress.address ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.pincode
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide complete delivery details.",
      });
    }

    // =====================================
    // GET CURRENT PRODUCT PRICES FROM DB
    // =====================================

    const orderItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const product =
        await Product.findById(
          item.product || item._id
        );

      if (!product) {
        return res.status(404).json({
          success: false,
          message:
            "One of the products no longer exists.",
        });
      }

      const quantity =
        Number(item.quantity);

      if (
        !Number.isInteger(quantity) ||
        quantity < 1
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid product quantity.",
        });
      }

      // =====================================
      // CHECK PRODUCT STOCK
      // =====================================

      const availableStock =
        product.stock ?? 10;

      if (
        availableStock <
        quantity
      ) {
        return res.status(400).json({
          success: false,
          message:
            availableStock <= 0
              ? `${product.name} is out of stock.`
              : `Only ${availableStock} unit(s) of ${product.name} are available.`,
        });
      }

      // =====================================
      // CREATE ORDER ITEM
      // =====================================

      orderItems.push({
        product: product._id,

        name: product.name,

        price: product.price,

        quantity,

        icon:
          product.icon || "📦",
      });

      totalAmount +=
        Number(product.price) *
        quantity;
    }

    // =====================================
    // CREATE ORDER
    // =====================================

    const order =
      await Order.create({
        user: req.user._id,

        items: orderItems,

        shippingAddress: {
          fullName:
            shippingAddress.fullName.trim(),

          phone:
            shippingAddress.phone.trim(),

          address:
            shippingAddress.address.trim(),

          city:
            shippingAddress.city.trim(),

          state:
            shippingAddress.state.trim(),

          pincode:
            shippingAddress.pincode.trim(),
        },

        paymentMethod:
          paymentMethod || "COD",

        totalAmount,

        status: "Placed",

        paymentStatus: "Pending",
      });

    // =====================================
    // REDUCE PRODUCT STOCK
    // =====================================

    for (const item of orderItems) {
      await Product.findByIdAndUpdate(
        item.product,
        {
          $inc: {
            stock: -item.quantity,
          },
        }
      );
    }

    const shortOrderId =
      getShortOrderId(order._id);

    // =====================================
    // CREATE ORDER PLACED NOTIFICATION
    // =====================================

    await createNotification({
      user: req.user._id,

      title: "Order Placed 🎉",

      message:
        `Your order #${shortOrderId} has been placed successfully. ` +
        `Total amount: ₹${totalAmount}.`,

      type: "order",

      order: order._id,
    });

    // =====================================
    // SEND ORDER CONFIRMATION SMS
    // DEVELOPMENT MODE
    // =====================================

    try {
      const smsMessage =
        `ShopMind AI: Your order #${shortOrderId} ` +
        `has been placed successfully. ` +
        `Amount: Rs.${totalAmount}. ` +
        `Payment: ${order.paymentMethod}. ` +
        `Thank you for shopping with us!`;

      await sendSMS({
        phone:
          order.shippingAddress.phone,

        message:
          smsMessage,
      });
    } catch (smsError) {
      // SMS failure should NOT cancel
      // an already-created order.

      console.error(
        "Order confirmation SMS error:",
        smsError
      );
    }

    // =====================================
    // SUCCESS RESPONSE
    // =====================================

    return res.status(201).json({
      success: true,

      message:
        "Order placed successfully!",

      order,
    });
  } catch (error) {
    console.error(
      "Place order error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Could not place order.",
    });
  }
});

// =====================================
// GET MY ORDERS
// LOGGED-IN USER
// =====================================

router.get(
  "/my-orders",
  protect,
  async (req, res) => {
    try {
      const orders =
        await Order.find({
          user: req.user._id,
        }).sort({
          createdAt: -1,
        });

      return res.json({
        success: true,
        orders,
      });
    } catch (error) {
      console.error(
        "Get my orders error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Could not load your orders.",
      });
    }
  }
);

// =====================================
// GET ALL ORDERS
// ADMIN ONLY
// =====================================

router.get(
  "/admin/all",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const orders =
        await Order.find()
          .populate(
            "user",
            "name email"
          )
          .sort({
            createdAt: -1,
          });

      return res.json({
        success: true,
        orders,
      });
    } catch (error) {
      console.error(
        "Get all orders error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Could not load orders.",
      });
    }
  }
);

// =====================================
// UPDATE ORDER STATUS
// ADMIN ONLY
// =====================================

router.put(
  "/:id/status",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const {
        status,
      } = req.body;

      const allowedStatuses = [
        "Placed",
        "Confirmed",
        "Shipped",
        "Delivered",
        "Cancelled",
      ];

      if (
        !allowedStatuses.includes(
          status
        )
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Invalid order status.",
        });
      }

      const order =
        await Order.findById(
          req.params.id
        );

      if (!order) {
        return res.status(404).json({
          success: false,

          message:
            "Order not found.",
        });
      }

      // Save previous status
      const previousStatus =
        order.status;

      // =====================================
      // PREVENT DUPLICATE STOCK RETURN
      // =====================================

      if (
        previousStatus === "Cancelled" &&
        status !== "Cancelled"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "A cancelled order cannot be moved to another status.",
        });
      }

      if (
        previousStatus === "Delivered" &&
        status !== "Delivered"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "A delivered order cannot be moved to another status.",
        });
      }

      order.status =
        status;

      // =====================================
      // COD BECOMES PAID WHEN DELIVERED
      // =====================================

      if (
        status === "Delivered" &&
        order.paymentMethod ===
          "COD"
      ) {
        order.paymentStatus =
          "Paid";
      }

      await order.save();

      const shortOrderId =
        getShortOrderId(order._id);

      // =====================================
      // STATUS NOTIFICATION
      // =====================================

      if (
        previousStatus !==
        status
      ) {
        let notificationTitle = "";
        let notificationMessage = "";

        if (
          status === "Confirmed"
        ) {
          notificationTitle =
            "Order Confirmed ✅";

          notificationMessage =
            `Your order #${shortOrderId} has been confirmed. ` +
            `We will notify you when it is shipped.`;
        }

        if (
          status === "Shipped"
        ) {
          notificationTitle =
            "Order Shipped 🚚";

          notificationMessage =
            `Your order #${shortOrderId} has been shipped ` +
            `and is on the way.`;
        }

        if (
          status === "Delivered"
        ) {
          notificationTitle =
            "Order Delivered 📦";

          notificationMessage =
            `Your order #${shortOrderId} has been delivered successfully. ` +
            `Thank you for shopping with ShopMind AI!`;
        }

        if (
          status === "Cancelled"
        ) {
          notificationTitle =
            "Order Cancelled ❌";

          notificationMessage =
            `Your order #${shortOrderId} has been cancelled.`;
        }

        if (
          notificationTitle &&
          notificationMessage
        ) {
          await createNotification({
            user: order.user,

            title:
              notificationTitle,

            message:
              notificationMessage,

            type: "order",

            order: order._id,
          });
        }
      }

      // =====================================
      // STATUS SMS
      // DEVELOPMENT MODE
      // =====================================

      if (
        previousStatus !==
        status
      ) {
        try {
          let smsMessage = "";

          if (
            status ===
              "Confirmed"
          ) {
            smsMessage =
              `ShopMind AI: Your order #${shortOrderId} ` +
              `has been confirmed. ` +
              `We will notify you when it is shipped.`;
          }

          if (
            status ===
              "Shipped"
          ) {
            smsMessage =
              `ShopMind AI: Your order #${shortOrderId} ` +
              `has been shipped and is on the way.`;
          }

          if (
            status ===
              "Delivered"
          ) {
            smsMessage =
              `ShopMind AI: Your order #${shortOrderId} ` +
              `has been delivered successfully. ` +
              `Thank you for shopping with us!`;
          }

          if (
            status ===
              "Cancelled"
          ) {
            smsMessage =
              `ShopMind AI: Your order #${shortOrderId} ` +
              `has been cancelled.`;
          }

          if (smsMessage) {
            await sendSMS({
              phone:
                order
                  .shippingAddress
                  .phone,

              message:
                smsMessage,
            });
          }
        } catch (smsError) {
          console.error(
            "Order status SMS error:",
            smsError
          );
        }
      }

      // =====================================
      // RETURN STOCK IF ADMIN CANCELS ORDER
      // =====================================

      if (
        previousStatus !== "Cancelled" &&
        status === "Cancelled"
      ) {
        for (
          const item of
          order.items
        ) {
          await Product.findByIdAndUpdate(
            item.product,
            {
              $inc: {
                stock:
                  item.quantity,
              },
            }
          );
        }
      }

      return res.json({
        success: true,

        message:
          "Order status updated successfully.",

        order,
      });
    } catch (error) {
      console.error(
        "Update order status error:",
        error
      );

      if (
        error.name ===
          "CastError"
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Invalid order ID.",
        });
      }

      return res.status(500).json({
        success: false,

        message:
          "Could not update order.",
      });
    }
  }
);

// =====================================
// CANCEL MY ORDER
// USER
// =====================================

router.put(
  "/:id/cancel",
  protect,
  async (req, res) => {
    try {
      const order =
        await Order.findOne({
          _id: req.params.id,

          user:
            req.user._id,
        });

      if (!order) {
        return res.status(404).json({
          success: false,

          message:
            "Order not found.",
        });
      }

      if (
        order.status ===
          "Shipped" ||
        order.status ===
          "Delivered" ||
        order.status ===
          "Cancelled"
      ) {
        return res.status(400).json({
          success: false,

          message:
            "This order cannot be cancelled.",
        });
      }

      order.status =
        "Cancelled";

      await order.save();

      // =====================================
      // RETURN STOCK AFTER CANCELLATION
      // =====================================

      for (
        const item of
        order.items
      ) {
        await Product.findByIdAndUpdate(
          item.product,
          {
            $inc: {
              stock:
                item.quantity,
            },
          }
        );
      }

      const shortOrderId =
        getShortOrderId(order._id);

      // =====================================
      // CREATE CANCELLATION NOTIFICATION
      // =====================================

      await createNotification({
        user: req.user._id,

        title:
          "Order Cancelled ❌",

        message:
          `Your order #${shortOrderId} ` +
          `has been cancelled successfully.`,

        type: "order",

        order: order._id,
      });

      // =====================================
      // CANCELLATION SMS
      // DEVELOPMENT MODE
      // =====================================

      try {
        const smsMessage =
          `ShopMind AI: Your order #${shortOrderId} ` +
          `has been cancelled successfully.`;

        await sendSMS({
          phone:
            order.shippingAddress
              .phone,

          message:
            smsMessage,
        });
      } catch (smsError) {
        console.error(
          "Cancellation SMS error:",
          smsError
        );
      }

      return res.json({
        success: true,

        message:
          "Order cancelled successfully.",

        order,
      });
    } catch (error) {
      console.error(
        "Cancel order error:",
        error
      );

      if (
        error.name ===
          "CastError"
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Invalid order ID.",
        });
      }

      return res.status(500).json({
        success: false,

        message:
          "Could not cancel order.",
      });
    }
  }
);

module.exports = router;