const express = require("express");
const Product = require("../models/Product");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

// =====================================
// GET ALL PRODUCTS
// PUBLIC
// =====================================

router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error(
      "Get products error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Could not load products.",
    });
  }
});

// =====================================
// GET SINGLE PRODUCT
// PUBLIC
// =====================================

router.get("/:id", async (req, res) => {
  try {
    const product =
      await Product.findById(
        req.params.id
      );

    if (!product) {
      return res.status(404).json({
        success: false,
        message:
          "Product not found.",
      });
    }

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error(
      "Get product error:",
      error
    );

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message:
          "Invalid product ID.",
      });
    }

    res.status(500).json({
      success: false,
      message:
        "Could not load product.",
    });
  }
});

// =====================================
// ADD PRODUCT
// ADMIN ONLY
// =====================================

router.post(
  "/",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const {
        name,
        category,
        price,
        icon,
        rating,
        description,
        stock,
      } = req.body;

      // =====================================
      // REQUIRED FIELDS
      // =====================================

      if (
        !name ||
        !category ||
        price === undefined ||
        price === null ||
        price === ""
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Name, category and price are required.",
        });
      }

      const numericPrice =
        Number(price);

      const numericRating =
        rating !== undefined &&
        rating !== null &&
        rating !== ""
          ? Number(rating)
          : 0;

      const numericStock =
        stock !== undefined &&
        stock !== null &&
        stock !== ""
          ? Number(stock)
          : 10;

      // =====================================
      // PRICE VALIDATION
      // =====================================

      if (
        !Number.isFinite(
          numericPrice
        ) ||
        numericPrice < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Please enter a valid product price.",
        });
      }

      // =====================================
      // RATING VALIDATION
      // =====================================

      if (
        !Number.isFinite(
          numericRating
        ) ||
        numericRating < 0 ||
        numericRating > 5
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Rating must be between 0 and 5.",
        });
      }

      // =====================================
      // STOCK VALIDATION
      // =====================================

      if (
        !Number.isInteger(
          numericStock
        ) ||
        numericStock < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Stock must be a whole number of 0 or more.",
        });
      }

      // =====================================
      // CREATE PRODUCT
      // =====================================

      const product =
        await Product.create({
          name: name.trim(),

          category:
            category.trim(),

          price:
            numericPrice,

          icon:
            icon?.trim() ||
            "🛍️",

          rating:
            numericRating,

          description:
            description?.trim() ||
            "",

          stock:
            numericStock,
        });

      res.status(201).json({
        success: true,
        message:
          "Product added successfully.",
        product,
      });
    } catch (error) {
      console.error(
        "Add product error:",
        error
      );

      // MONGOOSE VALIDATION
      if (
        error.name ===
        "ValidationError"
      ) {
        return res.status(400).json({
          success: false,
          message:
            Object.values(
              error.errors
            )[0]?.message ||
            "Invalid product data.",
        });
      }

      res.status(500).json({
        success: false,
        message:
          "Could not add product.",
      });
    }
  }
);

// =====================================
// UPDATE PRODUCT
// ADMIN ONLY
// =====================================

router.put(
  "/:id",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const {
        name,
        category,
        price,
        icon,
        rating,
        description,
        stock,
      } = req.body;

      // =====================================
      // FIND PRODUCT
      // =====================================

      const product =
        await Product.findById(
          req.params.id
        );

      if (!product) {
        return res.status(404).json({
          success: false,
          message:
            "Product not found.",
        });
      }

      // =====================================
      // UPDATE NAME
      // =====================================

      if (
        name !== undefined
      ) {
        const cleanName =
          String(name).trim();

        if (!cleanName) {
          return res.status(400).json({
            success: false,
            message:
              "Product name cannot be empty.",
          });
        }

        product.name =
          cleanName;
      }

      // =====================================
      // UPDATE CATEGORY
      // =====================================

      if (
        category !== undefined
      ) {
        const cleanCategory =
          String(
            category
          ).trim();

        if (!cleanCategory) {
          return res.status(400).json({
            success: false,
            message:
              "Product category cannot be empty.",
          });
        }

        product.category =
          cleanCategory;
      }

      // =====================================
      // UPDATE PRICE
      // =====================================

      if (
        price !== undefined
      ) {
        const numericPrice =
          Number(price);

        if (
          !Number.isFinite(
            numericPrice
          ) ||
          numericPrice < 0
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Please enter a valid product price.",
          });
        }

        product.price =
          numericPrice;
      }

      // =====================================
      // UPDATE ICON
      // =====================================

      if (
        icon !== undefined
      ) {
        product.icon =
          String(icon).trim() ||
          "🛍️";
      }

      // =====================================
      // UPDATE RATING
      // =====================================

      if (
        rating !== undefined
      ) {
        const numericRating =
          Number(rating);

        if (
          !Number.isFinite(
            numericRating
          ) ||
          numericRating < 0 ||
          numericRating > 5
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Rating must be between 0 and 5.",
          });
        }

        product.rating =
          numericRating;
      }

      // =====================================
      // UPDATE DESCRIPTION
      // =====================================

      if (
        description !==
        undefined
      ) {
        product.description =
          String(
            description
          ).trim();
      }

      // =====================================
      // UPDATE STOCK
      // =====================================

      if (
        stock !== undefined
      ) {
        const numericStock =
          Number(stock);

        if (
          !Number.isInteger(
            numericStock
          ) ||
          numericStock < 0
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Stock must be a whole number of 0 or more.",
          });
        }

        product.stock =
          numericStock;
      }

      // =====================================
      // SAVE PRODUCT
      // =====================================

      await product.save();

      res.json({
        success: true,
        message:
          "Product updated successfully.",
        product,
      });
    } catch (error) {
      console.error(
        "Update product error:",
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

      if (
        error.name ===
        "ValidationError"
      ) {
        return res.status(400).json({
          success: false,
          message:
            Object.values(
              error.errors
            )[0]?.message ||
            "Invalid product data.",
        });
      }

      res.status(500).json({
        success: false,
        message:
          "Could not update product.",
      });
    }
  }
);

// =====================================
// DELETE PRODUCT
// ADMIN ONLY
// =====================================

router.delete(
  "/:id",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const product =
        await Product.findByIdAndDelete(
          req.params.id
        );

      if (!product) {
        return res.status(404).json({
          success: false,
          message:
            "Product not found.",
        });
      }

      res.json({
        success: true,
        message:
          "Product deleted successfully.",
        product,
      });
    } catch (error) {
      console.error(
        "Delete product error:",
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

      res.status(500).json({
        success: false,
        message:
          "Could not delete product.",
      });
    }
  }
);

module.exports = router;