import { useEffect, useState } from "react";

export default function MyOrdersModal({
  isOpen,
  onClose,
  token,
  apiUrl,
}) {
  // =====================================================
  // STATE
  // =====================================================

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [cancellingOrderId, setCancellingOrderId] =
    useState("");

  // =====================================================
  // LOAD ORDERS
  // =====================================================

  useEffect(() => {
    if (!isOpen || !token) {
      return;
    }

    fetchOrders();
  }, [isOpen, token]);

  // =====================================================
  // FETCH MY ORDERS
  // =====================================================

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${apiUrl}/api/orders/my-orders`,
        {
          method: "GET",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "Invalid response received from the server."
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Unable to load your orders."
        );
      }

      // Supports different backend response styles
      const orderList =
        data?.orders ||
        data?.data ||
        data ||
        [];

      setOrders(
        Array.isArray(orderList)
          ? orderList
          : []
      );
    } catch (err) {
      console.error(
        "Load orders error:",
        err
      );

      setError(
        err.message ||
          "Something went wrong while loading your orders."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FORMAT PRICE
  // =====================================================

  const formatPrice = (price) => {
    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }
    ).format(
      Number(price || 0)
    );
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "Date unavailable";
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "Date unavailable";
    }

    return parsedDate.toLocaleString(
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

  // =====================================================
  // SHORT ORDER ID
  // =====================================================

  const getShortOrderId = (
    orderId
  ) => {
    if (!orderId) {
      return "N/A";
    }

    const id =
      String(orderId);

    if (id.length <= 10) {
      return id.toUpperCase();
    }

    return id
      .slice(-10)
      .toUpperCase();
  };

  // =====================================================
  // PRODUCT ID
  // =====================================================

  const getProductId = (
    item,
    index
  ) => {
    if (
      item?.product &&
      typeof item.product ===
        "object"
    ) {
      return (
        item.product._id ||
        item.product.id ||
        item._id ||
        index
      );
    }

    return (
      item?.product ||
      item?._id ||
      item?.id ||
      index
    );
  };

  // =====================================================
  // PRODUCT IMAGE
  //
  // New orders:
  // item.image
  //
  // Also supports populated product.image if your backend
  // later populates the Product reference.
  // =====================================================

  const getProductImage = (
    item
  ) => {
    return (
      item?.image ||
      item?.product?.image ||
      ""
    );
  };

  // =====================================================
  // PRODUCT ICON
  // =====================================================

  const getProductIcon = (
    item
  ) => {
    return (
      item?.icon ||
      item?.product?.icon ||
      "📦"
    );
  };

  // =====================================================
  // IMAGE ERROR
  // =====================================================

  const handleImageError = (
    event
  ) => {
    const image =
      event.currentTarget;

    image.style.display =
      "none";

    const fallback =
      image.nextElementSibling;

    if (fallback) {
      fallback.style.display =
        "flex";
    }
  };

  // =====================================================
  // TOTAL ITEMS
  // =====================================================

  const getTotalItems = (
    order
  ) => {
    if (
      !Array.isArray(
        order?.items
      )
    ) {
      return 0;
    }

    return order.items.reduce(
      (total, item) =>
        total +
        Number(
          item.quantity || 1
        ),
      0
    );
  };

  // =====================================================
  // STATUS CLASS
  // =====================================================

  const getStatusClass = (
    status
  ) => {
    switch (
      String(
        status || ""
      ).toLowerCase()
    ) {
      case "placed":
        return "status-placed";

      case "confirmed":
        return "status-confirmed";

      case "shipped":
        return "status-shipped";

      case "delivered":
        return "status-delivered";

      case "cancelled":
        return "status-cancelled";

      default:
        return "";
    }
  };

  // =====================================================
  // STATUS ICON
  // =====================================================

  const getStatusIcon = (
    status
  ) => {
    switch (
      String(
        status || ""
      ).toLowerCase()
    ) {
      case "placed":
        return "📝";

      case "confirmed":
        return "✅";

      case "shipped":
        return "🚚";

      case "delivered":
        return "📦";

      case "cancelled":
        return "❌";

      default:
        return "📋";
    }
  };

  // =====================================================
  // PAYMENT STATUS CLASS
  // =====================================================

  const getPaymentStatusClass = (
    status
  ) => {
    switch (
      String(
        status || ""
      ).toLowerCase()
    ) {
      case "paid":
        return "payment-paid";

      case "failed":
        return "payment-failed";

      default:
        return "payment-pending";
    }
  };

  // =====================================================
  // CAN CANCEL ORDER
  // =====================================================

  const canCancelOrder = (
    order
  ) => {
    const status =
      String(
        order?.status || ""
      ).toLowerCase();

    return (
      status === "placed" ||
      status === "confirmed"
    );
  };

  // =====================================================
  // CANCEL ORDER
  // =====================================================

  const handleCancelOrder =
    async (orderId) => {
      if (!orderId) {
        return;
      }

      const confirmed =
        window.confirm(
          "Are you sure you want to cancel this order?"
        );

      if (!confirmed) {
        return;
      }

      try {
        setCancellingOrderId(
          orderId
        );

        setError("");

        const response =
          await fetch(
            `${apiUrl}/api/orders/${orderId}/cancel`,
            {
              method: "PATCH",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },
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
              "Unable to cancel this order."
          );
        }

        // Update the cancelled order immediately
        setOrders(
          (currentOrders) =>
            currentOrders.map(
              (order) => {
                if (
                  order._id !==
                  orderId
                ) {
                  return order;
                }

                return (
                  data?.order ||
                  data?.data ||
                  {
                    ...order,
                    status:
                      "Cancelled",
                  }
                );
              }
            )
        );
      } catch (err) {
        console.error(
          "Cancel order error:",
          err
        );

        setError(
          err.message ||
            "Something went wrong while cancelling your order."
        );
      } finally {
        setCancellingOrderId(
          ""
        );
      }
    };

  // =====================================================
  // CLOSE IF NOT OPEN
  // =====================================================

  if (!isOpen) {
    return null;
  }

  // =====================================================
  // JSX
  // =====================================================

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
    >
      <div
        className="orders-modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="orders-header">
          <div>
            <div className="orders-title-row">
              <span className="orders-title-icon">
                📦
              </span>

              <div>
                <h2>
                  My Orders
                </h2>

                <p>
                  Track and manage your
                  ShopMind AI orders.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="close-btn"
            onClick={onClose}
            aria-label="Close orders"
          >
            ✕
          </button>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="auth-message auth-error">
            ⚠️ {error}
          </div>
        )}

        {/* =================================================
            LOADING
        ================================================= */}

        {loading ? (
          <div className="orders-loading">
            <div className="orders-loading-icon">
              ⏳
            </div>

            <h3>
              Loading your orders...
            </h3>

            <p>
              Please wait while we
              retrieve your order
              history.
            </p>
          </div>
        ) : orders.length ===
          0 ? (
          /* ===============================================
             EMPTY ORDERS
          =============================================== */

          <div className="orders-empty">
            <div className="orders-empty-icon">
              📦
            </div>

            <h3>
              No orders yet
            </h3>

            <p>
              Your placed orders will
              appear here.
            </p>

            <button
              type="button"
              className="continue-shopping-btn"
              onClick={onClose}
            >
              ← Start Shopping
            </button>
          </div>
        ) : (
          /* ===============================================
             ORDERS LIST
          =============================================== */

          <div className="orders-list">
            {orders.map(
              (order) => {
                const orderId =
                  order._id ||
                  order.id;

                const items =
                  Array.isArray(
                    order.items
                  )
                    ? order.items
                    : [];

                const totalItems =
                  getTotalItems(
                    order
                  );

                return (
                  <div
                    className="order-card"
                    key={orderId}
                  >
                    {/* =====================================
                        ORDER TOP
                    ===================================== */}

                    <div className="order-card-header">
                      <div>
                        <span className="order-label">
                          ORDER ID
                        </span>

                        <h3 className="order-number">
                          #
                          {getShortOrderId(
                            orderId
                          )}
                        </h3>

                        <p className="order-date">
                          {formatDate(
                            order.createdAt
                          )}
                        </p>
                      </div>

                      <div className="order-header-right">
                        <span
                          className={`order-status ${getStatusClass(
                            order.status
                          )}`}
                        >
                          {getStatusIcon(
                            order.status
                          )}{" "}
                          {order.status ||
                            "Placed"}
                        </span>
                      </div>
                    </div>

                    {/* =====================================
                        ORDER SUMMARY STRIP
                    ===================================== */}

                    <div className="order-quick-summary">
                      <div>
                        <span>
                          Items
                        </span>

                        <strong>
                          {totalItems}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Payment
                        </span>

                        <strong>
                          {order.paymentMethod ||
                            "COD"}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Total
                        </span>

                        <strong>
                          {formatPrice(
                            order.totalAmount
                          )}
                        </strong>
                      </div>
                    </div>

                    {/* =====================================
                        PRODUCTS
                    ===================================== */}

                    <div className="order-products">
                      <h4>
                        Products
                      </h4>

                      {items.map(
                        (
                          item,
                          index
                        ) => {
                          const image =
                            getProductImage(
                              item
                            );

                          const icon =
                            getProductIcon(
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
                              className="order-product"
                              key={getProductId(
                                item,
                                index
                              )}
                            >
                              {/* ===========================
                                  REAL PRODUCT IMAGE
                              =========================== */}

                              <div className="order-product-icon">
                                {image ? (
                                  <img
                                    src={
                                      image
                                    }
                                    alt={
                                      item.name ||
                                      "Product"
                                    }
                                    className="order-product-image"
                                    loading="lazy"
                                    onError={
                                      handleImageError
                                    }
                                  />
                                ) : null}

                                <span
                                  className="order-product-image-fallback"
                                  style={{
                                    display:
                                      image
                                        ? "none"
                                        : "flex",
                                  }}
                                >
                                  {
                                    icon
                                  }
                                </span>
                              </div>

                              {/* ===========================
                                  PRODUCT INFO
                              =========================== */}

                              <div className="order-product-info">
                                <h5>
                                  {item.name ||
                                    "Product"}
                                </h5>

                                <div className="order-product-meta">
                                  <span>
                                    {formatPrice(
                                      price
                                    )}
                                  </span>

                                  <span>
                                    ×
                                  </span>

                                  <span>
                                    Qty{" "}
                                    {
                                      quantity
                                    }
                                  </span>
                                </div>
                              </div>

                              {/* ===========================
                                  ITEM TOTAL
                              =========================== */}

                              <div className="order-product-price">
                                <span>
                                  Item Total
                                </span>

                                <strong>
                                  {formatPrice(
                                    itemTotal
                                  )}
                                </strong>
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>

                    {/* =====================================
                        DELIVERY ADDRESS
                    ===================================== */}

                    {order.shippingAddress && (
                      <div className="order-details-section">
                        <div className="order-section-heading">
                          <span>
                            📍
                          </span>

                          <h4>
                            Delivery
                            Address
                          </h4>
                        </div>

                        <div className="order-address">
                          <strong>
                            {order
                              .shippingAddress
                              .fullName ||
                              ""}
                          </strong>

                          <p>
                            {order
                              .shippingAddress
                              .address ||
                              ""}
                          </p>

                          <p>
                            {order
                              .shippingAddress
                              .city ||
                              ""}
                            {order
                              .shippingAddress
                              .city &&
                            order
                              .shippingAddress
                              .state
                              ? ", "
                              : ""}
                            {order
                              .shippingAddress
                              .state ||
                              ""}
                            {order
                              .shippingAddress
                              .pincode
                              ? ` - ${order.shippingAddress.pincode}`
                              : ""}
                          </p>

                          {order
                            .shippingAddress
                            .phone && (
                            <p>
                              📞{" "}
                              {
                                order
                                  .shippingAddress
                                  .phone
                              }
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* =====================================
                        PAYMENT INFORMATION
                    ===================================== */}

                    <div className="order-details-section">
                      <div className="order-section-heading">
                        <span>
                          💳
                        </span>

                        <h4>
                          Payment
                        </h4>
                      </div>

                      <div className="order-payment-details">
                        <div>
                          <span>
                            Payment
                            Method
                          </span>

                          <strong>
                            {order.paymentMethod ||
                              "COD"}
                          </strong>
                        </div>

                        <div>
                          <span>
                            Payment
                            Status
                          </span>

                          <strong
                            className={getPaymentStatusClass(
                              order.paymentStatus
                            )}
                          >
                            {order.paymentStatus ||
                              "Pending"}
                          </strong>
                        </div>
                      </div>
                    </div>

                    {/* =====================================
                        ORDER TRACKING
                    ===================================== */}

                    <div className="order-details-section">
                      <div className="order-section-heading">
                        <span>
                          🚚
                        </span>

                        <h4>
                          Order Tracking
                        </h4>
                      </div>

                      {String(
                        order.status ||
                          ""
                      ).toLowerCase() ===
                      "cancelled" ? (
                        <div className="order-cancelled-message">
                          ❌ This order has
                          been cancelled.
                        </div>
                      ) : (
                        <div className="order-tracking">
                          {/* PLACED */}

                          <div
                            className={`tracking-step ${
                              [
                                "placed",
                                "confirmed",
                                "shipped",
                                "delivered",
                              ].includes(
                                String(
                                  order.status ||
                                    ""
                                ).toLowerCase()
                              )
                                ? "active"
                                : ""
                            }`}
                          >
                            <span className="tracking-dot">
                              ✓
                            </span>

                            <span>
                              Placed
                            </span>
                          </div>

                          <div className="tracking-line" />

                          {/* CONFIRMED */}

                          <div
                            className={`tracking-step ${
                              [
                                "confirmed",
                                "shipped",
                                "delivered",
                              ].includes(
                                String(
                                  order.status ||
                                    ""
                                ).toLowerCase()
                              )
                                ? "active"
                                : ""
                            }`}
                          >
                            <span className="tracking-dot">
                              ✓
                            </span>

                            <span>
                              Confirmed
                            </span>
                          </div>

                          <div className="tracking-line" />

                          {/* SHIPPED */}

                          <div
                            className={`tracking-step ${
                              [
                                "shipped",
                                "delivered",
                              ].includes(
                                String(
                                  order.status ||
                                    ""
                                ).toLowerCase()
                              )
                                ? "active"
                                : ""
                            }`}
                          >
                            <span className="tracking-dot">
                              ✓
                            </span>

                            <span>
                              Shipped
                            </span>
                          </div>

                          <div className="tracking-line" />

                          {/* DELIVERED */}

                          <div
                            className={`tracking-step ${
                              String(
                                order.status ||
                                  ""
                              ).toLowerCase() ===
                              "delivered"
                                ? "active"
                                : ""
                            }`}
                          >
                            <span className="tracking-dot">
                              ✓
                            </span>

                            <span>
                              Delivered
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* =====================================
                        ORDER TOTAL
                    ===================================== */}

                    <div className="order-total-section">
                      <div>
                        <span>
                          Order Total
                        </span>

                        <strong>
                          {formatPrice(
                            order.totalAmount
                          )}
                        </strong>
                      </div>
                    </div>

                    {/* =====================================
                        CANCEL ORDER
                    ===================================== */}

                    {canCancelOrder(
                      order
                    ) && (
                      <div className="order-actions">
                        <button
                          type="button"
                          className="cancel-order-btn"
                          onClick={() =>
                            handleCancelOrder(
                              orderId
                            )
                          }
                          disabled={
                            cancellingOrderId ===
                            orderId
                          }
                        >
                          {cancellingOrderId ===
                          orderId
                            ? "Cancelling..."
                            : "Cancel Order"}
                        </button>
                      </div>
                    )}
                  </div>
                );
              }
            )}
          </div>
        )}

        {/* =================================================
            FOOTER
        ================================================= */}

        {!loading &&
          orders.length >
            0 && (
            <div className="orders-footer">
              <button
                type="button"
                className="continue-shopping-btn"
                onClick={onClose}
              >
                ← Continue Shopping
              </button>

              <button
                type="button"
                className="orders-refresh-btn"
                onClick={
                  fetchOrders
                }
              >
                🔄 Refresh Orders
              </button>
            </div>
          )}
      </div>
    </div>
  );
}