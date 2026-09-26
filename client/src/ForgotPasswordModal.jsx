import { useState } from "react";

import API_URL from "./api";

// =====================================================
// AUTH API URL
// =====================================================

const AUTH_API_URL =
  `${API_URL}/api/auth`;

function ForgotPasswordModal({
  onClose,
  onBackToLogin,
}) {
  // =====================================================
  // STATE
  // =====================================================

  const [step, setStep] =
    useState(1);

  const [email, setEmail] =
    useState("");

  const [code, setCode] =
    useState("");

  const [
    newPassword,
    setNewPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const [
    message,
    setMessage,
  ] = useState("");

  // Development only:
  // Backend may return the OTP
  // while developing locally.

  const [
    developmentCode,
    setDevelopmentCode,
  ] = useState("");

  // =====================================================
  // CLEAN EMAIL
  // =====================================================

  const cleanEmail =
    email.trim().toLowerCase();

  // =====================================================
  // STEP 1
  // REQUEST RESET CODE
  // =====================================================

  const handleRequestCode =
    async (event) => {
      event.preventDefault();

      try {
        setError("");
        setMessage("");
        setDevelopmentCode("");

        if (!cleanEmail) {
          setError(
            "Please enter your email address."
          );

          return;
        }

        const emailPattern =
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (
          !emailPattern.test(
            cleanEmail
          )
        ) {
          setError(
            "Please enter a valid email address."
          );

          return;
        }

        setLoading(true);

        const response =
          await fetch(
            `${AUTH_API_URL}/forgot-password`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                email:
                  cleanEmail,
              }),
            }
          );

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Could not create reset code."
          );
        }

        // Development only.

        if (data.resetCode) {
          setDevelopmentCode(
            String(
              data.resetCode
            )
          );
        }

        setMessage(
          "Reset code generated successfully."
        );

        setStep(2);
      } catch (err) {
        console.error(
          "Forgot password error:",
          err
        );

        setError(
          err.message ||
            "Could not create reset code."
        );
      } finally {
        setLoading(false);
      }
    };

  // =====================================================
  // STEP 2
  // VERIFY RESET CODE
  // =====================================================

  const handleVerifyCode =
    async (event) => {
      event.preventDefault();

      try {
        setError("");
        setMessage("");

        const cleanCode =
          code.trim();

        if (
          !/^[0-9]{6}$/.test(
            cleanCode
          )
        ) {
          setError(
            "Please enter the 6-digit reset code."
          );

          return;
        }

        setLoading(true);

        const response =
          await fetch(
            `${AUTH_API_URL}/verify-reset-code`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                email:
                  cleanEmail,

                code:
                  cleanCode,
              }),
            }
          );

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Could not verify reset code."
          );
        }

        setMessage(
          "Code verified successfully. Create your new password."
        );

        setStep(3);
      } catch (err) {
        console.error(
          "Verify code error:",
          err
        );

        setError(
          err.message ||
            "Could not verify reset code."
        );
      } finally {
        setLoading(false);
      }
    };

  // =====================================================
  // STEP 3
  // RESET PASSWORD
  // =====================================================

  const handleResetPassword =
    async (event) => {
      event.preventDefault();

      try {
        setError("");
        setMessage("");

        if (
          newPassword.length <
          6
        ) {
          setError(
            "New password must be at least 6 characters."
          );

          return;
        }

        if (
          newPassword !==
          confirmPassword
        ) {
          setError(
            "New password and confirm password do not match."
          );

          return;
        }

        setLoading(true);

        const response =
          await fetch(
            `${AUTH_API_URL}/reset-password`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                email:
                  cleanEmail,

                newPassword,

                confirmPassword,
              }),
            }
          );

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Could not reset password."
          );
        }

        setMessage(
          data.message ||
            "Password reset successfully."
        );

        setDevelopmentCode("");

        setStep(4);
      } catch (err) {
        console.error(
          "Reset password error:",
          err
        );

        setError(
          err.message ||
            "Could not reset password."
        );
      } finally {
        setLoading(false);
      }
    };

  // =====================================================
  // RESEND CODE
  // =====================================================

  const handleResendCode =
    async () => {
      try {
        setError("");
        setMessage("");
        setCode("");
        setDevelopmentCode("");

        setLoading(true);

        const response =
          await fetch(
            `${AUTH_API_URL}/forgot-password`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                email:
                  cleanEmail,
              }),
            }
          );

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Could not resend reset code."
          );
        }

        if (data.resetCode) {
          setDevelopmentCode(
            String(
              data.resetCode
            )
          );
        }

        setMessage(
          "A new reset code has been generated."
        );
      } catch (err) {
        console.error(
          "Resend code error:",
          err
        );

        setError(
          err.message ||
            "Could not resend reset code."
        );
      } finally {
        setLoading(false);
      }
    };

  // =====================================================
  // BACK TO LOGIN
  // =====================================================

  const handleBackToLogin =
    () => {
      if (
        typeof onBackToLogin ===
        "function"
      ) {
        onBackToLogin();
        return;
      }

      if (
        typeof onClose ===
        "function"
      ) {
        onClose();
      }
    };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
    >
      <div
        className="forgot-password-modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        {/* =============================================
            CLOSE BUTTON
        ============================================= */}

        <button
          type="button"
          className="forgot-close-btn"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>

        {/* =============================================
            HEADER
        ============================================= */}

        <div className="forgot-header">
          <div className="forgot-icon">
            🔐
          </div>

          <h2>
            {step === 1 &&
              "Forgot Password"}

            {step === 2 &&
              "Verify Reset Code"}

            {step === 3 &&
              "Create New Password"}

            {step === 4 &&
              "Password Reset"}
          </h2>

          <p>
            {step === 1 &&
              "Enter your registered email address to reset your password."}

            {step === 2 &&
              `Enter the 6-digit reset code for ${cleanEmail}.`}

            {step === 3 &&
              "Choose a new password for your ShopMind AI account."}

            {step === 4 &&
              "Your ShopMind AI password has been changed successfully."}
          </p>
        </div>

        {/* =============================================
            PROGRESS
        ============================================= */}

        {step < 4 && (
          <div className="forgot-progress">
            <div
              className={
                step >= 1
                  ? "forgot-step active"
                  : "forgot-step"
              }
            >
              1
            </div>

            <div
              className={
                step >= 2
                  ? "forgot-line active"
                  : "forgot-line"
              }
            />

            <div
              className={
                step >= 2
                  ? "forgot-step active"
                  : "forgot-step"
              }
            >
              2
            </div>

            <div
              className={
                step >= 3
                  ? "forgot-line active"
                  : "forgot-line"
              }
            />

            <div
              className={
                step >= 3
                  ? "forgot-step active"
                  : "forgot-step"
              }
            >
              3
            </div>
          </div>
        )}

        {/* =============================================
            ERROR
        ============================================= */}

        {error && (
          <div className="forgot-error">
            ⚠️ {error}
          </div>
        )}

        {/* =============================================
            SUCCESS MESSAGE
        ============================================= */}

        {message && (
          <div className="forgot-success">
            ✅ {message}
          </div>
        )}

        {/* =============================================
            STEP 1 - EMAIL
        ============================================= */}

        {step === 1 && (
          <form
            onSubmit={
              handleRequestCode
            }
            className="forgot-form"
          >
            <label>
              Email Address
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
              placeholder="Enter your registered email"
              autoComplete="email"
              disabled={loading}
            />

            <button
              type="submit"
              className="forgot-primary-btn"
              disabled={loading}
            >
              {loading
                ? "Generating Code..."
                : "Send Reset Code"}
            </button>

            <button
              type="button"
              className="forgot-link-btn"
              onClick={
                handleBackToLogin
              }
            >
              ← Back to Login
            </button>
          </form>
        )}

        {/* =============================================
            STEP 2 - OTP
        ============================================= */}

        {step === 2 && (
          <form
            onSubmit={
              handleVerifyCode
            }
            className="forgot-form"
          >
            {/* DEVELOPMENT CODE */}

            {developmentCode && (
              <div className="development-code-box">
                <span>
                  Development Reset Code
                </span>

                <strong>
                  {
                    developmentCode
                  }
                </strong>

                <small>
                  This code is shown
                  only when the backend
                  returns it during
                  development.
                </small>
              </div>
            )}

            <label>
              6-Digit Reset Code
            </label>

            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(event) => {
                const value =
                  event.target.value.replace(
                    /\D/g,
                    ""
                  );

                setCode(value);
              }}
              placeholder="Enter 6-digit code"
              autoComplete="one-time-code"
              disabled={loading}
            />

            <button
              type="submit"
              className="forgot-primary-btn"
              disabled={loading}
            >
              {loading
                ? "Verifying..."
                : "Verify Code"}
            </button>

            <button
              type="button"
              className="forgot-secondary-btn"
              onClick={
                handleResendCode
              }
              disabled={loading}
            >
              Resend Code
            </button>

            <button
              type="button"
              className="forgot-link-btn"
              onClick={() => {
                setStep(1);
                setCode("");
                setError("");
                setMessage("");
                setDevelopmentCode(
                  ""
                );
              }}
              disabled={loading}
            >
              ← Change Email
            </button>
          </form>
        )}

        {/* =============================================
            STEP 3 - NEW PASSWORD
        ============================================= */}

        {step === 3 && (
          <form
            onSubmit={
              handleResetPassword
            }
            className="forgot-form"
          >
            <label>
              New Password
            </label>

            <input
              type="password"
              value={
                newPassword
              }
              onChange={(event) =>
                setNewPassword(
                  event.target.value
                )
              }
              placeholder="Enter new password"
              autoComplete="new-password"
              disabled={loading}
            />

            <label>
              Confirm New Password
            </label>

            <input
              type="password"
              value={
                confirmPassword
              }
              onChange={(event) =>
                setConfirmPassword(
                  event.target.value
                )
              }
              placeholder="Confirm new password"
              autoComplete="new-password"
              disabled={loading}
            />

            <p className="forgot-password-hint">
              Password must contain at
              least 6 characters.
            </p>

            <button
              type="submit"
              className="forgot-primary-btn"
              disabled={loading}
            >
              {loading
                ? "Resetting Password..."
                : "Reset Password"}
            </button>
          </form>
        )}

        {/* =============================================
            STEP 4 - COMPLETED
        ============================================= */}

        {step === 4 && (
          <div className="forgot-complete">
            <div className="forgot-complete-icon">
              ✅
            </div>

            <h3>
              Password Changed!
            </h3>

            <p>
              You can now sign in to
              ShopMind AI using your
              new password.
            </p>

            <button
              type="button"
              className="forgot-primary-btn"
              onClick={
                handleBackToLogin
              }
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ForgotPasswordModal;