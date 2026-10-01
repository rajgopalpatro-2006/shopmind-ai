import { useState } from "react";

function AuthModal({
  isOpen,
  onClose,
  onAuthSuccess,
  apiUrl,
}) {
  // =====================================================
  // STATE
  // =====================================================

  const [mode, setMode] = useState("login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // DON'T RENDER WHEN CLOSED
  // =====================================================

  if (!isOpen) {
    return null;
  }

  // =====================================================
  // CHANGE LOGIN / REGISTER MODE
  // =====================================================

  const changeMode = (newMode) => {
    setMode(newMode);
    setError("");
    setPassword("");

    if (newMode === "login") {
      setName("");
    }
  };

  // =====================================================
  // LOGIN / REGISTER
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      // IMPORTANT:
      // Backend routes are:
      //
      // LOGIN:
      // POST /api/auth/login
      //
      // REGISTER:
      // POST /api/auth/signup

      const endpoint =
        mode === "login"
          ? `${apiUrl}/api/auth/login`
          : `${apiUrl}/api/auth/signup`;

      const body =
        mode === "login"
          ? {
              email: email.trim(),
              password,
            }
          : {
              name: name.trim(),
              email: email.trim(),
              password,
            };

      const response = await fetch(endpoint, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(body),
      });

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "Server returned an invalid response."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Authentication failed."
        );
      }

      // =================================================
      // AUTHENTICATION SUCCESS
      // =================================================

      if (onAuthSuccess) {
        onAuthSuccess(data);
      }

      // Clear form after success

      setName("");
      setEmail("");
      setPassword("");
      setError("");
    } catch (error) {
      console.error(
        "Authentication error:",
        error
      );

      setError(
        error.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div
      className="modal-overlay auth-overlay"
      onClick={onClose}
    >
      <div
        className="auth-modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        {/* =============================================
            CLOSE BUTTON
        ============================================= */}

        <button
          type="button"
          className="close-btn"
          onClick={onClose}
          aria-label="Close authentication window"
        >
          ✕
        </button>

        {/* =============================================
            AUTH HEADER
        ============================================= */}

        <div className="auth-header">
          <div className="auth-logo">
            🛍️
          </div>

          <span className="auth-welcome-label">
            {mode === "login"
              ? "WELCOME BACK"
              : "JOIN SHOPMIND AI"}
          </span>

          <h2>
            {mode === "login"
              ? "Welcome Back 👋"
              : "Create Account ✨"}
          </h2>

          <p>
            {mode === "login"
              ? "Login to continue your smart shopping journey."
              : "Create your ShopMind AI account and start shopping smarter."}
          </p>
        </div>

        {/* =============================================
            LOGIN / REGISTER TABS
        ============================================= */}

        <div className="auth-tabs">
          <button
            type="button"
            className={
              mode === "login" ? "active" : ""
            }
            onClick={() =>
              changeMode("login")
            }
          >
            Login
          </button>

          <button
            type="button"
            className={
              mode === "register" ? "active" : ""
            }
            onClick={() =>
              changeMode("register")
            }
          >
            Register
          </button>
        </div>

        {/* =============================================
            AUTH FORM
        ============================================= */}

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >
          {/* ===========================================
              FULL NAME
          =========================================== */}

          {mode === "register" && (
            <div className="form-group">
              <label htmlFor="auth-name">
                Full Name
              </label>

              <div className="auth-input-wrapper">
                <span className="auth-input-icon">
                  👤
                </span>

                <input
                  id="auth-name"
                  type="text"
                  value={name}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  onChange={(event) =>
                    setName(
                      event.target.value
                    )
                  }
                  required
                />
              </div>
            </div>
          )}

          {/* ===========================================
              EMAIL
          =========================================== */}

          <div className="form-group">
            <label htmlFor="auth-email">
              Email Address
            </label>

            <div className="auth-input-wrapper">
              <span className="auth-input-icon">
                ✉️
              </span>

              <input
                id="auth-email"
                type="email"
                value={email}
                placeholder="Enter your email"
                autoComplete="email"
                onChange={(event) =>
                  setEmail(
                    event.target.value
                  )
                }
                required
              />
            </div>
          </div>

          {/* ===========================================
              PASSWORD
          =========================================== */}

          <div className="form-group">
            <div className="auth-password-label">
              <label htmlFor="auth-password">
                Password
              </label>

              {mode === "login" && (
                <button
                  type="button"
                  className="forgot-password-btn"
                  onClick={() => {
                    /*
                     * Keep your existing forgot-password
                     * functionality here if it is handled
                     * elsewhere in App.jsx.
                     */
                  }}
                >
                  Forgot password?
                </button>
              )}
            </div>

            <div className="auth-input-wrapper">
              <span className="auth-input-icon">
                🔒
              </span>

              <input
                id="auth-password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                placeholder="Enter your password"
                autoComplete={
                  mode === "login"
                    ? "current-password"
                    : "new-password"
                }
                minLength={6}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                required
              />

              <button
                type="button"
                className="password-toggle-btn"
                onClick={() =>
                  setShowPassword(
                    (current) => !current
                  )
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword
                  ? "🙈"
                  : "👁️"}
              </button>
            </div>

            {mode === "register" && (
              <small className="password-help">
                Use at least 6 characters.
              </small>
            )}
          </div>

          {/* ===========================================
              ERROR MESSAGE
          =========================================== */}

          {error && (
            <div className="auth-error">
              <span>⚠️</span>

              <span>
                {error}
              </span>
            </div>
          )}

          {/* ===========================================
              SUBMIT BUTTON
          =========================================== */}

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : mode === "login"
                ? "Login to ShopMind →"
                : "Create My Account →"}
          </button>

          <div className="auth-security-text">
            🔒 Your information is securely protected.
          </div>
        </form>

        {/* =============================================
            LOGIN / REGISTER SWITCH
        ============================================= */}

        <div className="auth-switch">
          {mode === "login" ? (
            <p>
              New to ShopMind AI?{" "}

              <button
                type="button"
                onClick={() =>
                  changeMode(
                    "register"
                  )
                }
              >
                Create account
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}

              <button
                type="button"
                onClick={() =>
                  changeMode(
                    "login"
                  )
                }
              >
                Login here
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthModal;