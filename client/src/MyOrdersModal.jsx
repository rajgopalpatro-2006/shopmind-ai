import { useEffect, useState } from "react";

import API_URL from "./api";

function MyOrdersModal({ onClose }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] =
    useState(null);

  // =========================
  // LOAD ORDERS
  // =========================

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem(
        "shopmindToken"
      );

      if (!token) {
        throw new Error(
          "Please login again to view your orders."
        );
      }

      const response = await fetch(
        `${API_URL}/api/orders/my-orders`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Could not load your orders."
        );
      }

      setOrders(data.orders || []);
    } catch (error) {
      console.error(
        "Load orders error:",
        error
      );

      setError(
        error.message ||
          "Could not load your orders."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // =========================
  // CANCEL ORDER
  // =========================

  const handleCancelOrder = async (
    orderId
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancellingId(orderId);
      setError("");

      const token = localStorage.getItem(
        "shopmindToken"
      );

      if (!token) {
        throw new Error(
          "Please login again to cancel your order."
        );
      }

      const response = await fetch(
        `${API_URL}/api/orders/${orderId}/cancel`,
        {
          method: "PUT",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type":
              "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Could not cancel order."
        );
      }

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order._id === orderId
            ? data.order
            : order
        )
      );
    } catch (error) {
      console.error(
        "Cancel order error:",
        error
      );

      setError(
        error.message ||
          "Could not cancel order."
      );
    } finally {
      setCancellingId(null);
    }
  };

  // =========================
  // FORMAT DATE
  // =========================

  const formatDate = (date) => {
    if (!date) {
      return "N/A";
    }

    return new Date(date).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // =========================
  // FORMAT PRICE
  // =========================

  const formatPrice = (price) => {
    return Number(
      price || 0
    ).toLocaleString("en-IN");
  };

  // =========================
  // STATUS CLASS
  // =========================

  const getStatusClass = (status) => {
    switch (status) {
      case "Placed":
        return "status-placed";

      case "Confirmed":
        return "status-confirmed";

      case "Shipped":
        return "status-shipped";

      case "Delivered":
        return "status-delivered";

      case "Cancelled":
        return "status-cancelled";

      default:
        return "status-placed";
    }
  };

  // =========================
  // CAN CANCEL?
  // =========================

  const canCancelOrder = (status) => {
    return (
      status === "Placed" ||
      status === "Confirmed"
    );
  };

  // =========================
  // ORDER TRACKER
  // =========================

  const orderSteps = [
    {
      name: "Placed",
      icon: "✓",
    },
    {
      name: "Confirmed",
      icon: "✓",
    },
    {
      name: "Shipped",
      icon: "🚚",
    },
    {
      name: "Delivered",
      icon: "📦",
    },
  ];

  const getCurrentStep = (status) => {
    switch (status) {
      case "Placed":
        return 0;

      case "Confirmed":
        return 1;

      case "Shipped":
        return 2;

      case "Delivered":
        return 3;

      default:
        return -1;
    }
  };

  // =========================
  // TRACKER COMPONENT
  // =========================

  const OrderTracker = ({ status }) => {
    // Cancelled order gets a
    // separate state.

    if (status === "Cancelled") {
      return (
        <div className="order-tracker-wrapper">
          <div className="tracker-title">
            Order Progress
          </div>

          <div className="tracker-cancelled">
            <div className="tracker-cancelled-icon">
              ✕
            </div>

            <div>
              <strong>
                Order Cancelled
              </strong>

              <p>
                This order will not
                be processed further.
              </p>
            </div>
          </div>
        </div>
      );
    }

    const currentStep =
      getCurrentStep(status);

    return (
      <div className="order-tracker-wrapper">
        <div className="tracker-title">
          Order Progress
        </div>

        <div className="order-tracker">
          {orderSteps.map(
            (step, index) => {
              const completed =
                index <= currentStep;

              const current =
                index === currentStep;

              return (
                <div
                  className="tracker-step"
                  key={step.name}
                >
                  {/* CONNECTING LINE */}

                  {index !== 0 && (
                    <div
                      className={`tracker-line ${
                        index <= currentStep
                          ? "tracker-line-complete"
                          : ""
                      }`}
                    />
                  )}

                  {/* CIRCLE */}

                  <div
                    className={`tracker-circle ${
                      completed
                        ? "tracker-complete"
                        : ""
                    } ${
                      current
                        ? "tracker-current"
                        : ""
                    }`}
                  >
                    {completed
                      ? step.icon
                      : "○"}
                  </div>

                  {/* LABEL */}

                  <div
                    className={`tracker-label ${
                      completed
                        ? "tracker-label-complete"
                        : ""
                    }`}
                  >
                    {step.name}
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>
    );
  };

  // =========================
  // UI
  // =========================

  return (
    <div
      className="orders-overlay"
      onClick={onClose}
    >
      <div
        className="orders-modal"
        onClick={(e) =>
          e.stopPropagation()
        }
      >
        {/* =====================
            HEADER
        ===================== */}

        <div className="orders-header">
          <div>
            <h2>📦 My Orders</h2>

            <p>
              Track and manage your
              ShopMind AI orders.
            </p>
          </div>

          <button
            type="button"
            className="orders-close-btn"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* ERROR */}

        {error && (
          <div className="orders-error">
            ⚠️ {error}
          </div>
        )}

        {/* LOADING */}

        {loading ? (
          <div className="orders-loading">
            <div className="orders-loader">
              📦
            </div>

            <h3>
              Loading your orders...
            </h3>

            <p>
              Please wait while we get
              your order history.
            </p>
          </div>
        ) : orders.length === 0 ? (
          /* EMPTY */

          <div className="orders-empty">
            <div className="orders-empty-icon">
              📦
            </div>

            <h3>
              No orders yet
            </h3>

            <p>
              Your ShopMind AI orders
              will appear here after
              checkout.
            </p>

            <button
              type="button"
              onClick={onClose}
              className="orders-shop-btn"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          /* =====================
              ORDER LIST
          ===================== */

          <div className="orders-list">
            {orders.map((order) => (
              <div
                className="order-card"
                key={order._id}
              >
                {/* ORDER TOP */}

                <div className="order-card-top">
                  <div className="order-meta">
                    <div>
                      <span className="order-label">
                        ORDER ID
                      </span>

                      <strong className="order-id">
                        #{order._id}
                      </strong>
                    </div>

                    <div>
                      <span className="order-label">
                        ORDER DATE
                      </span>

                      <strong>
                        {formatDate(
                          order.createdAt
                        )}
                      </strong>
                    </div>
                  </div>

                  <span
                    className={`order-status ${getStatusClass(
                      order.status
                    )}`}
                  >
                    {order.status ===
                      "Placed" &&
                      "🕒 "}

                    {order.status ===
                      "Confirmed" &&
                      "✓ "}

                    {order.status ===
                      "Shipped" &&
                      "🚚 "}

                    {order.status ===
                      "Delivered" &&
                      "✓ "}

                    {order.status ===
                      "Cancelled" &&
                      "✕ "}

                    {order.status}
                  </span>
                </div>

                {/* =====================
                    ORDER TRACKER
                ===================== */}

                <OrderTracker
                  status={order.status}
                />

                {/* MAIN CONTENT */}

                <div className="order-card-content">
                  {/* LEFT SIDE */}

                  <div className="order-items-section">
                    <h3>
                      🛒 Items (
                      {order.items?.length ||
                        0}
                      )
                    </h3>

                    <div className="order-products">
                      {order.items?.map(
                        (item, index) => (
                          <div
                            className="order-product"
                            key={
                              item._id ||
                              `${order._id}-${index}`
                            }
                          >
                            <div className="order-product-icon">
                              {item.icon ||
                                "📦"}
                            </div>

                            <div className="order-product-info">
                              <strong>
                                {
                                  item.name
                                }
                              </strong>

                              <span>
                                Qty:{" "}
                                {item.quantity ||
                                  1}
                              </span>
                            </div>

                            <strong className="order-product-price">
                              ₹
                              {formatPrice(
                                Number(
                                  item.price
                                ) *
                                  Number(
                                    item.quantity ||
                                      1
                                  )
                              )}
                            </strong>
                          </div>
                        )
                      )}
                    </div>

                    {/* TOTAL */}

                    <div className="order-total-row">
                      <span>
                        Order Total
                      </span>

                      <strong>
                        ₹
                        {formatPrice(
                          order.totalAmount
                        )}
                      </strong>
                    </div>
                  </div>

                  {/* RIGHT SIDE */}

                  <div className="order-details-section">
                    {/* ADDRESS */}

                    <div className="order-detail-box">
                      <h3>
                        🚚 Delivery Address
                      </h3>

                      <strong>
                        {
                          order
                            .shippingAddress
                            ?.fullName
                        }
                      </strong>

                      <p>
                        {
                          order
                            .shippingAddress
                            ?.address
                        }
                      </p>

                      <p>
                        {
                          order
                            .shippingAddress
                            ?.city
                        }
                        ,{" "}
                        {
                          order
                            .shippingAddress
                            ?.state
                        }{" "}
                        -{" "}
                        {
                          order
                            .shippingAddress
                            ?.pincode
                        }
                      </p>

                      <p className="order-phone">
                        📞{" "}
                        {
                          order
                            .shippingAddress
                            ?.phone
                        }
                      </p>
                    </div>

                    {/* PAYMENT */}

                    <div className="order-detail-box">
                      <h3>
                        💳 Payment
                      </h3>

                      <div className="payment-row">
                        <span>
                          Method
                        </span>

                        <strong>
                          {order.paymentMethod ===
                          "COD"
                            ? "Cash on Delivery"
                            : order.paymentMethod}
                        </strong>
                      </div>

                      <div className="payment-row">
                        <span>
                          Payment Status
                        </span>

                        <span
                          className={`payment-status ${
                            order.paymentStatus ===
                            "Paid"
                              ? "payment-paid"
                              : "payment-pending"
                          }`}
                        >
                          {order.paymentStatus ===
                          "Paid"
                            ? "✓ Paid"
                            : "● Pending"}
                        </span>
                      </div>
                    </div>

                    {/* CANCEL */}

                    {canCancelOrder(
                      order.status
                    ) && (
                      <button
                        type="button"
                        className="cancel-order-btn"
                        disabled={
                          cancellingId ===
                          order._id
                        }
                        onClick={() =>
                          handleCancelOrder(
                            order._id
                          )
                        }
                      >
                        {cancellingId ===
                        order._id
                          ? "Cancelling..."
                          : "✕ Cancel Order"}
                      </button>
                    )}

                    {/* CANCELLED */}

                    {order.status ===
                      "Cancelled" && (
                      <div className="order-cancelled-message">
                        This order has
                        been cancelled.
                      </div>
                    )}

                    {/* DELIVERED */}

                    {order.status ===
                      "Delivered" && (
                      <div className="order-delivered-message">
                        ✓ Order delivered
                        successfully.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyOrdersModal;