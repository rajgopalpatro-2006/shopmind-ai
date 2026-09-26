const jwt = require("jsonwebtoken");

// =====================================
// VERIFY USER TOKEN
// =====================================

const protect = (req, res, next) => {
  try {
    const authHeader =
      req.headers.authorization;

    // =========================
    // CHECK AUTH HEADER
    // =========================

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Access denied. No token provided.",
      });
    }

    // =========================
    // GET TOKEN
    // =========================

    const token =
      authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message:
          "Access denied. Invalid token.",
      });
    }

    // =========================
    // CHECK JWT SECRET
    // =========================

    if (!process.env.JWT_SECRET) {
      console.error(
        "JWT_SECRET is missing from .env"
      );

      return res.status(500).json({
        success: false,
        message:
          "Server authentication configuration error.",
      });
    }

    // =========================
    // VERIFY TOKEN
    // =========================

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // =========================
    // GET USER ID FROM TOKEN
    // =========================

    const userId =
      decoded._id ||
      decoded.id ||
      decoded.userId;

    if (!userId) {
      console.error(
        "JWT does not contain a user ID:",
        decoded
      );

      return res.status(401).json({
        success: false,
        message:
          "Invalid authentication token. Please login again.",
      });
    }

    // =========================
    // NORMALIZE USER DATA
    // =========================
    // Now every route can safely use:
    // req.user._id

    req.user = {
      ...decoded,
      _id: userId,
      id: userId,
    };

    next();
  } catch (error) {
    console.error(
      "Token verification error:",
      error.message
    );

    if (
      error.name ===
      "TokenExpiredError"
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Your login session has expired. Please login again.",
      });
    }

    return res.status(401).json({
      success: false,
      message:
        "Invalid or expired token.",
    });
  }
};

// =====================================
// ADMIN ONLY
// =====================================

const adminOnly = (
  req,
  res,
  next
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message:
        "Authentication required.",
    });
  }

  if (
    req.user.role !== "admin"
  ) {
    return res.status(403).json({
      success: false,
      message:
        "Admin access required.",
    });
  }

  next();
};

module.exports = {
  protect,
  adminOnly,
};