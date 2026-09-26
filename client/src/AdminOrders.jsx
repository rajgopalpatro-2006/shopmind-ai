import { useEffect, useState } from "react";
import API_URL from "./api";

function AdminOrders({ onClose }) {
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [updatingId, setUpdatingId] =
    useState(null);

  // =========================
  // LOAD ALL ORDERS
  // =========================

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem(
          "shopmindToken"
        );

      if (!token) {
        throw new Error(
          "Admin login required."
        );
      }

      const response = await fetch(
        `${API_URL}/api/orders/admin/all`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
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
            "Could not load orders."
        );
      }

      setOrders(
        data.orders || []
      );
    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          "Could not load orders."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // =========================
  // UPDATE STATUS
  // =========================

  const updateOrderStatus =
    async (
      orderId,
      status
    ) => {
      try {
        setUpdatingId(
          orderId
        );

        setError("");

        const token =
          localStorage.getItem(
            "shopmindToken"
          );

        if (!token) {
          throw new Error(
            "Admin login required."
          );
        }

        const response =
          await fetch(
            `${API_URL}/api/orders/${orderId}/status`,
            {
              method: "PUT",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body:
                JSON.stringify({
                  status,
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
              "Could not update order."
          );
        }

        setOrders(
          (
            currentOrders
          ) =>
            currentOrders.map(
              (order) =>
                order._id ===
                orderId
                  ? {
                      ...order,

                      ...data.order,

                      // Keep populated user
                      user:
                        data.order
                          .user ||
                        order.user,
                    }
                  : order
            )
        );
      } catch (error) {
        console.error(
          error
        );

        setError(
          error.message ||
            "Could not update order."
        );
      } finally {
        setUpdatingId(
          null
        );
      }
    };

  // =========================
  // FORMAT PRICE
  // =========================

  const formatPrice = (
    price
  ) =>
    Number(
      price || 0
    ).toLocaleString(
      "en-IN"
    );

  // =========================
  // FORMAT DATE
  // =========================

  const formatDate = (
    date
  ) => {
    if (!date) {
      return "N/A";
    }

    return new Date(
      date
    ).toLocaleString(
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

  return (
    <div
      className="orders-overlay"
      onClick={onClose}
    >
      <div
        className="orders-modal admin-orders-modal"
        onClick={(e) =>
          e.stopPropagation()
        }
      >
        {/* HEADER */}

        <div className="orders-header">
          <div>
            <h2>
              ⚙️ Manage Orders
            </h2>

            <p>
              View customer orders
              and update delivery
              status.
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
              Loading orders...
            </h3>
          </div>
        ) : orders.length ===
          0 ? (
          <div className="orders-empty">
            <div className="orders-empty-icon">
              📦
            </div>

            <h3>
              No orders yet
            </h3>

            <p>
              Customer orders will
              appear here.
            </p>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(
              (order) => (
                <div
                  className="order-card"
                  key={order._id}
                >
                  {/* TOP */}

                  <div className="order-card-top">
                    <div className="order-meta">
                      <div>
                        <span className="order-label">
                          ORDER ID
                        </span>

                        <strong>
                          #
                          {
                            order._id
                          }
                        </strong>
                      </div>

                      <div>
                        <span className="order-label">
                          DATE
                        </span>

                        <strong>
                          {formatDate(
                            order.createdAt
                          )}
                        </strong>
                      </div>
                    </div>

                    <span
                      className={`order-status status-${(
                        order.status ||
                        "Placed"
                      ).toLowerCase()}`}
                    >
                      {
                        order.status
                      }
                    </span>
                  </div>

                  <div className="order-card-content">
                    {/* LEFT */}

                    <div className="order-items-section">
                      <h3>
                        👤 Customer
                      </h3>

                      <div className="admin-customer">
                        <strong>
                          {order
                            .user
                            ?.name ||
                            "Unknown User"}
                        </strong>

                        <span>
                          {order
                            .user
                            ?.email ||
                            "No email"}
                        </span>
                      </div>

                      <h3
                        style={{
                          marginTop:
                            "25px",
                        }}
                      >
                        🛒 Items
                      </h3>

                      <div className="order-products">
                        {order.items?.map(
                          (
                            item,
                            index
                          ) => (
                            <div
                              className="order-product"
                              key={
                                item._id ||
                                index
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
                                  {
                                    item.quantity
                                  }
                                </span>
                              </div>

                              <strong className="order-product-price">
                                ₹
                                {formatPrice(
                                  Number(
                                    item.price
                                  ) *
                                    Number(
                                      item.quantity
                                    )
                                )}
                              </strong>
                            </div>
                          )
                        )}
                      </div>

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

                    {/* RIGHT */}

                    <div className="order-details-section">
                      <div className="order-detail-box">
                        <h3>
                          🚚 Delivery
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

                        <p>
                          📞{" "}
                          {
                            order
                              .shippingAddress
                              ?.phone
                          }
                        </p>
                      </div>

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
                            Status
                          </span>

                          <strong>
                            {
                              order.paymentStatus
                            }
                          </strong>
                        </div>
                      </div>

                      {/* STATUS CONTROL */}

                      <div className="order-detail-box">
                        <h3>
                          🚚 Update
                          Status
                        </h3>

                        <select
                          className="admin-status-select"
                          value={
                            order.status
                          }
                          disabled={
                            updatingId ===
                            order._id
                          }
                          onChange={(
                            e
                          ) =>
                            updateOrderStatus(
                              order._id,
                              e.target
                                .value
                            )
                          }
                        >
                          <option value="Placed">
                            Placed
                          </option>

                          <option value="Confirmed">
                            Confirmed
                          </option>

                          <option value="Shipped">
                            Shipped
                          </option>

                          <option value="Delivered">
                            Delivered
                          </option>

                          <option value="Cancelled">
                            Cancelled
                          </option>
                        </select>

                        {updatingId ===
                          order._id && (
                          <p className="admin-updating">
                            Updating...
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminOrders;