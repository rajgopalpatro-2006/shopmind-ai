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

    profileImage:
      user.profileImage || "",
  };
};

// =====================================================
// SIGN UP
// POST /api/auth/signup
// PUBLIC
// =====================================================

router.post(
  "/signup",
  async (req, res) => {
    try {
      const {
        name,
        email,
        password,
      } = req.body;

      // =================================
      // CHECK REQUIRED FIELDS
      // =================================

      if (
        !name ||
        !email ||
        !password
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Please fill in all fields.",
          });
      }

      const cleanName =
        String(name).trim();

      const cleanEmail =
        String(email)
          .trim()
          .toLowerCase();

      // =================================
      // VALIDATE NAME
      // =================================

      if (
        cleanName.length < 2
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Please enter a valid name.",
          });
      }

      // =================================
      // VALIDATE EMAIL
      // =================================

      const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (
        !emailPattern.test(
          cleanEmail
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Please enter a valid email address.",
          });
      }

      // =================================
      // VALIDATE PASSWORD
      // =================================

      if (
        String(password).length <
        6
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Password must be at least 6 characters.",
          });
      }

      // =================================
      // CHECK EXISTING ACCOUNT
      // =================================

      const existingUser =
        await User.findOne({
          email: cleanEmail,
        });

      if (existingUser) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "An account with this email already exists.",
          });
      }

      // =================================
      // HASH PASSWORD
      // =================================

      const hashedPassword =
        await bcrypt.hash(
          password,
          10
        );

      // =================================
      // CREATE USER
      // =================================

      const user =
        await User.create({
          name: cleanName,
          email: cleanEmail,
          password:
            hashedPassword,
          role: "user",
        });

      // =================================
      // CREATE TOKEN
      // =================================

      const token =
        createToken(user);

      return res
        .status(201)
        .json({
          success: true,

          message:
            "Account created successfully.",

          token,

          user:
            getSafeUser(user),
        });
    } catch (error) {
      console.error(
        "Signup error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Server error during signup.",
        });
    }
  }
);

// =====================================================
// LOGIN
// POST /api/auth/login
// PUBLIC
// =====================================================

router.post(
  "/login",
  async (req, res) => {
    try {
      const {
        email,
        password,
      } = req.body;

      // =================================
      // CHECK REQUIRED FIELDS
      // =================================

      if (
        !email ||
        !password
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Please enter your email and password.",
          });
      }

      const cleanEmail =
        String(email)
          .trim()
          .toLowerCase();

      // =================================
      // FIND USER
      // =================================

      const user =
        await User.findOne({
          email: cleanEmail,
        });

      if (!user) {
        return res
          .status(401)
          .json({
            success: false,
            message:
              "Invalid email or password.",
          });
      }

      // =================================
      // COMPARE PASSWORD
      // =================================

      const passwordMatches =
        await bcrypt.compare(
          password,
          user.password
        );

      if (!passwordMatches) {
        return res
          .status(401)
          .json({
            success: false,
            message:
              "Invalid email or password.",
          });
      }

      // =================================
      // CREATE TOKEN
      // =================================

      const token =
        createToken(user);

      // =================================
      // SEND LOGIN SECURITY EMAIL
      // =================================
      //
      // We intentionally DO NOT await
      // this email.
      //
      // If Gmail/email service fails,
      // the user's valid login will
      // still succeed.
      // =================================

      sendLoginSecurityEmail(
        user.email,
        user.name
      ).catch((emailError) => {
        console.error(
          "Login security email failed:",
          emailError.message
        );
      });

      // =================================
      // LOGIN SUCCESS
      // =================================

      return res.json({
        success: true,

        message:
          "Login successful.",

        token,

        user:
          getSafeUser(user),
      });
    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Server error during login.",
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
      const {
        email,
      } = req.body;

      // =================================
      // CHECK EMAIL
      // =================================

      if (!email) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Please enter your email address.",
          });
      }

      cleanEmail =
        String(email)
          .trim()
          .toLowerCase();

      const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (
        !emailPattern.test(
          cleanEmail
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Please enter a valid email address.",
          });
      }

      // =================================
      // CHECK USER EXISTS
      // =================================

      const user =
        await User.findOne({
          email: cleanEmail,
        });

      if (!user) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "No account was found with this email address.",
          });
      }

      // =================================
      // DELETE OLD RESET REQUESTS
      // =================================

      await PasswordReset.deleteMany({
        email: cleanEmail,
      });

      // =================================
      // GENERATE 6-DIGIT CODE
      // =================================

      const resetCode =
        crypto.randomInt(
          100000,
          1000000
        ).toString();

      // =================================
      // HASH RESET CODE
      // =================================

      const hashedCode =
        await bcrypt.hash(
          resetCode,
          10
        );

      // =================================
      // EXPIRY
      // CODE EXPIRES AFTER 10 MINUTES
      // =================================

      const expiresAt =
        new Date(
          Date.now() +
            10 * 60 * 1000
        );

      // =================================
      // SAVE RESET REQUEST
      // =================================

      await PasswordReset.create({
        email: cleanEmail,
        code: hashedCode,
        expiresAt,
        attempts: 0,
        verified: false,
      });

      // =================================
      // SEND RESET CODE BY EMAIL
      // =================================

      try {
        await sendPasswordResetEmail(
          cleanEmail,
          resetCode
        );
      } catch (emailError) {
        // Remove unusable reset request
        // if email sending fails.

        await PasswordReset.deleteMany({
          email: cleanEmail,
        });

        console.error(
          "Reset email delivery failed:",
          emailError.message
        );

        return res
          .status(500)
          .json({
            success: false,
            message:
              "We could not send the password reset email. Please try again.",
          });
      }

      // =================================
      // SUCCESS
      // =================================
      //
      // IMPORTANT:
      // The actual reset code is NOT
      // returned to the frontend.
      // =================================

      return res
        .status(200)
        .json({
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

      // =================================
      // CLEANUP
      // =================================

      if (cleanEmail) {
        try {
          await PasswordReset.deleteMany({
            email: cleanEmail,
          });
        } catch (
          cleanupError
        ) {
          console.error(
            "Password reset cleanup error:",
            cleanupError.message
          );
        }
      }

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Could not create password reset request.",
        });
    }
  }
);

