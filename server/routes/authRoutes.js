const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User = require("../models/User");
const PasswordReset = require("../models/PasswordReset");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const {
  sendPasswordResetEmail,
  sendLoginSecurityEmail,
} = require("../utils/emailService");

const router = express.Router();

// =====================================================
// CREATE JWT TOKEN
// =====================================================

const createToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

// =====================================================
// SAFE USER RESPONSE
// =====================================================

const getSafeUser = (user) => {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role || "user",
    phone: user.phone || "",
    address: user.address || "",
    city: user.city || "",
    state: user.state || "",
    pincode: user.pincode || "",
    profileImage: user.profileImage || "",
  };
};

// =====================================================
// SIGN UP
// POST /api/auth/signup
// PUBLIC
// =====================================================

router.post("/signup", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
    } = req.body;

    // Check required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all fields.",
      });
    }

    const cleanName = String(name).trim();

    const cleanEmail = String(email)
      .trim()
      .toLowerCase();

    // Validate name
    if (cleanName.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid name.",
      });
    }

    // Validate email
    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter a valid email address.",
      });
    }

    // Validate password
    if (String(password).length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters.",
      });
    }

    // Check existing account
    const existingUser = await User.findOne({
      email: cleanEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          "An account with this email already exists.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    // Create user
    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      password: hashedPassword,
      role: "user",
    });

    // Create token
    const token = createToken(user);

    return res.status(201).json({
      success: true,
      message:
        "Account created successfully.",
      token,
      user: getSafeUser(user),
    });
  } catch (error) {
    console.error("Signup error:", error);

    return res.status(500).json({
      success: false,
      message:
        "Server error during signup.",
    });
  }
});

// =====================================================
// LOGIN
// POST /api/auth/login
// PUBLIC
// =====================================================

router.post("/login", async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    // Check required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter your email and password.",
      });
    }

    const cleanEmail = String(email)
      .trim()
      .toLowerCase();

    // Find user
    const user = await User.findOne({
      email: cleanEmail,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password.",
      });
    }

    // Compare password
    const passwordMatches =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password.",
      });
    }

    // Create JWT token
    const token = createToken(user);

    // Send login security email.
    // Do not wait for the email because email failure
    // should not prevent a valid login.
    sendLoginSecurityEmail(
      user.email,
      user.name
    ).catch((emailError) => {
      console.error(
        "Login security email failed:",
        emailError.message
      );
    });

    // Login success
    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: getSafeUser(user),
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message:
        "Server error during login.",
    });
  }
});

// =====================================================
// GET CURRENT LOGGED-IN USER
// GET /api/auth/me
// PRIVATE
//
// IMPORTANT:
// Your frontend is calling /api/auth/me.
// This route prevents the 404 error you saw in Console.
// =====================================================

router.get(
  "/me",
  protect,
  async (req, res) => {
    try {
      const user = await User.findById(
        req.user._id
      ).select("-password");

      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "User account not found.",
        });
      }

      return res.status(200).json({
        success: true,
        user: getSafeUser(user),
      });
    } catch (error) {
      console.error(
        "Get current user error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Could not load user.",
      });
    }
  }
);

// =====================================================
// GET CURRENT USER PROFILE
// GET /api/auth/profile
// PRIVATE
// =====================================================

router.get(
  "/profile",
  protect,
  async (req, res) => {
    try {
      const user = await User.findById(
        req.user._id
      ).select("-password");

      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "User account not found.",
        });
      }

      return res.status(200).json({
        success: true,
        user: getSafeUser(user),
      });
    } catch (error) {
      console.error(
        "Get profile error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Could not load your profile.",
      });
    }
  }
);

// =====================================================
// FORGOT PASSWORD
// POST /api/auth/forgot-password
// PUBLIC
// =====================================================

router.post(
  "/forgot-password",
  async (req, res) => {
    let cleanEmail = "";

    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message:
            "Please enter your email address.",
        });
      }

      cleanEmail = String(email)
        .trim()
        .toLowerCase();

      const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailPattern.test(cleanEmail)) {
        return res.status(400).json({
          success: false,
          message:
            "Please enter a valid email address.",
        });
      }

      const user = await User.findOne({
        email: cleanEmail,
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "No account was found with this email address.",
        });
      }

      // Delete old reset requests
      await PasswordReset.deleteMany({
        email: cleanEmail,
      });

      // Generate six-digit reset code
      const resetCode = crypto
        .randomInt(100000, 1000000)
        .toString();

      // Hash reset code
      const hashedCode = await bcrypt.hash(
        resetCode,
        10
      );

      // Code expires after 10 minutes
      const expiresAt = new Date(
        Date.now() + 10 * 60 * 1000
      );

      // Save reset request
      await PasswordReset.create({
        email: cleanEmail,
        code: hashedCode,
        expiresAt,
        attempts: 0,
        verified: false,
      });

      // Send reset code
      try {
        await sendPasswordResetEmail(
          cleanEmail,
          resetCode
        );
      } catch (emailError) {
        await PasswordReset.deleteMany({
          email: cleanEmail,
        });

        console.error(
          "Reset email delivery failed:",
          emailError.message
        );

        return res.status(500).json({
          success: false,
          message:
            "We could not send the password reset email. Please try again.",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "A 6-digit password reset code has been sent to your email.",
        expiresInMinutes: 10,
      });
    } catch (error) {
      console.error(
        "Forgot password error:",
        error
      );

      if (cleanEmail) {
        try {
          await PasswordReset.deleteMany({
            email: cleanEmail,
          });
        } catch (cleanupError) {
          console.error(
            "Password reset cleanup error:",
            cleanupError.message
          );
        }
      }

      return res.status(500).json({
        success: false,
        message:
          "Could not create password reset request.",
      });
    }
  }
);
// =====================================================
// VERIFY PASSWORD RESET CODE
// POST /api/auth/verify-reset-code
// PUBLIC
// =====================================================

router.post(
  "/verify-reset-code",
  async (req, res) => {
    try {
      const {
        email,
        code,
      } = req.body;

      if (!email || !code) {
        return res.status(400).json({
          success: false,
          message:
            "Email and verification code are required.",
        });
      }

      const cleanEmail = String(email)
        .trim()
        .toLowerCase();

      const cleanCode = String(code).trim();

      // Find latest reset request
      const resetRequest =
        await PasswordReset.findOne({
          email: cleanEmail,
        }).sort({
          createdAt: -1,
        });

      if (!resetRequest) {
        return res.status(400).json({
          success: false,
          message:
            "No password reset request was found. Please request a new code.",
        });
      }

      // Check expiry
      if (
        new Date() >
        new Date(resetRequest.expiresAt)
      ) {
        await PasswordReset.deleteMany({
          email: cleanEmail,
        });

        return res.status(400).json({
          success: false,
          message:
            "The verification code has expired. Please request a new code.",
        });
      }

      // Limit incorrect attempts
      if (
        Number(resetRequest.attempts || 0) >= 5
      ) {
        await PasswordReset.deleteMany({
          email: cleanEmail,
        });

        return res.status(429).json({
          success: false,
          message:
            "Too many incorrect attempts. Please request a new code.",
        });
      }

      // Compare entered code with hashed code
      const codeMatches =
        await bcrypt.compare(
          cleanCode,
          resetRequest.code
        );

      if (!codeMatches) {
        resetRequest.attempts =
          Number(
            resetRequest.attempts || 0
          ) + 1;

        await resetRequest.save();

        return res.status(400).json({
          success: false,
          message:
            "Incorrect verification code.",
        });
      }

      // Mark request as verified
      resetRequest.verified = true;
      resetRequest.attempts = 0;

      await resetRequest.save();

      return res.status(200).json({
        success: true,
        message:
          "Verification code confirmed.",
      });
    } catch (error) {
      console.error(
        "Verify reset code error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Could not verify the reset code.",
      });
    }
  }
);

// =====================================================
// RESET PASSWORD
// POST /api/auth/reset-password
// PUBLIC
// =====================================================

router.post(
  "/reset-password",
  async (req, res) => {
    try {
      const {
        email,
        code,
        password,
        newPassword,
      } = req.body;

      const finalPassword =
        newPassword || password;

      if (
        !email ||
        !code ||
        !finalPassword
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Email, verification code and new password are required.",
        });
      }

      const cleanEmail = String(email)
        .trim()
        .toLowerCase();

      const cleanCode = String(code).trim();

      if (
        String(finalPassword).length < 6
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Password must be at least 6 characters.",
        });
      }

      // Find reset request
      const resetRequest =
        await PasswordReset.findOne({
          email: cleanEmail,
        }).sort({
          createdAt: -1,
        });

      if (!resetRequest) {
        return res.status(400).json({
          success: false,
          message:
            "No valid password reset request was found.",
        });
      }

      // Check expiration
      if (
        new Date() >
        new Date(resetRequest.expiresAt)
      ) {
        await PasswordReset.deleteMany({
          email: cleanEmail,
        });

        return res.status(400).json({
          success: false,
          message:
            "The verification code has expired. Please request a new code.",
        });
      }

      // Verify code again for security
      const codeMatches =
        await bcrypt.compare(
          cleanCode,
          resetRequest.code
        );

      if (!codeMatches) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid verification code.",
        });
      }

      // Find account
      const user = await User.findOne({
        email: cleanEmail,
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "User account not found.",
        });
      }

      // Prevent using same password
      const samePassword =
        await bcrypt.compare(
          finalPassword,
          user.password
        );

      if (samePassword) {
        return res.status(400).json({
          success: false,
          message:
            "Your new password must be different from your current password.",
        });
      }

      // Hash new password
      const hashedPassword =
        await bcrypt.hash(
          finalPassword,
          10
        );

      user.password = hashedPassword;

      await user.save();

      // Delete reset request after success
      await PasswordReset.deleteMany({
        email: cleanEmail,
      });

      return res.status(200).json({
        success: true,
        message:
          "Password reset successfully. You can now log in with your new password.",
      });
    } catch (error) {
      console.error(
        "Reset password error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Could not reset your password.",
      });
    }
  }
);

// =====================================================
// UPDATE CURRENT USER PROFILE
// PUT /api/auth/profile
// PRIVATE
// =====================================================

router.put(
  "/profile",
  protect,
  async (req, res) => {
    try {
      const user = await User.findById(
        req.user._id
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "User account not found.",
        });
      }

      const {
        name,
        phone,
        address,
        city,
        state,
        pincode,
        profileImage,
      } = req.body;

      if (name !== undefined) {
        const cleanName =
          String(name).trim();

        if (cleanName.length < 2) {
          return res.status(400).json({
            success: false,
            message:
              "Please enter a valid name.",
          });
        }

        user.name = cleanName;
      }

      if (phone !== undefined) {
        user.phone =
          String(phone).trim();
      }

      if (address !== undefined) {
        user.address =
          String(address).trim();
      }

      if (city !== undefined) {
        user.city =
          String(city).trim();
      }

      if (state !== undefined) {
        user.state =
          String(state).trim();
      }

      if (pincode !== undefined) {
        user.pincode =
          String(pincode).trim();
      }

      if (profileImage !== undefined) {
        user.profileImage =
          String(profileImage).trim();
      }

      const updatedUser =
        await user.save();

      return res.status(200).json({
        success: true,
        message:
          "Profile updated successfully.",
        user: getSafeUser(updatedUser),
      });
    } catch (error) {
      console.error(
        "Update profile error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Could not update your profile.",
      });
    }
  }
);

