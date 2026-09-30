import { useState } from "react";

function AuthModal({
  isOpen,
  onClose,
  onAuthSuccess,
  apiUrl,
}) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  if (!isOpen) {
    return null;
  }

  /* =================================================
     CHANGE LOGIN / REGISTER MODE
  ================================================= */

  const changeMode = (newMode) => {
    setMode(newMode);
    setError("");
    setShowPassword(false);
  };

  /* =================================================
     SUBMIT AUTHENTICATION
  ================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const endpoint =
        mode === "login"
          ? `${apiUrl}/api/auth/login`
          : `${apiUrl}/api/auth/register`;

      const body =
        mode === "login"
          ? {
              email,
              password,
            }
          : {
              name,
              email,
              password,
            };

      const response = await fetch(
        endpoint,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(body),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Authentication failed."
        );
      }

      onAuthSuccess(data);
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

  return (
    <div
      className="modal-overlay auth-overlay"
      onClick={onClose}
    >
      {/* DECORATIVE BACKGROUND */}

      <div className="auth-bg-orb auth-orb-one" />
      <div className="auth-bg-orb auth-orb-two" />

      <div
        className="auth-modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        {/* ============================================
            CLOSE BUTTON
        ============================================ */}

        <button
          type="button"
          className="auth-close-btn"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>

        {/* ============================================
            LEFT BRAND PANEL
        ============================================ */}

        <div className="auth-brand-panel">
          <div className="auth-brand-content">
            <div className="auth-brand-logo">
              🛍️
            </div>

            <div className="auth-brand-name">
              ShopMind AI
            </div>

            <h2>
              Shopping made
              <span> smarter.</span>
            </h2>

            <p>
              Discover products, compare
              choices and get intelligent
              recommendations with your
              personal AI shopping
              assistant.
            </p>

            <div className="auth-feature-list">
              <div>
                <span>✨</span>

                <p>
                  <strong>
                    AI Recommendations
                  </strong>

                  <small>
                    Products selected around
                    your requirements.
                  </small>
                </p>
              </div>

              <div>
                <span>⚖️</span>

                <p>
                  <strong>
                    Smart Comparison
                  </strong>

                  <small>
                    Compare products before
                    making your decision.
                  </small>
                </p>
              </div>

              <div>
                <span>🛒</span>

                <p>
                  <strong>
                    Simple Shopping
                  </strong>

                  <small>
                    Search, save and shop
                    from one place.
                  </small>
                </p>
              </div>
            </div>
          </div>

          <div className="auth-brand-decoration auth-decoration-one">
            ✨
          </div>

          <div className="auth-brand-decoration auth-decoration-two">
            🤖
          </div>

          <div className="auth-brand-decoration auth-decoration-three">
            🛒
          </div>
        </div>

        {/* ============================================
            RIGHT FORM PANEL
        ============================================ */}

        <div className="auth-form-panel">
          <div className="auth-form-container">
            {/* MOBILE LOGO */}

            <div className="auth-mobile-logo">
              <span>🛍️</span>

              <strong>
                ShopMind AI
              </strong>
            </div>

            {/* HEADER */}

            <div className="auth-header">
              <span className="auth-welcome-label">
                {mode === "login"
                  ? "WELCOME BACK"
                  : "JOIN SHOPMIND"}
              </span>

              <h2>
                {mode === "login"
                  ? "Welcome Back 👋"
                  : "Create Account ✨"}
              </h2>

              <p>
                {mode === "login"
                  ? "Login to continue your smart shopping journey."
                  : "Create your account and start shopping smarter with AI."}
              </p>
            </div>

            {/* ============================================
                LOGIN / REGISTER TABS
            ============================================ */}

            <div className="auth-tabs">
              <button
                type="button"
                className={
                  mode === "login"
                    ? "active"
                    : ""
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
                  mode === "register"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  changeMode("register")
                }
              >
                Register
              </button>
            </div>

            {/* ============================================
                FORM
            ============================================ */}

            <form
              className="auth-form"
              onSubmit={handleSubmit}
            >
              {/* NAME */}

              {mode === "register" && (
                <div className="auth-input-group">
                  <label>
                    Full Name
                  </label>

                  <div className="auth-input-wrapper">
                    <span className="auth-input-icon">
                      👤
                    </span>

                    <input
                      type="text"
                      value={name}
                      placeholder="Enter your full name"
                      onChange={(event) =>
                        setName(
                          event.target.value
                        )
                      }
                      autoComplete="name"
                      required
                    />
                  </div>
                </div>
              )}

              {/* EMAIL */}

              <div className="auth-input-group">
                <label>
                  Email Address
                </label>

                <div className="auth-input-wrapper">
                  <span className="auth-input-icon">
                    ✉️
                  </span>

                  <input
                    type="email"
                    value={email}
                    placeholder="Enter your email"
                    onChange={(event) =>
                      setEmail(
                        event.target.value
                      )
                    }
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {/* PASSWORD */}

              <div className="auth-input-group">
                <div className="auth-password-label">
                  <label>
                    Password
                  </label>

                  {mode === "login" && (
                    <button
                      type="button"
                      className="auth-forgot-btn"
                      onClick={() => {
                        alert(
                          "Forgot password feature will be connected next."
                        );
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
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    placeholder={
                      mode === "login"
                        ? "Enter your password"
                        : "Create a password"
                    }
                    onChange={(event) =>
                      setPassword(
                        event.target.value
                      )
                    }
                    autoComplete={
                      mode === "login"
                        ? "current-password"
                        : "new-password"
                    }
                    minLength={6}
                    required
                  />

                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() =>
                      setShowPassword(
                        (current) =>
                          !current
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
                  <small className="auth-password-hint">
                    Use at least 6
                    characters.
                  </small>
                )}
              </div>

              {/* ============================================
                  ERROR
              ============================================ */}

              {error && (
                <div className="auth-error">
                  <span>⚠️</span>

                  <p>{error}</p>
                </div>
              )}

              {/* ============================================
                  SUBMIT
              ============================================ */}

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="auth-spinner" />

                    Please wait...
                  </>
                ) : mode ===
                  "login" ? (
                  <>
                    Login to ShopMind

                    <span>→</span>
                  </>
                ) : (
                  <>
                    Create My Account

                    <span>→</span>
                  </>
                )}
              </button>
            </form>

            {/* ============================================
                SECURITY MESSAGE
            ============================================ */}

            <div className="auth-security">
              <span>🔒</span>

              <p>
                Your information is securely
                protected.
              </p>
            </div>

            {/* ============================================
                SWITCH LOGIN / REGISTER
            ============================================ */}

            <div className="auth-switch">
              {mode === "login" ? (
                <p>
                  New to ShopMind AI?

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
                  Already have an account?

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
      </div>
    </div>
  );
}

export default AuthModal;