// =====================================================
// VERIFY RESET CODE
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

      // =================================
      // CHECK REQUIRED FIELDS
      // =================================

      if (
        !email ||
        !code
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Please enter your email and reset code.",
          });
      }

      const cleanEmail =
        String(email)
          .trim()
          .toLowerCase();

      const cleanCode =
        String(code)
          .trim();

      // =================================
      // VALIDATE CODE FORMAT
      // =================================

      if (
        !/^[0-9]{6}$/.test(
          cleanCode
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Reset code must contain exactly 6 digits.",
          });
      }

      // =================================
      // FIND RESET REQUEST
      // =================================

      const resetRequest =
        await PasswordReset.findOne({
          email: cleanEmail,
        }).sort({
          createdAt: -1,
        });

      if (!resetRequest) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "No password reset request was found. Please request a new code.",
          });
      }

      // =================================
      // CHECK EXPIRATION
      // =================================

      if (
        new Date() >
        resetRequest.expiresAt
      ) {
        await PasswordReset.deleteOne({
          _id:
            resetRequest._id,
        });

        return res
          .status(400)
          .json({
            success: false,
            message:
              "Your reset code has expired. Please request a new code.",
          });
      }

      // =================================
      // CHECK ATTEMPTS
      // MAXIMUM 5 FAILED ATTEMPTS
      // =================================

      if (
        resetRequest.attempts >=
        5
      ) {
        await PasswordReset.deleteOne({
          _id:
            resetRequest._id,
        });

        return res
          .status(429)
          .json({
            success: false,
            message:
              "Too many incorrect attempts. Please request a new reset code.",
          });
      }

      // =================================
      // COMPARE CODE
      // =================================

      const codeMatches =
        await bcrypt.compare(
          cleanCode,
          resetRequest.code
        );

      if (!codeMatches) {
        resetRequest.attempts +=
          1;

        await resetRequest.save();

        const attemptsLeft =
          Math.max(
            0,
            5 -
              resetRequest.attempts
          );

        return res
          .status(400)
          .json({
            success: false,

            message:
              attemptsLeft > 0
                ? `Incorrect reset code. ${attemptsLeft} attempt${
                    attemptsLeft ===
                    1
                      ? ""
                      : "s"
                  } remaining.`
                : "Too many incorrect attempts. Please request a new reset code.",

            attemptsLeft,
          });
      }

      // =================================
      // MARK CODE VERIFIED
      // =================================

      resetRequest.verified =
        true;

      resetRequest.attempts =
        0;

      await resetRequest.save();

      return res
        .status(200)
        .json({
          success: true,
          message:
            "Reset code verified successfully.",
        });
    } catch (error) {
      console.error(
        "Verify reset code error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Could not verify reset code.",
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
        newPassword,
        confirmPassword,
      } = req.body;

      // =================================
      // CHECK REQUIRED FIELDS
      // =================================

      if (
        !email ||
        !newPassword ||
        !confirmPassword
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Please fill in all password reset fields.",
          });
      }

      const cleanEmail =
        String(email)
          .trim()
          .toLowerCase();

      // =================================
      // PASSWORD LENGTH
      // =================================

      if (
        String(
          newPassword
        ).length < 6
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "New password must be at least 6 characters.",
          });
      }

      // =================================
      // PASSWORD CONFIRMATION
      // =================================

      if (
        newPassword !==
        confirmPassword
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "New password and confirm password do not match.",
          });
      }

      // =================================
      // FIND VERIFIED RESET REQUEST
      // =================================

      const resetRequest =
        await PasswordReset.findOne({
          email: cleanEmail,
          verified: true,
        }).sort({
          createdAt: -1,
        });

      if (!resetRequest) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Please verify your reset code before changing your password.",
          });
      }

      // =================================
      // CHECK EXPIRATION AGAIN
      // =================================

      if (
        new Date() >
        resetRequest.expiresAt
      ) {
        await PasswordReset.deleteOne({
          _id:
            resetRequest._id,
        });

        return res
          .status(400)
          .json({
            success: false,
            message:
              "Your password reset session has expired. Please request a new code.",
          });
      }

      // =================================
      // FIND USER
      // =================================

      const user =
        await User.findOne({
          email: cleanEmail,
        });

      if (!user) {
        await PasswordReset.deleteMany({
          email: cleanEmail,
        });

        return res
          .status(404)
          .json({
            success: false,
            message:
              "User account not found.",
          });
      }

      // =================================
      // PREVENT SAME PASSWORD
      // =================================

      const samePassword =
        await bcrypt.compare(
          newPassword,
          user.password
        );

      if (samePassword) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "New password must be different from your current password.",
          });
      }

      // =================================
      // HASH NEW PASSWORD
      // =================================

      const hashedPassword =
        await bcrypt.hash(
          newPassword,
          10
        );

      // =================================
      // UPDATE USER
      // =================================

      user.password =
        hashedPassword;

      await user.save();

      // =================================
      // DELETE RESET REQUEST
      // =================================

      await PasswordReset.deleteMany({
        email: cleanEmail,
      });

      return res
        .status(200)
        .json({
          success: true,
          message:
            "Password reset successfully. You can now login with your new password.",
        });
    } catch (error) {
      console.error(
        "Reset password error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Could not reset your password.",
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
      const user =
        await User.findById(
          req.user._id
        ).select("-password");

      if (!user) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "User account not found.",
          });
      }

      return res.json({
        success: true,

        user:
          getSafeUser(user),
      });
    } catch (error) {
      console.error(
        "Get profile error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Could not load your profile.",
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
      const {
        name,
        phone,
        address,
        city,
        state,
        pincode,
      } = req.body;

      const user =
        await User.findById(
          req.user._id
        );

      if (!user) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "User account not found.",
          });
      }

      // =================================
      // NAME
      // =================================

      if (
        name !== undefined
      ) {
        const cleanName =
          String(name).trim();

        if (
          cleanName.length < 2
        ) {
          return res
            .status(400)
            .json({
              success: false,
              message:
                "Please enter a valid name.",
            });
        }

        user.name =
          cleanName;
      }

      // =================================
      // PHONE
      // =================================

      if (
        phone !== undefined
      ) {
        const cleanPhone =
          String(phone)
            .replace(
              /\s+/g,
              ""
            )
            .trim();

        if (
          cleanPhone &&
          !/^[0-9]{10}$/.test(
            cleanPhone
          )
        ) {
          return res
            .status(400)
            .json({
              success: false,
              message:
                "Phone number must contain exactly 10 digits.",
            });
        }

        user.phone =
          cleanPhone;
      }

      // =================================
      // ADDRESS
      // =================================

      if (
        address !== undefined
      ) {
        user.address =
          String(
            address
          ).trim();
      }

      // =================================
      // CITY
      // =================================

      if (
        city !== undefined
      ) {
        user.city =
          String(city).trim();
      }

      // =================================
      // STATE
      // =================================

      if (
        state !== undefined
      ) {
        user.state =
          String(state).trim();
      }

      // =================================
      // PIN CODE
      // =================================

      if (
        pincode !== undefined
      ) {
        const cleanPincode =
          String(pincode)
            .replace(
              /\s+/g,
              ""
            )
            .trim();

        if (
          cleanPincode &&
          !/^[0-9]{6}$/.test(
            cleanPincode
          )
        ) {
          return res
            .status(400)
            .json({
              success: false,
              message:
                "PIN code must contain exactly 6 digits.",
            });
        }

        user.pincode =
          cleanPincode;
      }

      // Email and role are deliberately
      // not updated from this route.

      await user.save();

      return res.json({
        success: true,

        message:
          "Profile updated successfully.",

        user:
          getSafeUser(user),
      });
    } catch (error) {
      console.error(
        "Update profile error:",
        error
      );

      return res
        .status(500)
        .json({
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
        confirmPassword,
      } = req.body;

      // =================================
      // CHECK FIELDS
      // =================================

      if (
        !currentPassword ||
        !newPassword ||
        !confirmPassword
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Please fill in all password fields.",
          });
      }

      // =================================
      // PASSWORD LENGTH
      // =================================

      if (
        newPassword.length < 6
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "New password must be at least 6 characters.",
          });
      }

      // =================================
      // PASSWORD CONFIRMATION
      // =================================

      if (
        newPassword !==
        confirmPassword
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "New password and confirm password do not match.",
          });
      }

      // =================================
      // GET USER
      // =================================

      const user =
        await User.findById(
          req.user._id
        );

      if (!user) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "User account not found.",
          });
      }

      // =================================
      // VERIFY CURRENT PASSWORD
      // =================================

      const passwordMatches =
        await bcrypt.compare(
          currentPassword,
          user.password
        );

      if (!passwordMatches) {
        return res
          .status(401)
          .json({
            success: false,
            message:
              "Current password is incorrect.",
          });
      }

      // =================================
      // PREVENT SAME PASSWORD
      // =================================

      const samePassword =
        await bcrypt.compare(
          newPassword,
          user.password
        );

      if (samePassword) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "New password must be different from your current password.",
          });
      }

      // =================================
      // HASH NEW PASSWORD
      // =================================

      const hashedPassword =
        await bcrypt.hash(
          newPassword,
          10
        );

      user.password =
        hashedPassword;

      await user.save();

      return res.json({
        success: true,

        message:
          "Password changed successfully.",
      });
    } catch (error) {
      console.error(
        "Change password error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Could not change your password.",
        });
    }
  }
);

// =====================================================
// GET ALL USERS
// GET /api/auth/admin/users
// ADMIN ONLY
// =====================================================

router.get(
  "/admin/users",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      // Password is intentionally
      // excluded.

      const users =
        await User.find()
          .select("-password")
          .sort({
            createdAt: -1,
          });

      return res.json({
        success: true,

        totalUsers:
          users.length,

        users,
      });
    } catch (error) {
      console.error(
        "Get users error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Could not load users.",
        });
    }
  }
);

// =====================================================
// EXPORT ROUTER
// =====================================================

module.exports = router;