// =====================================================
// CHANGE PASSWORD
// PUT /api/auth/change-password
// PRIVATE
// =====================================================

router.put(
  "/change-password",
  protect,
  async (req, res) => {
    try {
      const {
        currentPassword,
        newPassword,
      } = req.body;

      if (
        !currentPassword ||
        !newPassword
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Current password and new password are required.",
        });
      }

      if (
        String(newPassword).length < 6
      ) {
        return res.status(400).json({
          success: false,
          message:
            "New password must be at least 6 characters.",
        });
      }

      const user = await User.findById(
        req.user._id
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "User account not found.",
        });
      }

      const currentPasswordMatches =
        await bcrypt.compare(
          currentPassword,
          user.password
        );

      if (!currentPasswordMatches) {
        return res.status(401).json({
          success: false,
          message:
            "Current password is incorrect.",
        });
      }

      const samePassword =
        await bcrypt.compare(
          newPassword,
          user.password
        );

      if (samePassword) {
        return res.status(400).json({
          success: false,
          message:
            "New password must be different from your current password.",
        });
      }

      user.password = await bcrypt.hash(
        newPassword,
        10
      );

      await user.save();

      return res.status(200).json({
        success: true,
        message:
          "Password changed successfully.",
      });
    } catch (error) {
      console.error(
        "Change password error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Could not change your password.",
      });
    }
  }
);
// =====================================================
// ADMIN - GET ALL USERS
// GET /api/auth/admin/users
// PRIVATE + ADMIN
// =====================================================

router.get(
  "/admin/users",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const users = await User.find({})
        .select("-password")
        .sort({
          createdAt: -1,
        });

      return res.status(200).json({
        success: true,
        count: users.length,
        users: users.map((user) =>
          getSafeUser(user)
        ),
      });
    } catch (error) {
      console.error(
        "Admin get users error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Could not load users.",
      });
    }
  }
);

// =====================================================
// ADMIN - GET SINGLE USER
// GET /api/auth/admin/users/:id
// PRIVATE + ADMIN
// =====================================================

router.get(
  "/admin/users/:id",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const user = await User.findById(
        req.params.id
      ).select("-password");

      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "User account not found.",
        });
      }

      return res.status(200).json({
        success: true,
        user: getSafeUser(user),
      });
    } catch (error) {
      console.error(
        "Admin get user error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Could not load user.",
      });
    }
  }
);

// =====================================================
// ADMIN - UPDATE USER ROLE
// PUT /api/auth/admin/users/:id/role
// PRIVATE + ADMIN
// =====================================================

router.put(
  "/admin/users/:id/role",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const { role } = req.body;

      if (
        !role ||
        !["user", "admin"].includes(role)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Role must be either user or admin.",
        });
      }

      const user = await User.findById(
        req.params.id
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "User account not found.",
        });
      }

      user.role = role;

      const updatedUser =
        await user.save();

      return res.status(200).json({
        success: true,
        message:
          "User role updated successfully.",
        user: getSafeUser(updatedUser),
      });
    } catch (error) {
      console.error(
        "Admin update role error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Could not update user role.",
      });
    }
  }
);

// =====================================================
// ADMIN - DELETE USER
// DELETE /api/auth/admin/users/:id
// PRIVATE + ADMIN
// =====================================================

router.delete(
  "/admin/users/:id",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const user = await User.findById(
        req.params.id
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "User account not found.",
        });
      }

      // Prevent admin from deleting their own account
      if (
        String(user._id) ===
        String(req.user._id)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "You cannot delete your own admin account.",
        });
      }

      await User.findByIdAndDelete(
        req.params.id
      );

      return res.status(200).json({
        success: true,
        message:
          "User deleted successfully.",
      });
    } catch (error) {
      console.error(
        "Admin delete user error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Could not delete user.",
      });
    }
  }
);

// =====================================================
// AUTH ROUTER READY
// =====================================================

module.exports = router;