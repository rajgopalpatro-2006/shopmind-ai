import { useState } from "react";

import API_URL from "./api";

import {
  INDIAN_STATES,
  getCitiesByState,
} from "./data/indiaLocations";

// =====================================================
// CHECKOUT MODAL
// =====================================================

function CheckoutModal({
  cart,
  user,
  onClose,
  onOrderSuccess,
}) {
  // ===================================================
  // GET SAVED USER
  // ===================================================

  let savedUser = null;

  try {
    const storedUser =
      localStorage.getItem(
        "shopmindUser"
      );

    if (storedUser) {
      savedUser =
        JSON.parse(storedUser);
    }
  } catch (error) {
    console.error(
      "Could not read saved user:",
      error
    );
  }

  const currentUser =
    user || savedUser;

  // ===================================================
  // FORM
  // ===================================================

  const [form, setForm] =
    useState({
      fullName:
        currentUser?.name || "",

      phone:
        currentUser?.phone || "",

      address:
        currentUser?.address || "",

      city:
        currentUser?.city || "",

      state:
        currentUser?.state || "",

      pincode:
        currentUser?.pincode || "",
    });

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [orderId, setOrderId] =
    useState("");

  const [
    confirmedTotal,
    setConfirmedTotal,
  ] = useState(0);

  // ===================================================
  // CALCULATE CART TOTAL
  // ===================================================

  const totalAmount =
    cart.reduce(
      (total, item) =>
        total +
        Number(item.price) *
          (item.quantity || 1),
      0
    );

  // ===================================================
  // AVAILABLE CITIES
  // ===================================================

  const availableCities =
    getCitiesByState(
      form.state
    );

  // ===================================================
  // INPUT CHANGE
  // ===================================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    let newValue = value;

    // Phone number:
    // only digits, maximum 10

    if (name === "phone") {
      newValue = value
        .replace(/\D/g, "")
        .slice(0, 10);
    }

    // PIN code:
    // only digits, maximum 6

    if (name === "pincode") {
      newValue = value
        .replace(/\D/g, "")
        .slice(0, 6);
    }

    setForm(
      (current) => ({
        ...current,
        [name]: newValue,
      })
    );

    setError("");
  };

  // ===================================================
  // STATE CHANGE
  // ===================================================

  const handleStateChange = (e) => {
    const newState =
      e.target.value;

    setForm(
      (current) => ({
        ...current,

        state: newState,

        // Reset city whenever
        // state changes

        city: "",
      })
    );

    setError("");
  };

  // ===================================================
  // PLACE ORDER
  // ===================================================

  const handleSubmit = async (
    e
  ) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // =====================================
    // CHECK LOGIN SESSION
    // =====================================

    const token =
      localStorage.getItem(
        "shopmindToken"
      );

    const storedUser =
      localStorage.getItem(
        "shopmindUser"
      );

    if (!token || !storedUser) {
      setError(
        "Please login before placing your order."
      );

      return;
    }

    // =====================================
    // CHECK CART
    // =====================================

    if (
      !cart ||
      cart.length === 0
    ) {
      setError(
        "Your cart is empty."
      );

      return;
    }

    // =====================================
    // FULL NAME
    // =====================================

    if (
      !form.fullName.trim()
    ) {
      setError(
        "Please enter your full name."
      );

      return;
    }

    // =====================================
    // PHONE NUMBER
    // =====================================

    if (
      !form.phone.trim()
    ) {
      setError(
        "Please enter your phone number."
      );

      return;
    }

    if (
      !/^[0-9]{10}$/.test(
        form.phone.trim()
      )
    ) {
      setError(
        "Please enter a valid 10-digit phone number."
      );

      return;
    }

    // =====================================
    // ADDRESS
    // =====================================

    if (
      !form.address.trim()
    ) {
      setError(
        "Please enter your delivery address."
      );

      return;
    }

    // =====================================
    // STATE
    // =====================================

    if (
      !form.state.trim()
    ) {
      setError(
        "Please select your state / union territory."
      );

      return;
    }

    // =====================================
    // CITY
    // =====================================

    if (
      !form.city.trim()
    ) {
      setError(
        "Please select your city."
      );

      return;
    }

    // =====================================
    // PINCODE
    // =====================================

    if (
      !/^[0-9]{6}$/.test(
        form.pincode.trim()
      )
    ) {
      setError(
        "Please enter a valid 6-digit PIN code."
      );

      return;
    }

    // =====================================
    // SEND ORDER TO BACKEND
    // =====================================

    try {
      setLoading(true);

      const response =
        await fetch(
          `${API_URL}/api/orders`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body:
              JSON.stringify({
                // =========================
                // CART ITEMS
                // =========================

                items:
                  cart.map(
                    (item) => ({
                      product:
                        item._id,

                      quantity:
                        item.quantity ||
                        1,
                    })
                  ),

                // =========================
                // SHIPPING ADDRESS
                // =========================

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

                // =========================
                // PAYMENT
                // =========================

                paymentMethod:
                  "COD",
              }),
          }
        );

      // =====================================
      // READ SERVER RESPONSE
      // =====================================

      let data;

      try {
        data =
          await response.json();
      } catch {
        throw new Error(
          "Invalid response from server."
        );
      }

      // =====================================
      // BACKEND ERROR
      // =====================================

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Could not place your order."
        );
      }

      // =====================================
      // ORDER SUCCESS
      // =====================================

      const createdOrder =
        data.order;

      // Save order ID

      setOrderId(
        createdOrder?._id || ""
      );

      // Save total before
      // App.jsx clears cart

      setConfirmedTotal(
        Number(
          createdOrder?.totalAmount
        ) || totalAmount
      );

      setSuccess(
        "🎉 Your order has been placed successfully!"
      );

      setError("");

      // =====================================
      // NOTIFY APP.JSX
      // =====================================

      if (
        typeof onOrderSuccess ===
        "function"
      ) {
        onOrderSuccess(
          createdOrder
        );
      }
    } catch (err) {
      console.error(
        "Checkout error:",
        err
      );

      setSuccess("");

      if (
        err instanceof TypeError
      ) {
        setError(
          "Cannot connect to the server. Please try again."
        );
      } else {
        setError(
          err.message ||
            "Could not place your order."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ===================================================
  // COMPONENT
  // ===================================================

  return (
    <div
      className="modal-overlay"
      onClick={
        success
          ? undefined
          : onClose
      }
    >
      <div
        className="checkout-modal"
        onClick={(e) =>
          e.stopPropagation()
        }
      >
        {/* =================================
            SUCCESS SCREEN
        ================================= */}

        {success ? (
          <div className="checkout-success">
            <div
              style={{
                fontSize: "70px",
                marginBottom: "15px",
              }}
            >
              ✅
            </div>

            <h2>
              Order Confirmed!
            </h2>

            <p>
              {success}
            </p>

            {/* ORDER ID */}

            {orderId && (
              <div className="order-id-box">
                <small>
                  Order ID
                </small>

                <strong>
                  {orderId}
                </strong>
              </div>
            )}

            {/* ORDER TOTAL */}

            <div className="success-total">
              <span>
                Order Total
              </span>

              <strong>
                ₹
                {confirmedTotal.toLocaleString(
                  "en-IN"
                )}
              </strong>
            </div>

            {/* PAYMENT */}

            <div className="payment-info">
              💵 Payment: Cash on Delivery
            </div>

            {/* NOTIFICATION INFO */}

            <div
              style={{
                marginTop: "15px",
                padding: "12px",
                borderRadius: "10px",
                background: "#f0fdf4",
                color: "#15803d",
                textAlign: "center",
              }}
            >
              📱 Order notification prepared for{" "}

              <strong>
                {form.phone}
              </strong>
            </div>

            {/* CONTINUE */}

            <button
              type="button"
              className="checkout-submit-btn"
              onClick={onClose}
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            {/* =================================
                CLOSE BUTTON
            ================================= */}

            <button
              type="button"
              className="close-btn"
              onClick={onClose}
            >
              ✕
            </button>

            {/* =================================
                HEADER
            ================================= */}

            <div className="checkout-header">
              <div
                style={{
                  fontSize: "45px",
                }}
              >
                📦
              </div>

              <h2>
                Checkout
              </h2>

              <p>
                Enter your delivery
                details to place your
                order.
              </p>
            </div>

            {/* =================================
                ERROR MESSAGE
            ================================= */}

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
                    "20px",

                  textAlign:
                    "center",
                }}
              >
                {error}
              </div>
            )}

            {/* =================================
                ORDER SUMMARY
            ================================= */}

            <div className="checkout-summary">
              <h3>
                🛒 Order Summary
              </h3>

              {cart.map(
                (item) => (
                  <div
                    className="checkout-item"
                    key={item._id}
                  >
                    <span>
                      {item.icon ||
                        "📦"}{" "}
                      {item.name}
                    </span>

                    <span>
                      {item.quantity ||
                        1}{" "}
                      × ₹
                      {Number(
                        item.price
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </span>
                  </div>
                )
              )}

              <div className="checkout-total">
                <span>
                  Total
                </span>

                <strong>
                  ₹
                  {totalAmount.toLocaleString(
                    "en-IN"
                  )}
                </strong>
              </div>
            </div>

            {/* =================================
                DELIVERY FORM
            ================================= */}

            <form
              className="checkout-form"
              onSubmit={
                handleSubmit
              }
            >
              <h3>
                🚚 Delivery Details
              </h3>

              {/* FULL NAME */}

              <label>
                Full Name

                <input
                  type="text"
                  name="fullName"
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
                  required
                />
              </label>

              {/* PHONE */}

              <label>
                Phone Number

                <input
                  type="tel"
                  name="phone"
                  value={
                    form.phone
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="10-digit phone number"
                  maxLength={10}
                  inputMode="numeric"
                  disabled={
                    loading
                  }
                  required
                />
              </label>

              {/* ADDRESS */}

              <label>
                Delivery Address

                <textarea
                  name="address"
                  value={
                    form.address
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="House / Flat, Street, Area..."
                  rows={3}
                  disabled={
                    loading
                  }
                  required
                />
              </label>

              {/* =================================
                  STATE + CITY
              ================================= */}

              <div className="checkout-row">
                {/* STATE */}

                <label>
                  State / Union Territory

                  <select
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
                    required
                  >
                    <option value="">
                      Select state / UT
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
                </label>

                {/* CITY */}

                <label>
                  City

                  <select
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
                    required
                  >
                    <option value="">
                      {form.state
                        ? "Select your city"
                        : "Select state first"}
                    </option>

                    {/* Keep an existing saved city
                        if it isn't in our current
                        static city list. */}

                    {form.city &&
                      !availableCities.includes(
                        form.city
                      ) && (
                        <option
                          value={
                            form.city
                          }
                        >
                          {form.city}
                        </option>
                      )}

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
                </label>
              </div>

              {/* PINCODE */}

              <label>
                PIN Code

                <input
                  type="text"
                  name="pincode"
                  value={
                    form.pincode
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="6-digit PIN code"
                  maxLength={6}
                  inputMode="numeric"
                  disabled={
                    loading
                  }
                  required
                />
              </label>

              {/* =================================
                  PAYMENT METHOD
              ================================= */}

              <div className="payment-method">
                <h3>
                  💳 Payment Method
                </h3>

                <div className="payment-option">
                  <input
                    type="radio"
                    checked
                    readOnly
                  />

                  <div>
                    <strong>
                      Cash on Delivery
                    </strong>

                    <p>
                      Pay when your
                      order is delivered.
                    </p>
                  </div>
                </div>
              </div>

              {/* =================================
                  PLACE ORDER BUTTON
              ================================= */}

              <button
                type="submit"
                className="checkout-submit-btn"
                disabled={
                  loading
                }
              >
                {loading
                  ? "Placing Order..."
                  : `Place Order • ₹${totalAmount.toLocaleString(
                      "en-IN"
                    )}`}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default CheckoutModal;