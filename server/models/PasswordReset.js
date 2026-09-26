const mongoose = require("mongoose");

// =====================================================
// PASSWORD RESET SCHEMA
// =====================================================

const passwordResetSchema =
  new mongoose.Schema(
    {
      // ===============================================
      // USER EMAIL
      // ===============================================

      email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true,
      },

      // ===============================================
      // HASHED RESET CODE
      // ===============================================
      // We will NOT store the actual OTP/code.
      // Only the hashed version is stored.

      code: {
        type: String,
        required: true,
      },

      // ===============================================
      // EXPIRY TIME
      // ===============================================

      expiresAt: {
        type: Date,
        required: true,
      },

      // ===============================================
      // NUMBER OF FAILED ATTEMPTS
      // ===============================================

      attempts: {
        type: Number,
        default: 0,
      },

      // ===============================================
      // HAS CODE BEEN VERIFIED?
      // ===============================================

      verified: {
        type: Boolean,
        default: false,
      },
    },
    {
      timestamps: true,
    }
  );

// =====================================================
// AUTOMATICALLY DELETE EXPIRED RESET RECORDS
// =====================================================
//
// MongoDB TTL index will remove expired reset records.
//
// expireAfterSeconds: 0 means MongoDB checks the value
// stored in expiresAt itself.
//

passwordResetSchema.index(
  {
    expiresAt: 1,
  },
  {
    expireAfterSeconds: 0,
  }
);

// =====================================================
// CREATE MODEL
// =====================================================

const PasswordReset =
  mongoose.model(
    "PasswordReset",
    passwordResetSchema
  );

// =====================================================
// EXPORT MODEL
// =====================================================

module.exports = PasswordReset;