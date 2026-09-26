const express = require("express");

const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");

const {
  protect,
} = require("../middleware/authMiddleware");

const router = express.Router();

// =====================================================
// GET LOGGED-IN USER'S WISHLIST
// GET /api/wishlist
// PRIVATE
// =====================================================

router.get(
  "/",
  protect,
  async (req, res) => {
    try {
      let wishlist =
        await Wishlist.findOne({
          user: req.user._id,
        }).populate({
          path: "products",
          select:
            "name price description category icon image stock rating",
        });

      // If user does not have a wishlist yet,
      // return an empty wishlist.
      if (!wishlist) {
        return res.status(200).json({
          success: true,
          count: 0,
          products: [],
        });
      }

      return res.status(200).json({
        success: true,
        count:
          wishlist.products.length,
        products:
          wishlist.products,
      });
    } catch (error) {
      console.error(
        "Get wishlist error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Could not load wishlist.",
      });
    }
  }
);

// =====================================================
// ADD PRODUCT TO WISHLIST
// POST /api/wishlist/:productId
// PRIVATE
// =====================================================

router.post(
  "/:productId",
  protect,
  async (req, res) => {
    try {
      const {
        productId,
      } = req.params;

      // ===============================================
      // CHECK PRODUCT EXISTS
      // ===============================================

      const product =
        await Product.findById(
          productId
        );

      if (!product) {
        return res.status(404).json({
          success: false,
          message:
            "Product not found.",
        });
      }

      // ===============================================
      // FIND USER WISHLIST
      // ===============================================

      let wishlist =
        await Wishlist.findOne({
          user: req.user._id,
        });

      // ===============================================
      // CREATE WISHLIST IF NONE EXISTS
      // ===============================================

      if (!wishlist) {
        wishlist =
          await Wishlist.create({
            user: req.user._id,
            products: [
              product._id,
            ],
          });
      } else {
        // =============================================
        // CHECK FOR DUPLICATE
        // =============================================

        const alreadyExists =
          wishlist.products.some(
            (id) =>
              id.toString() ===
              productId
          );

        if (alreadyExists) {
          return res.status(200).json({
            success: true,
            message:
              "Product is already in your wishlist.",
          });
        }

        // =============================================
        // ADD PRODUCT
        // =============================================

        wishlist.products.push(
          product._id
        );

        await wishlist.save();
      }

      // ===============================================
      // POPULATE PRODUCTS
      // ===============================================

      await wishlist.populate({
        path: "products",
        select:
          "name price description category icon image stock rating",
      });

      return res.status(200).json({
        success: true,
        message:
          "Product added to wishlist.",

        count:
          wishlist.products.length,

        products:
          wishlist.products,
      });
    } catch (error) {
      console.error(
        "Add wishlist error:",
        error
      );

      // Invalid MongoDB ObjectId
      if (
        error.name ===
        "CastError"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid product ID.",
        });
      }

      return res.status(500).json({
        success: false,
        message:
          "Could not add product to wishlist.",
      });
    }
  }
);

// =====================================================
// REMOVE ONE PRODUCT FROM WISHLIST
// DELETE /api/wishlist/:productId
// PRIVATE
// =====================================================

router.delete(
  "/:productId",
  protect,
  async (req, res) => {
    try {
      const {
        productId,
      } = req.params;

      const wishlist =
        await Wishlist.findOne({
          user: req.user._id,
        });

      if (!wishlist) {
        return res.status(404).json({
          success: false,
          message:
            "Wishlist not found.",
        });
      }

      // ===============================================
      // CHECK PRODUCT EXISTS IN WISHLIST
      // ===============================================

      const productExists =
        wishlist.products.some(
          (id) =>
            id.toString() ===
            productId
        );

      if (!productExists) {
        return res.status(404).json({
          success: false,
          message:
            "Product is not in your wishlist.",
        });
      }

      // ===============================================
      // REMOVE PRODUCT
      // ===============================================

      wishlist.products =
        wishlist.products.filter(
          (id) =>
            id.toString() !==
            productId
        );

      await wishlist.save();

      // ===============================================
      // POPULATE REMAINING PRODUCTS
      // ===============================================

      await wishlist.populate({
        path: "products",
        select:
          "name price description category icon image stock rating",
      });

      return res.status(200).json({
        success: true,
        message:
          "Product removed from wishlist.",

        count:
          wishlist.products.length,

        products:
          wishlist.products,
      });
    } catch (error) {
      console.error(
        "Remove wishlist error:",
        error
      );

      if (
        error.name ===
        "CastError"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid product ID.",
        });
      }

      return res.status(500).json({
        success: false,
        message:
          "Could not remove product from wishlist.",
      });
    }
  }
);

// =====================================================
// CLEAR ENTIRE WISHLIST
// DELETE /api/wishlist
// PRIVATE
// =====================================================

router.delete(
  "/",
  protect,
  async (req, res) => {
    try {
      const wishlist =
        await Wishlist.findOne({
          user: req.user._id,
        });

      if (!wishlist) {
        return res.status(200).json({
          success: true,
          message:
            "Wishlist is already empty.",
          count: 0,
          products: [],
        });
      }

      wishlist.products = [];

      await wishlist.save();

      return res.status(200).json({
        success: true,
        message:
          "Wishlist cleared successfully.",
        count: 0,
        products: [],
      });
    } catch (error) {
      console.error(
        "Clear wishlist error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Could not clear wishlist.",
      });
    }
  }
);

module.exports = router;