const dns = require("dns");

// =====================================================
// DNS SETTINGS
// Helps with MongoDB Atlas DNS resolution
// =====================================================

dns.setServers([
  "8.8.8.8",
  "1.1.1.1",
]);

// =====================================================
// IMPORTS
// =====================================================

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

require("dotenv").config();

// =====================================================
// ROUTES
// =====================================================

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");

// =====================================================
// APP
// =====================================================

const app = express();

const PORT = process.env.PORT || 5000;

// =====================================================
// ALLOWED FRONTEND URLS
// =====================================================

const allowedOrigins = [
  // Local development
  "http://localhost:5173",

  // Deployed ShopMind AI frontend
  "https://shopmind-ai-1.onrender.com",
];

// Add CLIENT_URL from Render environment variables
if (
  process.env.CLIENT_URL &&
  !allowedOrigins.includes(process.env.CLIENT_URL)
) {
  allowedOrigins.push(process.env.CLIENT_URL);
}

console.log("Allowed CORS origins:", allowedOrigins);

// =====================================================
// CORS CONFIGURATION
// =====================================================

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests without an Origin header.
    // Examples:
    // Postman
    // Render health checks
    // server-to-server requests

    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log("Blocked by CORS:", origin);

    return callback(
      new Error("Not allowed by CORS")
    );
  },

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
  ],

  credentials: true,

  optionsSuccessStatus: 200,
};

// Apply CORS middleware
app.use(cors(corsOptions));

// =====================================================
// BODY PARSERS
// =====================================================

app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

// =====================================================
// HOME ROUTE
// =====================================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,

    message:
      "ShopMind AI backend is running 🚀",

    environment:
      process.env.NODE_ENV ||
      "development",
  });
});

// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "healthy",

    message:
      "ShopMind AI API is online.",
  });
});

// =====================================================
// TEST ROUTE
// =====================================================

app.get("/api/test", (req, res) => {
  res.status(200).json({
    success: true,

    message:
      "Frontend can connect to ShopMind AI API.",
  });
});

// =====================================================
// AUTHENTICATION ROUTES
// =====================================================

app.use(
  "/api/auth",
  authRoutes
);

// Available routes may include:
//
// POST /api/auth/signup
// POST /api/auth/login
// POST /api/auth/forgot-password
// POST /api/auth/verify-reset-code
// POST /api/auth/reset-password
// GET  /api/auth/profile
// PUT  /api/auth/profile
// PUT  /api/auth/change-password

// =====================================================
// PRODUCT ROUTES
// =====================================================

app.use(
  "/api/products",
  productRoutes
);

// =====================================================
// ORDER ROUTES
// =====================================================

app.use(
  "/api/orders",
  orderRoutes
);

// =====================================================
// REVIEW ROUTES
// =====================================================

app.use(
  "/api/reviews",
  reviewRoutes
);

// =====================================================
// NOTIFICATION ROUTES
// =====================================================

app.use(
  "/api/notifications",
  notificationRoutes
);

// =====================================================
// WISHLIST ROUTES
// =====================================================

app.use(
  "/api/wishlist",
  wishlistRoutes
);

// =====================================================
// 404 ROUTE
// =====================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,

    message:
      "API route not found.",
  });
});

// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================

app.use(
  (
    error,
    req,
    res,
    next
  ) => {
    console.error(
      "Server error:",
      error.message
    );

    // -----------------------------------------------
    // CORS ERROR
    // -----------------------------------------------

    if (
      error.message ===
      "Not allowed by CORS"
    ) {
      return res
        .status(403)
        .json({
          success: false,

          message:
            "This origin is not allowed to access the API.",
        });
    }

    // -----------------------------------------------
    // GENERAL SERVER ERROR
    // -----------------------------------------------

    return res
      .status(500)
      .json({
        success: false,

        message:
          "Internal server error.",
      });
  }
);

// =====================================================
// CONNECT TO MONGODB AND START SERVER
// =====================================================

const startServer = async () => {
  try {
    // =================================================
    // CHECK REQUIRED ENVIRONMENT VARIABLES
    // =================================================

    if (!process.env.MONGO_URI) {
      throw new Error(
        "MONGO_URI is missing."
      );
    }

    if (!process.env.JWT_SECRET) {
      throw new Error(
        "JWT_SECRET is missing."
      );
    }

    // =================================================
    // CONNECT TO MONGODB
    // =================================================

    await mongoose.connect(
      process.env.MONGO_URI
    );

    console.log(
      "MongoDB connected successfully ✅"
    );

    // =================================================
    // START EXPRESS SERVER
    // =================================================

    app.listen(
      PORT,
      "0.0.0.0",
      () => {
        console.log(
          `ShopMind AI server running on port ${PORT} 🚀`
        );

        console.log(
          `Environment: ${
            process.env.NODE_ENV ||
            "development"
          }`
        );
      }
    );
  } catch (error) {
    console.error(
      "Server startup failed ❌"
    );

    console.error(
      error.message
    );

    process.exit(1);
  }
};

// =====================================================
// START SERVER
// =====================================================

startServer();