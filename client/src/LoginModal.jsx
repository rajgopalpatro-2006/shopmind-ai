import { useState } from "react";

import API_URL from "./api";

function LoginModal({
  onClose,
  onLoginSuccess,
  onForgotPassword,
}) {
  // =====================================================
  // LOGIN / SIGNUP MODE
  // =====================================================

  const [isSignup, setIsSignup] =
    useState(false);

  // =====================================================
  // FORM DATA
  // =====================================================

  const [formData, setFormData] =
    useState({
      name: "",
      email: "",
      password: "",
    });

  // =====================================================
  // LOADING / MESSAGE / ERROR
  // =====================================================

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  // =====================================================
  // SHOW / HIDE PASSWORD
  // =====================================================

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  // =====================================================
  // HANDLE INPUT
  // =====================================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setFormData(
      (current) => ({
        ...current,
        [name]: value,
      })
    );

    setError("");
    setMessage("");
  };

  // =====================================================
  // LOGIN / SIGNUP
  // =====================================================

  const handleSubmit = async (
    e
  ) => {
    e.preventDefault();

    setError("");
    setMessage("");

    // ===================================================
    // VALIDATE NAME
    // ===================================================

    if (
      isSignup &&
      !formData.name.trim()
    ) {
      setError(
        "Please enter your name."
      );

      return;
    }

    // ===================================================
    // VALIDATE EMAIL
    // ===================================================

    if (
      !formData.email.trim()
    ) {
      setError(
        "Please enter your email."
      );

      return;
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !emailPattern.test(
        formData.email
          .trim()
          .toLowerCase()
      )
    ) {
      setError(
        "Please enter a valid email address."
      );

      return;
    }

    // ===================================================
    // VALIDATE PASSWORD
    // ===================================================

    if (!formData.password) {
      setError(
        "Please enter your password."
      );

      return;
    }

    if (
      formData.password.length <
      6
    ) {
      setError(
        "Password must be at least 6 characters."
      );

      return;
    }

    setLoading(true);

    try {
      // =================================================
      // API ENDPOINT
      // =================================================

      const endpoint =
        isSignup
          ? `${API_URL}/api/auth/signup`
          : `${API_URL}/api/auth/login`;

      // =================================================
      // REQUEST BODY
      // =================================================

      const bodyData =
        isSignup
          ? {
              name:
                formData.name.trim(),

              email:
                formData.email
                  .trim()
                  .toLowerCase(),

              password:
                formData.password,
            }
          : {
              email:
                formData.email
                  .trim()
                  .toLowerCase(),

              password:
                formData.password,
            };

      // =================================================
      // SEND REQUEST
      // =================================================

      const response =
        await fetch(
          endpoint,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                bodyData
              ),
          }
        );

      // =================================================
      // READ RESPONSE SAFELY
      // =================================================

      let data;

      try {
        data =
          await response.json();
      } catch {
        throw new Error(
          "Invalid response from server."
        );
      }

      // =================================================
      // API ERROR
      // =================================================

      if (
        !response.ok ||
        !data.success
      ) {
        setError(
          data.message ||
            "Something went wrong. Please try again."
        );

        return;
      }

      // =================================================
      // SAVE TOKEN
      // =================================================

      if (data.token) {
        localStorage.setItem(
          "shopmindToken",
          data.token
        );
      }

      // =================================================
      // SAVE USER
      // =================================================

      if (data.user) {
        localStorage.setItem(
          "shopmindUser",
          JSON.stringify(
            data.user
          )
        );
      }

      // =================================================
      // SUCCESS MESSAGE
      // =================================================

      setError("");

      setMessage(
        data.message ||
          (isSignup
            ? "Account created successfully."
            : "Login successful.")
      );

      // =================================================
      // UPDATE APP.JSX
      // =================================================

      if (
        typeof onLoginSuccess ===
        "function"
      ) {
        onLoginSuccess(data);
      }

      // =================================================
      // CLOSE MODAL
      // =================================================

      setTimeout(() => {
        if (
          typeof onClose ===
          "function"
        ) {
          onClose();
        }
      }, 700);
    } catch (err) {
      console.error(
        "Authentication error:",
        err
      );

      setMessage("");

      // Network errors

      if (
        err instanceof TypeError
      ) {
        setError(
          "Cannot connect to the server. Please try again."
        );
      } else {
        setError(
          err.message ||
            "Something went wrong."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // SWITCH LOGIN / SIGNUP
  // =====================================================

  const switchMode = () => {
    setIsSignup(
      (current) => !current
    );

    setFormData({
      name: "",
      email: "",
      password: "",
    });

    setShowPassword(false);

    setError("");
    setMessage("");
  };

  // =====================================================
  // FORGOT PASSWORD
  // =====================================================

  const handleForgotPassword =
    () => {
      setError("");
      setMessage("");

      if (
        typeof onForgotPassword ===
        "function"
      ) {
        onForgotPassword();
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
        className="login-modal"
        onClick={(e) =>
          e.stopPropagation()
        }
      >
        {/* =============================================
            CLOSE BUTTON
        ============================================= */}

        <button
          className="close-btn"
          onClick={onClose}
          type="button"
          aria-label="Close"
        >
          ✕
        </button>

        {/* =============================================
            ICON
        ============================================= */}

        <div className="login-icon">
          🛍️
        </div>

        {/* =============================================
            TITLE
        ============================================= */}

        <h2>
          {isSignup
            ? "Create Account"
            : "Welcome Back"}
        </h2>

        <p className="login-subtitle">
          {isSignup
            ? "Create your ShopMind AI account."
            : "Login to continue shopping smarter."}
        </p>

        {/* =============================================
            ERROR
        ============================================= */}

        {error && (
          <div
            style={{
              background:
                "#fef2f2",

              color:
                "#dc2626",

              padding:
                "12px",

              borderRadius:
                "10px",

              marginBottom:
                "15px",

              fontSize:
                "14px",

              textAlign:
                "center",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* =============================================
            SUCCESS
        ============================================= */}

        {message && (
          <div
            style={{
              background:
                "#f0fdf4",

              color:
                "#16a34a",

              padding:
                "12px",

              borderRadius:
                "10px",

              marginBottom:
                "15px",

              fontSize:
                "14px",

              textAlign:
                "center",
            }}
          >
            ✅ {message}
          </div>
        )}

        {/* =============================================
            FORM
        ============================================= */}

        <form
          className="login-form"
          onSubmit={
            handleSubmit
          }
        >
          {/* ===========================================
              NAME
          =========================================== */}

          {isSignup && (
            <div className="form-group">
              <label>
                Name
              </label>

              <input
                type="text"
                name="name"
                placeholder="Enter your name"
                value={
                  formData.name
                }
                onChange={
                  handleChange
                }
                disabled={
                  loading
                }
                autoComplete="name"
              />
            </div>
          )}

          {/* ===========================================
              EMAIL
          =========================================== */}

          <div className="form-group">
            <label>
              Email
            </label>

            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={
                formData.email
              }
              onChange={
                handleChange
              }
              disabled={
                loading
              }
              autoComplete="email"
            />
          </div>

          {/* ===========================================
              PASSWORD
          =========================================== */}

          <div className="form-group">
            <label>
              Password
            </label>

            <div
              style={{
                position:
                  "relative",
              }}
            >
              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                name="password"
                placeholder="Enter your password"
                value={
                  formData.password
                }
                onChange={
                  handleChange
                }
                disabled={
                  loading
                }
                autoComplete={
                  isSignup
                    ? "new-password"
                    : "current-password"
                }
                style={{
                  width:
                    "100%",

                  paddingRight:
                    "55px",

                  boxSizing:
                    "border-box",
                }}
              />

              {/* SHOW / HIDE PASSWORD */}

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (current) =>
                      !current
                  )
                }
                disabled={
                  loading
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                style={{
                  position:
                    "absolute",

                  right:
                    "10px",

                  top:
                    "50%",

                  transform:
                    "translateY(-50%)",

                  border:
                    "none",

                  background:
                    "transparent",

                  cursor:
                    loading
                      ? "not-allowed"
                      : "pointer",

                  fontSize:
                    "18px",

                  padding:
                    "4px",
                }}
              >
                {showPassword
                  ? "🙈"
                  : "👁️"}
              </button>
            </div>
          </div>

          {/* ===========================================
              FORGOT PASSWORD
              Only show on Login
          =========================================== */}

          {!isSignup && (
            <div
              className="forgot-password-link"
              style={{
                display:
                  "flex",

                justifyContent:
                  "flex-end",

                marginTop:
                  "-5px",

                marginBottom:
                  "15px",
              }}
            >
              <button
                type="button"
                onClick={
                  handleForgotPassword
                }
                disabled={
                  loading
                }
                style={{
                  border:
                    "none",

                  background:
                    "transparent",

                  padding:
                    "0",

                  cursor:
                    loading
                      ? "not-allowed"
                      : "pointer",

                  color:
                    "#2563eb",

                  fontWeight:
                    "600",

                  fontSize:
                    "14px",
                }}
              >
                Forgot Password?
              </button>
            </div>
          )}

          {/* ===========================================
              SUBMIT
          =========================================== */}

          <button
            className="login-submit-btn"
            type="submit"
            disabled={
              loading
            }
          >
            {loading
              ? "Please wait..."
              : isSignup
                ? "Create Account"
                : "Login"}
          </button>
        </form>

        {/* =============================================
            SWITCH LOGIN / SIGNUP
        ============================================= */}

        <div className="login-switch">
          {isSignup
            ? "Already have an account?"
            : "Don't have an account?"}

          <button
            type="button"
            onClick={
              switchMode
            }
            disabled={
              loading
            }
          >
            {isSignup
              ? "Login"
              : "Sign Up"}
          </button>
        </div>

        {/* =============================================
            SECURITY NOTE
        ============================================= */}

        {!isSignup && (
          <p
            style={{
              marginTop:
                "18px",

              marginBottom:
                "0",

              textAlign:
                "center",

              fontSize:
                "12px",

              color:
                "#64748b",
            }}
          >
            🔒 Your login
            information is protected.
          </p>
        )}
      </div>
    </div>
  );
}

export default LoginModal;