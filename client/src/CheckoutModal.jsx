import { useMemo, useState } from "react";

import {
  INDIAN_STATES,
  getCitiesByState,
} from "./data/indiaLocations";

// =====================================================
// CHECKOUT MODAL
// =====================================================

export default function CheckoutModal({
  isOpen,
  onClose,
  cart = [],
  token,
  apiUrl,
  onOrderSuccess,
}) {
  // =====================================================
  // DELIVERY FORM
  // =====================================================

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  // =====================================================
  // PAYMENT
  // =====================================================

  const [paymentMethod, setPaymentMethod] =
    useState("COD");

  // =====================================================
  // LOADING / ERROR
  // =====================================================

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  // =====================================================
  // AVAILABLE CITIES
  // =====================================================

  const availableCities = useMemo(() => {
    return getCitiesByState(form.state);
  }, [form.state]);

  // =====================================================
  // TOTAL
  // =====================================================

  const total = useMemo(() => {
    return cart.reduce(
      (sum, item) =>
        sum +
        Number(item.price || 0) *
          Number(item.quantity || 1),
      0
    );
  }, [cart]);

  // =====================================================
  // TOTAL ITEMS
  // =====================================================

  const totalItems = useMemo(() => {
    return cart.reduce(
      (sum, item) =>
        sum +
        Number(item.quantity || 1),
      0
    );
  }, [cart]);

  // =====================================================
  // DO NOT SHOW WHEN CLOSED
  // =====================================================

  if (!isOpen) {
    return null;
  }

  // =====================================================
  // FORMAT PRICE
  // =====================================================

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(price || 0));
  };

  // =====================================================
  // PRODUCT ID
  // =====================================================

  const getProductId = (item) => {
    return (
      item?._id ||
      item?.id ||
      item?.product
    );
  };

  // =====================================================
  // NORMAL FORM CHANGE
  // =====================================================

  const handleChange = (event) => {
    const { name, value } =
      event.target;

    // Only allow digits in phone
    if (name === "phone") {
      const numbersOnly =
        value.replace(/\D/g, "");

      setForm((current) => ({
        ...current,
        phone: numbersOnly.slice(0, 10),
      }));

      setError("");
      return;
    }

    // Only allow digits in pincode
    if (name === "pincode") {
      const numbersOnly =
        value.replace(/\D/g, "");

      setForm((current) => ({
        ...current,
        pincode: numbersOnly.slice(0, 6),
      }));

      setError("");
      return;
    }

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
  };

  // =====================================================
  // STATE CHANGE
  // =====================================================

  const handleStateChange = (event) => {
    const selectedState =
      event.target.value;

    setForm((current) => ({
      ...current,
      state: selectedState,

      // Important:
      // Reset city when state changes.
      city: "",
    }));

    setError("");
  };

  // =====================================================
  // PRODUCT IMAGE ERROR
  // =====================================================

  const handleImageError = (event) => {
    const image =
      event.currentTarget;

    image.style.display = "none";

    const fallback =
      image.nextElementSibling;

    if (fallback) {
      fallback.style.display =
        "flex";
    }
  };

  // =====================================================
  // VALIDATE DELIVERY DETAILS
  // =====================================================

  const validateForm = () => {
    if (
      !form.fullName.trim() ||
      !form.phone.trim() ||
      !form.address.trim() ||
      !form.city.trim() ||
      !form.state.trim() ||
      !form.pincode.trim()
    ) {
      return "Please complete all delivery details.";
    }

    const phone =
      form.phone.replace(/\D/g, "");

    if (phone.length !== 10) {
      return "Please enter a valid 10-digit phone number.";
    }

    const pincode =
      form.pincode.replace(/\D/g, "");

    if (pincode.length !== 6) {
      return "Please enter a valid 6-digit pincode.";
    }

    // Make sure selected state exists
    if (
      !INDIAN_STATES.includes(
        form.state
      )
    ) {
      return "Please select a valid state.";
    }

    // Make sure selected city belongs
    // to selected state
    if (
      !getCitiesByState(
        form.state
      ).includes(form.city)
    ) {
      return "Please select a valid city for the selected state.";
    }

    if (cart.length === 0) {
      return "Your cart is empty.";
    }

    if (!token) {
      return "Please login before placing your order.";
    }

    return null;
  };

  // =====================================================
  // PLACE ORDER
  // =====================================================

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setError("");

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      // =================================================
      // ORDER ITEMS
      // =================================================

      const orderItems =
        cart.map((item) => ({
          product:
            getProductId(item),

          name:
            item.name,

          price:
            Number(
              item.price || 0
            ),

          quantity:
            Number(
              item.quantity || 1
            ),
        }));

      // =================================================
      // ORDER DATA
      // =================================================

      const orderData = {
        items: orderItems,

        shippingAddress: {
          fullName:
            form.fullName.trim(),

          phone:
            form.phone.trim(),

          address:
            form.address.trim(),

          city:
            form.city.trim(),

          state:
            form.state.trim(),

          pincode:
            form.pincode.trim(),
        },

        paymentMethod,

        totalAmount: total,
      };

      // =================================================
      // SEND ORDER TO BACKEND
      // =================================================

      const response =
        await fetch(
          `${apiUrl}/api/orders`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body:
              JSON.stringify(
                orderData
              ),
          }
        );

      let data;

      try {
        data =
          await response.json();
      } catch {
        throw new Error(
          "Invalid response received from the server."
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Unable to place order."
        );
      }

      // =================================================
      // CREATED ORDER
      // =================================================

      const createdOrder =
        data?.order ||
        data?.data ||
        data;

      // =================================================
      // RESET FORM
      // =================================================

      setForm({
        fullName: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
      });

      setPaymentMethod("COD");

      // =================================================
      // SUCCESS CALLBACK
      // =================================================

      if (
        typeof onOrderSuccess ===
        "function"
      ) {
        await onOrderSuccess(
          createdOrder
        );
      }
    } catch (err) {
      console.error(
        "Checkout error:",
        err
      );

      setError(
        err.message ||
          "Something went wrong while placing the order."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // JSX
  // =====================================================

  return (
    <div
      className="modal-overlay"
      onClick={() => {
        if (!loading) {
          onClose();
        }
      }}
    >
      <div
        className="checkout-modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        {/* =============================================
            CLOSE BUTTON
        ============================================= */}

        <button
          className="modal-close"
          type="button"
          onClick={onClose}
          disabled={loading}
          aria-label="Close checkout"
        >
          ✕
        </button>

        {/* =============================================
            HEADER
        ============================================= */}

        <div className="checkout-header">
          <span>🛍️</span>

          <div>
            <h2>
              Checkout
            </h2>

            <p>
              Complete your delivery
              information.
            </p>
          </div>
        </div>

        {/* =============================================
            ERROR
        ============================================= */}

        {error && (
          <div className="auth-message auth-error">
            ⚠️ {error}
          </div>
        )}

        {/* =============================================
            CHECKOUT FORM
        ============================================= */}

        <form
          className="checkout-form"
          onSubmit={handleSubmit}
        >
          {/* ===========================================
              DELIVERY DETAILS
          =========================================== */}

          <div className="checkout-section-title">
            <div>
              <span>
                📍
              </span>

              <div>
                <h3>
                  Delivery Details
                </h3>

                <p>
                  Where should we
                  deliver your order?
                </p>
              </div>
            </div>
          </div>

          <div className="checkout-form-grid">

            {/* =========================================
                FULL NAME
            ========================================= */}

            <div>
              <label htmlFor="checkout-name">
                Full Name
              </label>

              <input
                id="checkout-name"
                name="fullName"
                type="text"
                value={
                  form.fullName
                }
                onChange={
                  handleChange
                }
                placeholder="Enter your full name"
                disabled={
                  loading
                }
                autoComplete="name"
                required
              />
            </div>

            {/* =========================================
                PHONE
            ========================================= */}

            <div>
              <label htmlFor="checkout-phone">
                Phone Number
              </label>

              <input
                id="checkout-phone"
                name="phone"
                type="tel"
                inputMode="numeric"
                value={
                  form.phone
                }
                onChange={
                  handleChange
                }
                placeholder="10-digit phone number"
                disabled={
                  loading
                }
                autoComplete="tel"
                maxLength={10}
                required
              />
            </div>

            {/* =========================================
                ADDRESS
            ========================================= */}

            <div className="checkout-full-width">
              <label htmlFor="checkout-address">
                Delivery Address
              </label>

              <textarea
                id="checkout-address"
                name="address"
                value={
                  form.address
                }
                onChange={
                  handleChange
                }
                placeholder="House number, street, area, landmark..."
                disabled={
                  loading
                }
                autoComplete="street-address"
                required
                rows={3}
              />
            </div>

            {/* =========================================
                STATE DROPDOWN
            ========================================= */}

            <div>
              <label htmlFor="checkout-state">
                State
              </label>

              <select
                id="checkout-state"
                name="state"
                value={
                  form.state
                }
                onChange={
                  handleStateChange
                }
                disabled={
                  loading
                }
                autoComplete="address-level1"
                required
              >
                <option value="">
                  Select State / UT
                </option>

                {INDIAN_STATES.map(
                  (state) => (
                    <option
                      key={state}
                      value={state}
                    >
                      {state}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* =========================================
                CITY DROPDOWN
            ========================================= */}

            <div>
              <label htmlFor="checkout-city">
                City
              </label>

              <select
                id="checkout-city"
                name="city"
                value={
                  form.city
                }
                onChange={
                  handleChange
                }
                disabled={
                  loading ||
                  !form.state
                }
                autoComplete="address-level2"
                required
              >
                <option value="">
                  {form.state
                    ? "Select City"
                    : "Select State First"}
                </option>

                {availableCities.map(
                  (city) => (
                    <option
                      key={city}
                      value={city}
                    >
                      {city}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* =========================================
                PINCODE
            ========================================= */}

            <div>
              <label htmlFor="checkout-pincode">
                Pincode
              </label>

              <input
                id="checkout-pincode"
                name="pincode"
                type="text"
                inputMode="numeric"
                value={
                  form.pincode
                }
                onChange={
                  handleChange
                }
                placeholder="6-digit pincode"
                disabled={
                  loading
                }
                autoComplete="postal-code"
                maxLength={6}
                required
              />
            </div>
          </div>

          {/* ===========================================
              PAYMENT METHOD
          =========================================== */}

          <div className="payment-section">
            <h3>
              💳 Payment Method
            </h3>

            <label className="payment-option">
              <input
                type="radio"
                name="paymentMethod"
                value="COD"
                checked={
                  paymentMethod ===
                  "COD"
                }
                onChange={(event) =>
                  setPaymentMethod(
                    event.target.value
                  )
                }
                disabled={
                  loading
                }
              />

              <div className="payment-option-content">
                <span className="payment-icon">
                  💵
                </span>

                <div>
                  <strong>
                    Cash on Delivery
                  </strong>

                  <small>
                    Pay when your
                    order arrives
                  </small>
                </div>
              </div>
            </label>
          </div>

          {/* ===========================================
              ORDER SUMMARY
          =========================================== */}

          <div className="checkout-summary">
            <div className="checkout-summary-header">
              <div>
                <h3>
                  🛒 Order Summary
                </h3>

                <p>
                  {totalItems}{" "}
                  {totalItems === 1
                    ? "item"
                    : "items"}{" "}
                  in your order
                </p>
              </div>
            </div>

            {/* =========================================
                PRODUCTS
            ========================================= */}

            <div className="checkout-products">
              {cart.map(
                (item, index) => {
                  const productId =
                    getProductId(
                      item
                    );

                  const quantity =
                    Number(
                      item.quantity ||
                        1
                    );

                  const price =
                    Number(
                      item.price ||
                        0
                    );

                  const itemTotal =
                    price *
                    quantity;

                  return (
                    <div
                      className="checkout-item checkout-item-with-image"
                      key={
                        productId ||
                        index
                      }
                    >
                      {/* ===============================
                          PRODUCT IMAGE
                      =============================== */}

                      <div className="checkout-product-image-box">
                        {item.image ? (
                          <img
                            src={
                              item.image
                            }
                            alt={
                              item.name ||
                              "Product"
                            }
                            className="checkout-product-image"
                            loading="lazy"
                            onError={
                              handleImageError
                            }
                          />
                        ) : null}

                        <span
                          className="checkout-product-image-fallback"
                          style={{
                            display:
                              item.image
                                ? "none"
                                : "flex",
                          }}
                        >
                          {item.icon ||
                            "🛍️"}
                        </span>
                      </div>

                      {/* ===============================
                          PRODUCT INFO
                      =============================== */}

                      <div className="checkout-product-info">
                        <strong className="checkout-product-name">
                          {item.name}
                        </strong>

                        <span className="checkout-product-category">
                          {item.category ||
                            "Product"}
                        </span>

                        <div className="checkout-product-meta">
                          <span>
                            {formatPrice(
                              price
                            )}
                          </span>

                          <span>
                            ×
                          </span>

                          <span>
                            {quantity}
                          </span>
                        </div>
                      </div>

                      {/* ===============================
                          PRODUCT TOTAL
                      =============================== */}

                      <strong className="checkout-item-total">
                        {formatPrice(
                          itemTotal
                        )}
                      </strong>
                    </div>
                  );
                }
              )}
            </div>

            {/* =========================================
                TOTAL
            ========================================= */}

            <div className="checkout-total">
              <div>
                <span>
                  Total Items
                </span>

                <strong>
                  {totalItems}
                </strong>
              </div>

              <div className="checkout-grand-total">
                <span>
                  Order Total
                </span>

                <strong>
                  {formatPrice(
                    total
                  )}
                </strong>
              </div>
            </div>
          </div>

          {/* ===========================================
              PLACE ORDER
          =========================================== */}

          <button
            className="checkout-button"
            type="submit"
            disabled={
              loading ||
              cart.length === 0
            }
          >
            {loading
              ? "⏳ Placing Order..."
              : `Place Order • ${formatPrice(
                  total
                )}`}
          </button>

          {/* ===========================================
              BACK TO CART
          =========================================== */}

          <button
            className="continue-shopping-button"
            type="button"
            onClick={onClose}
            disabled={
              loading
            }
          >
            ← Back to Cart
          </button>

          {/* ===========================================
              SECURITY MESSAGE
          =========================================== */}

          <p className="checkout-security-text">
            🔒 Your order information is
            securely processed by
            ShopMind AI.
          </p>
        </form>
      </div>
    </div>
  );
}