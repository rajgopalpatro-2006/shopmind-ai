const express = require("express");

const Notification = require("../models/Notification");

const {
  protect,
} = require("../middleware/authMiddleware");

const router = express.Router();

// =====================================================
// GET ALL NOTIFICATIONS FOR LOGGED-IN USER
// GET /api/notifications
// =====================================================

router.get(
  "/",
  protect,
  async (req, res) => {
    try {
      const notifications =
        await Notification.find({
          user: req.user._id,
        })
          .populate(
            "product",
            "name price icon category stock"
          )
          .populate(
            "order",
            "status totalAmount paymentMethod"
          )
          .sort({
            createdAt: -1,
          });

      const unreadCount =
        await Notification.countDocuments({
          user: req.user._id,
          isRead: false,
        });

      return res.status(200).json({
        success: true,
        count: notifications.length,
        unreadCount,
        notifications,
      });
    } catch (error) {
      console.error(
        "Get notifications error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Could not load notifications.",
      });
    }
  }
);

// =====================================================
// GET UNREAD COUNT
// GET /api/notifications/unread-count
// =====================================================

router.get(
  "/unread-count",
  protect,
  async (req, res) => {
    try {
      const unreadCount =
        await Notification.countDocuments({
          user: req.user._id,
          isRead: false,
        });

      return res.status(200).json({
        success: true,
        unreadCount,
      });
    } catch (error) {
      console.error(
        "Unread notification count error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Could not load unread notification count.",
      });
    }
  }
);

// =====================================================
// MARK ALL NOTIFICATIONS AS READ
// PUT /api/notifications/read-all
//
// IMPORTANT:
// Keep this route BEFORE /:id/read
// =====================================================

router.put(
  "/read-all",
  protect,
  async (req, res) => {
    try {
      await Notification.updateMany(
        {
          user: req.user._id,
          isRead: false,
        },
        {
          $set: {
            isRead: true,
          },
        }
      );

      return res.status(200).json({
        success: true,
        message:
          "All notifications marked as read.",
      });
    } catch (error) {
      console.error(
        "Mark all notifications read error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Could not update notifications.",
      });
    }
  }
);

// =====================================================
// MARK ONE NOTIFICATION AS READ
// PUT /api/notifications/:id/read
// =====================================================

router.put(
  "/:id/read",
  protect,
  async (req, res) => {
    try {
      const notification =
        await Notification.findOne({
          _id: req.params.id,
          user: req.user._id,
        });

      if (!notification) {
        return res.status(404).json({
          success: false,
          message:
            "Notification not found.",
        });
      }

      notification.isRead = true;

      await notification.save();

      return res.status(200).json({
        success: true,
        message:
          "Notification marked as read.",
        notification,
      });
    } catch (error) {
      console.error(
        "Mark notification read error:",
        error
      );

      if (error.name === "CastError") {
        return res.status(400).json({
          success: false,
          message:
            "Invalid notification ID.",
        });
      }

      return res.status(500).json({
        success: false,
        message:
          "Could not update notification.",
      });
    }
  }
);

// =====================================================
// CLEAR ALL NOTIFICATIONS
// DELETE /api/notifications
// =====================================================

router.delete(
  "/",
  protect,
  async (req, res) => {
    try {
      const result =
        await Notification.deleteMany({
          user: req.user._id,
        });

      return res.status(200).json({
        success: true,
        message:
          "All notifications cleared successfully.",
        deletedCount:
          result.deletedCount,
      });
    } catch (error) {
      console.error(
        "Clear notifications error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Could not clear notifications.",
      });
    }
  }
);

// =====================================================
// DELETE ONE NOTIFICATION
// DELETE /api/notifications/:id
// =====================================================

router.delete(
  "/:id",
  protect,
  async (req, res) => {
    try {
      const notification =
        await Notification.findOneAndDelete({
          _id: req.params.id,
          user: req.user._id,
        });

      if (!notification) {
        return res.status(404).json({
          success: false,
          message:
            "Notification not found.",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Notification deleted successfully.",
      });
    } catch (error) {
      console.error(
        "Delete notification error:",
        error
      );

      if (error.name === "CastError") {
        return res.status(400).json({
          success: false,
          message:
            "Invalid notification ID.",
        });
      }

      return res.status(500).json({
        success: false,
        message:
          "Could not delete notification.",
      });
    }
  }
);

module.exports = router;