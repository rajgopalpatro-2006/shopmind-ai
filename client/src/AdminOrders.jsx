import { useEffect, useState } from "react";
import API_URL from "./api";

function AdminOrders({
  onClose,
  user,
  token,
  apiUrl,
}) {
  // =================================================
  // STATE
  // =================================================

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  // =================================================
  // FINAL API URL
  // =================================================

  const baseApiUrl =
    apiUrl || API_URL;

  // =================================================
  // AUTH TOKEN
  // =================================================

  const authToken =
    token ||
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    "";

  // =================================================
  // LOAD ALL ORDERS
  // =================================================

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");

      // =============================================
      // CHECK ADMIN LOGIN
      // =============================================

      if (!authToken) {
        throw new Error(
          "Admin login required. Please log in again."
        );
      }

      // =============================================
      // CHECK ADMIN ROLE
      // =============================================

      if (
        user &&
        user.role !== "admin"
      ) {
        throw new Error(
          "Admin access required."
        );
      }

      // =============================================
      // REQUEST ALL ORDERS
      // =============================================

      const response = await fetch(
        `${baseApiUrl}/api/orders/admin/all`,
        {
          method: "GET",

          headers: {
            Authorization:
              `Bearer ${authToken}`,
          },
        }
      );

      // =============================================
      // READ RESPONSE
      // =============================================

      let data;

      try {
        data =
          await response.json();
      } catch {
        throw new Error(
          "Server returned an invalid response."
        );
      }

      // =============================================
      // HANDLE ERROR
      // =============================================

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            data.error ||
            "Could not load orders."
        );
      }

      // =============================================
      // SAVE ORDERS
      // =============================================

      setOrders(
        data.orders || []
      );
    } catch (error) {
      console.error(
        "Admin orders error:",
        error
      );

      setError(
        error.message ||
          "Could not load orders."
      );
    } finally {
      setLoading(false);
    }
  };

  // =================================================
  // LOAD ORDERS WHEN MODAL OPENS
  // =================================================

  useEffect(() => {
    loadOrders();
  }, [authToken, baseApiUrl]);

  // =================================================
  // UPDATE ORDER STATUS
  // =================================================

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

        // ===========================================
        // CHECK TOKEN
        // ===========================================

        if (!authToken) {
          throw new Error(
            "Admin login required. Please log in again."
          );
        }

        // ===========================================
        // CHECK ADMIN
        // ===========================================

        if (
          user &&
          user.role !== "admin"
        ) {
          throw new Error(
            "Admin access required."
          );
        }

        // ===========================================
        // UPDATE STATUS REQUEST
        // ===========================================

        const response =
          await fetch(
            `${baseApiUrl}/api/orders/${orderId}/status`,
            {
              method: "PUT",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${authToken}`,
              },

              body:
                JSON.stringify({
                  status,
                }),
            }
          );

        // ===========================================
        // READ RESPONSE
        // ===========================================

        let data;

        try {
          data =
            await response.json();
        } catch {
          throw new Error(
            "Server returned an invalid response."
          );
        }

        // ===========================================
        // HANDLE ERROR
        // ===========================================

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              data.error ||
              "Could not update order."
          );
        }

        // ===========================================
        // UPDATE LOCAL ORDER LIST
        // ===========================================

        setOrders(
          (currentOrders) =>
            currentOrders.map(
              (order) =>
                order._id ===
                orderId
                  ? {
                      ...order,
                      ...data.order,

                      user:
                        data.order
                          ?.user ||
                        order.user,
                    }
                  : order
            )
        );
      } catch (error) {
        console.error(
          "Update order error:",
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

  // =================================================
  // FORMAT PRICE
  // =================================================

  const formatPrice = (
    price
  ) =>
    Number(
      price || 0
    ).toLocaleString(
      "en-IN"
    );

  // =================================================
  // FORMAT DATE
  // =================================================

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
    // =================================================
  // RETURN
  // =================================================

  return (
    <div
      className="orders-overlay"
      onClick={onClose}
    >
      <div
        className="orders-modal admin-orders-modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        {/* ===========================================
            HEADER
        =========================================== */}

        <div className="orders-header">
          <div>
            <h2>
              ⚙️ Manage Orders
            </h2>

            <p>
              View customer orders and
              update delivery status.
            </p>
          </div>

          <button
            type="button"
            className="orders-close-btn"
            onClick={onClose}
            aria-label="Close admin orders"
          >
            ✕
          </button>
        </div>

        {/* ===========================================
            ADMIN INFORMATION
        =========================================== */}

        {user?.role ===
          "admin" && (
          <div className="admin-orders-user">
            <span>
              👤 Logged in as
            </span>

            <strong>
              {user.name ||
                "Administrator"}
            </strong>
          </div>
        )}

        {/* ===========================================
            ERROR MESSAGE
        =========================================== */}

        {error && (
          <div className="orders-error">
            ⚠️ {error}
          </div>
        )}

        {/* ===========================================
            LOADING
        =========================================== */}

        {loading ? (
          <div className="orders-loading">
            <div className="orders-loader">
              📦
            </div>

            <h3>
              Loading orders...
            </h3>

            <p>
              Fetching customer orders.
            </p>
          </div>
        ) : orders.length === 0 ? (
          /* =========================================
             EMPTY ORDERS
          ========================================= */

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
          /* =========================================
             ORDER LIST
          ========================================= */

          <div className="orders-list">
            {orders.map(
              (order) => (
                <div
                  className="order-card"
                  key={order._id}
                >
                  {/* ===============================
                      ORDER TOP
                  =============================== */}

                  <div className="order-card-top">
                    <div className="order-meta">
                      <div>
                        <span className="order-label">
                          ORDER ID
                        </span>

                        <strong>
                          #{order._id}
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
                      )
                        .toLowerCase()
                        .replace(
                          /\s+/g,
                          "-"
                        )}`}
                    >
                      {order.status ||
                        "Placed"}
                    </span>
                  </div>

                  {/* ===============================
                      ORDER CONTENT
                  =============================== */}

                  <div className="order-card-content">
                    {/* =============================
                        LEFT SIDE
                    ============================= */}

                    <div className="order-items-section">
                      <h3>
                        👤 Customer
                      </h3>

                      <div className="admin-customer">
                        <strong>
                          {order.user
                            ?.name ||
                            "Unknown User"}
                        </strong>

                        <span>
                          {order.user
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
                                `${order._id}-${index}`
                              }
                            >
                              <div className="order-product-icon">
                                {item.icon ||
                                  "📦"}
                              </div>

                              <div className="order-product-info">
                                <strong>
                                  {item.name ||
                                    "Product"}
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
                                    item.price ||
                                      0
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
                                        {/* =============================
                        RIGHT SIDE
                    ============================= */}

                    <div className="order-details-section">

                      {/* ===========================
                          DELIVERY DETAILS
                      =========================== */}

                      <div className="order-detail-box">
                        <h3>
                          🚚 Delivery
                        </h3>

                        <strong>
                          {order
                            .shippingAddress
                            ?.fullName ||
                            order.user
                              ?.name ||
                            "Customer"}
                        </strong>

                        <p>
                          {order
                            .shippingAddress
                            ?.address ||
                            "Address not available"}
                        </p>

                        <p>
                          {order
                            .shippingAddress
                            ?.city ||
                            ""}

                          {order
                            .shippingAddress
                            ?.city &&
                          order
                            .shippingAddress
                            ?.state
                            ? ", "
                            : ""}

                          {order
                            .shippingAddress
                            ?.state ||
                            ""}

                          {order
                            .shippingAddress
                            ?.pincode
                            ? ` - ${order.shippingAddress.pincode}`
                            : ""}
                        </p>

                        <p>
                          📞{" "}
                          {order
                            .shippingAddress
                            ?.phone ||
                            "Phone not available"}
                        </p>
                      </div>

                      {/* ===========================
                          PAYMENT DETAILS
                      =========================== */}

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
                              : order.paymentMethod ||
                                "N/A"}
                          </strong>
                        </div>

                        <div className="payment-row">
                          <span>
                            Status
                          </span>

                          <strong>
                            {order.paymentStatus ||
                              "Pending"}
                          </strong>
                        </div>
                      </div>

                      {/* ===========================
                          UPDATE ORDER STATUS
                      =========================== */}

                      <div className="order-detail-box">
                        <h3>
                          🚚 Update Status
                        </h3>

                        <select
                          className="admin-status-select"
                          value={
                            order.status ||
                            "Placed"
                          }
                          disabled={
                            updatingId ===
                            order._id
                          }
                          onChange={(
                            event
                          ) =>
                            updateOrderStatus(
                              order._id,
                              event.target
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