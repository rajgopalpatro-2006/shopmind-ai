const express = require("express");

const Review = require("../models/Review");
const Product = require("../models/Product");

const {
  protect,
} = require("../middleware/authMiddleware");

const router = express.Router();

// =====================================================
// HELPER: UPDATE PRODUCT AVERAGE RATING
// =====================================================

const updateProductRating = async (productId) => {
  const reviews = await Review.find({
    product: productId,
  });

  let averageRating = 0;

  if (reviews.length > 0) {
    const totalRating = reviews.reduce(
      (total, review) =>
        total + Number(review.rating),
      0
    );

    averageRating =
      totalRating / reviews.length;
  }

  averageRating =
    Math.round(averageRating * 10) / 10;

  await Product.findByIdAndUpdate(
    productId,
    {
      rating: averageRating,
    },
    {
      runValidators: true,
    }
  );

  return {
    averageRating,
    reviewCount: reviews.length,
  };
};

// =====================================================
// GET REVIEWS FOR ONE PRODUCT
// PUBLIC
// =====================================================

router.get(
  "/product/:productId",
  async (req, res) => {
    try {
      const product =
        await Product.findById(
          req.params.productId
        );

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found.",
        });
      }

      const reviews = await Review.find({
        product: req.params.productId,
      }).sort({
        createdAt: -1,
      });

      const ratingInfo =
        await updateProductRating(
          req.params.productId
        );

      res.json({
        success: true,
        reviews,
        reviewCount:
          ratingInfo.reviewCount,
        averageRating:
          ratingInfo.averageRating,
      });
    } catch (error) {
      console.error(
        "Get reviews error:",
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
          "Could not load reviews.",
      });
    }
  }
);

// =====================================================
// CREATE REVIEW
// LOGGED-IN USER
// =====================================================

router.post(
  "/product/:productId",
  protect,
  async (req, res) => {
    try {
      const { rating, comment } =
        req.body;

      const numericRating =
        Number(rating);

      // -------------------------------------
      // VALIDATION
      // -------------------------------------

      if (
        !Number.isInteger(
          numericRating
        ) ||
        numericRating < 1 ||
        numericRating > 5
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Rating must be between 1 and 5.",
        });
      }

      if (
        !comment ||
        !comment.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Please write a review.",
        });
      }

      if (
        comment.trim().length >
        1000
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Review cannot exceed 1000 characters.",
        });
      }

      // -------------------------------------
      // PRODUCT EXISTS?
      // -------------------------------------

      const product =
        await Product.findById(
          req.params.productId
        );

      if (!product) {
        return res.status(404).json({
          success: false,
          message:
            "Product not found.",
        });
      }

      // -------------------------------------
      // EXISTING REVIEW?
      // -------------------------------------

      const existingReview =
        await Review.findOne({
          product:
            req.params.productId,
          user: req.user._id,
        });

      if (existingReview) {
        return res.status(400).json({
          success: false,
          message:
            "You have already reviewed this product. You can edit your existing review.",
        });
      }

      // -------------------------------------
      // CREATE REVIEW
      // -------------------------------------

      const review =
        await Review.create({
          product:
            req.params.productId,

          user: req.user._id,

          userName:
            req.user.name ||
            "ShopMind User",

          rating:
            numericRating,

          comment:
            comment.trim(),
        });

      // -------------------------------------
      // UPDATE PRODUCT RATING
      // -------------------------------------

      const ratingInfo =
        await updateProductRating(
          req.params.productId
        );

      res.status(201).json({
        success: true,
        message:
          "Review submitted successfully.",
        review,
        averageRating:
          ratingInfo.averageRating,
        reviewCount:
          ratingInfo.reviewCount,
      });
    } catch (error) {
      console.error(
        "Create review error:",
        error
      );

      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message:
            "You have already reviewed this product.",
        });
      }

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
          "Could not submit review.",
      });
    }
  }
);

// =====================================================
// UPDATE MY REVIEW
// LOGGED-IN USER
// =====================================================

router.put(
  "/:reviewId",
  protect,
  async (req, res) => {
    try {
      const { rating, comment } =
        req.body;

      const review =
        await Review.findOne({
          _id: req.params.reviewId,
          user: req.user._id,
        });

      if (!review) {
        return res.status(404).json({
          success: false,
          message:
            "Review not found.",
        });
      }

      // -------------------------------------
      // UPDATE RATING
      // -------------------------------------

      if (
        rating !== undefined
      ) {
        const numericRating =
          Number(rating);

        if (
          !Number.isInteger(
            numericRating
          ) ||
          numericRating < 1 ||
          numericRating > 5
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Rating must be between 1 and 5.",
          });
        }

        review.rating =
          numericRating;
      }

      // -------------------------------------
      // UPDATE COMMENT
      // -------------------------------------

      if (
        comment !== undefined
      ) {
        if (
          !comment ||
          !comment.trim()
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Review cannot be empty.",
          });
        }

        if (
          comment.trim().length >
          1000
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Review cannot exceed 1000 characters.",
          });
        }

        review.comment =
          comment.trim();
      }

      await review.save();

      const ratingInfo =
        await updateProductRating(
          review.product
        );

      res.json({
        success: true,
        message:
          "Review updated successfully.",
        review,
        averageRating:
          ratingInfo.averageRating,
        reviewCount:
          ratingInfo.reviewCount,
      });
    } catch (error) {
      console.error(
        "Update review error:",
        error
      );

      if (error.name === "CastError") {
        return res.status(400).json({
          success: false,
          message:
            "Invalid review ID.",
        });
      }

      res.status(500).json({
        success: false,
        message:
          "Could not update review.",
      });
    }
  }
);

// =====================================================
// DELETE MY REVIEW
// LOGGED-IN USER
// =====================================================

router.delete(
  "/:reviewId",
  protect,
  async (req, res) => {
    try {
      const review =
        await Review.findOne({
          _id: req.params.reviewId,
          user: req.user._id,
        });

      if (!review) {
        return res.status(404).json({
          success: false,
          message:
            "Review not found.",
        });
      }

      const productId =
        review.product;

      await Review.findByIdAndDelete(
        review._id
      );

      const ratingInfo =
        await updateProductRating(
          productId
        );

      res.json({
        success: true,
        message:
          "Review deleted successfully.",
        averageRating:
          ratingInfo.averageRating,
        reviewCount:
          ratingInfo.reviewCount,
      });
    } catch (error) {
      console.error(
        "Delete review error:",
        error
      );

      if (error.name === "CastError") {
        return res.status(400).json({
          success: false,
          message:
            "Invalid review ID.",
        });
      }

      res.status(500).json({
        success: false,
        message:
          "Could not delete review.",
      });
    }
  }
);

module.exports = router;