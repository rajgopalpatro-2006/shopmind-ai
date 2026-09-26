import API_URL from "./api";
import { useEffect, useState } from "react";

function AdminDashboard({
  onClose,
  onOpenProducts,
  onOpenOrders,
}) {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================
  // LOAD DASHBOARD DATA
  // =====================================

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem(
          "shopmindToken"
        );

        if (!token) {
          throw new Error(
            "Admin login required."
          );
        }

        // =====================================
        // PRODUCTS
        // =====================================

        const productResponse = await fetch(
          `${API_URL}/api/products`
        );

        const productData =
          await productResponse.json();

        if (
          !productResponse.ok ||
          !productData.success
        ) {
          throw new Error(
            productData.message ||
              "Could not load products."
          );
        }

        // =====================================
        // ORDERS
        // =====================================

        const orderResponse = await fetch(
          `${API_URL}/api/orders/admin/all`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const orderData =
          await orderResponse.json();

        if (
          !orderResponse.ok ||
          !orderData.success
        ) {
          throw new Error(
            orderData.message ||
              "Could not load orders."
          );
        }

        // =====================================
        // USERS
        // =====================================

        const userResponse = await fetch(
          `${API_URL}/api/auth/admin/users`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const userData =
          await userResponse.json();

        if (
          !userResponse.ok ||
          !userData.success
        ) {
          throw new Error(
            userData.message ||
              "Could not load customers."
          );
        }

        setProducts(
          productData.products || []
        );

        setOrders(
          orderData.orders || []
        );

        setUsers(
          userData.users || []
        );
      } catch (error) {
        console.error(
          "Dashboard error:",
          error
        );

        setError(
          error.message ||
            "Could not load dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  // =====================================
  // BASIC STATISTICS
  // =====================================

  const totalProducts =
    products.length;

  const totalOrders =
    orders.length;

  const totalUsers =
    users.length;

  const totalCustomers =
    users.filter(
      (user) =>
        user.role !== "admin"
    ).length;

  const totalAdmins =
    users.filter(
      (user) =>
        user.role === "admin"
    ).length;

  // =====================================
  // INVENTORY STATISTICS
  // =====================================

  const totalInventory =
    products.reduce(
      (total, product) =>
        total +
        Number(
          product.stock || 0
        ),
      0
    );

  const lowStockProducts =
    products.filter(
      (product) => {
        const stock =
          Number(
            product.stock || 0
          );

        return (
          stock > 0 &&
          stock <= 5
        );
      }
    ).length;

  const outOfStockProducts =
    products.filter(
      (product) =>
        Number(
          product.stock || 0
        ) === 0
    ).length;

  const inventoryValue =
    products.reduce(
      (total, product) =>
        total +
        Number(
          product.price || 0
        ) *
          Number(
            product.stock || 0
          ),
      0
    );

  // =====================================
  // ORDER STATISTICS
  // =====================================

  const activeOrders =
    orders.filter(
      (order) =>
        order.status !==
          "Delivered" &&
        order.status !==
          "Cancelled"
    ).length;

  const placedOrders =
    orders.filter(
      (order) =>
        order.status ===
        "Placed"
    ).length;

  const confirmedOrders =
    orders.filter(
      (order) =>
        order.status ===
        "Confirmed"
    ).length;

  const shippedOrders =
    orders.filter(
      (order) =>
        order.status ===
        "Shipped"
    ).length;

  const deliveredOrders =
    orders.filter(
      (order) =>
        order.status ===
        "Delivered"
    ).length;

  const cancelledOrders =
    orders.filter(
      (order) =>
        order.status ===
        "Cancelled"
    ).length;

  // =====================================
  // REVENUE
  // =====================================

  const deliveredOrderList =
    orders.filter(
      (order) =>
        order.status ===
        "Delivered"
    );

  const totalRevenue =
    deliveredOrderList.reduce(
      (total, order) =>
        total +
        Number(
          order.totalAmount || 0
        ),
      0
    );

  const averageOrderValue =
    deliveredOrders > 0
      ? totalRevenue /
        deliveredOrders
      : 0;

  const nonCancelledOrders =
    totalOrders -
    cancelledOrders;

  const deliveryRate =
    nonCancelledOrders > 0
      ? Math.round(
          (deliveredOrders /
            nonCancelledOrders) *
            100
        )
      : 0;

  // =====================================
  // HELPERS
  // =====================================

  const formatPrice = (
    price
  ) =>
    Number(
      price || 0
    ).toLocaleString(
      "en-IN",
      {
        maximumFractionDigits: 0,
      }
    );

  const formatDate = (
    date
  ) => {
    if (!date) {
      return "—";
    }

    return new Date(
      date
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const getStatusPercentage = (
    count
  ) => {
    if (
      totalOrders === 0
    ) {
      return 0;
    }

    return Math.round(
      (count /
        totalOrders) *
        100
    );
  };

  const getStockStatus = (
    stock
  ) => {
    const quantity =
      Number(stock || 0);

    if (quantity === 0) {
      return {
        text: "Out of Stock",
        icon: "🚫",
        className:
          "out-of-stock",
      };
    }

    if (quantity <= 5) {
      return {
        text: "Low Stock",
        icon: "⚠️",
        className:
          "low-stock",
      };
    }

    return {
      text: "In Stock",
      icon: "🟢",
      className:
        "in-stock",
    };
  };

  const statusData = [
    {
      name: "Placed",
      icon: "📝",
      count:
        placedOrders,
      className:
        "placed",
    },
    {
      name: "Confirmed",
      icon: "👍",
      count:
        confirmedOrders,
      className:
        "confirmed",
    },
    {
      name: "Shipped",
      icon: "🚚",
      count:
        shippedOrders,
      className:
        "shipped",
    },
    {
      name: "Delivered",
      icon: "✅",
      count:
        deliveredOrders,
      className:
        "delivered",
    },
    {
      name: "Cancelled",
      icon: "❌",
      count:
        cancelledOrders,
      className:
        "cancelled",
    },
  ];

  // =====================================
  // UI
  // =====================================

  return (
    <div
      className="admin-dashboard-overlay"
      onClick={onClose}
    >
      <div
        className="admin-dashboard-modal"
        onClick={(e) =>
          e.stopPropagation()
        }
      >
        {/* =====================================
            HEADER
        ===================================== */}

        <div className="admin-dashboard-header">
          <div>
            <h2>
              ⚙️ Admin Dashboard
            </h2>

            <p>
              ShopMind AI store
              overview
            </p>
          </div>

          <button
            type="button"
            className="admin-dashboard-close"
            onClick={
              onClose
            }
          >
            ✕
          </button>
        </div>

        {/* =====================================
            LOADING / ERROR
        ===================================== */}

        {loading ? (
          <div className="admin-dashboard-loading">
            <div>
              📊
            </div>

            <h3>
              Loading dashboard...
            </h3>

            <p>
              Getting your store data.
            </p>
          </div>
        ) : error ? (
          <div className="admin-dashboard-error">
            ⚠️ {error}
          </div>
        ) : (
          <>
            {/* =====================================
                MAIN STATISTICS
            ===================================== */}

            <div className="admin-stat-grid">

              {/* TOTAL PRODUCTS */}

              <div className="admin-stat-card">
                <div className="admin-stat-icon">
                  📦
                </div>

                <div>
                  <span>
                    Total Products
                  </span>

                  <strong>
                    {
                      totalProducts
                    }
                  </strong>
                </div>
              </div>

              {/* TOTAL INVENTORY */}

              <div className="admin-stat-card">
                <div className="admin-stat-icon">
                  📚
                </div>

                <div>
                  <span>
                    Total Inventory
                  </span>

                  <strong>
                    {
                      totalInventory
                    }
                  </strong>
                </div>
              </div>

              {/* LOW STOCK */}

              <div className="admin-stat-card">
                <div className="admin-stat-icon">
                  ⚠️
                </div>

                <div>
                  <span>
                    Low Stock
                  </span>

                  <strong>
                    {
                      lowStockProducts
                    }
                  </strong>
                </div>
              </div>

              {/* OUT OF STOCK */}

              <div className="admin-stat-card">
                <div className="admin-stat-icon">
                  🚫
                </div>

                <div>
                  <span>
                    Out of Stock
                  </span>

                  <strong>
                    {
                      outOfStockProducts
                    }
                  </strong>
                </div>
              </div>

              {/* INVENTORY VALUE */}

              <div className="admin-stat-card">
                <div className="admin-stat-icon">
                  💵
                </div>

                <div>
                  <span>
                    Inventory Value
                  </span>

                  <strong>
                    ₹
                    {formatPrice(
                      inventoryValue
                    )}
                  </strong>
                </div>
              </div>

              {/* TOTAL ORDERS */}

              <div className="admin-stat-card">
                <div className="admin-stat-icon">
                  🛒
                </div>

                <div>
                  <span>
                    Total Orders
                  </span>

                  <strong>
                    {
                      totalOrders
                    }
                  </strong>
                </div>
              </div>

              {/* CUSTOMERS */}

              <div className="admin-stat-card">
                <div className="admin-stat-icon">
                  👥
                </div>

                <div>
                  <span>
                    Customers
                  </span>

                  <strong>
                    {
                      totalCustomers
                    }
                  </strong>
                </div>
              </div>

              {/* ACTIVE ORDERS */}

              <div className="admin-stat-card">
                <div className="admin-stat-icon">
                  🚚
                </div>

                <div>
                  <span>
                    Active Orders
                  </span>

                  <strong>
                    {
                      activeOrders
                    }
                  </strong>
                </div>
              </div>

              {/* DELIVERED */}

              <div className="admin-stat-card">
                <div className="admin-stat-icon">
                  ✅
                </div>

                <div>
                  <span>
                    Delivered
                  </span>

                  <strong>
                    {
                      deliveredOrders
                    }
                  </strong>
                </div>
              </div>

              {/* CANCELLED */}

              <div className="admin-stat-card">
                <div className="admin-stat-icon">
                  ❌
                </div>

                <div>
                  <span>
                    Cancelled
                  </span>

                  <strong>
                    {
                      cancelledOrders
                    }
                  </strong>
                </div>
              </div>

              {/* REVENUE */}

              <div className="admin-stat-card admin-revenue-card">
                <div className="admin-stat-icon">
                  💰
                </div>

                <div>
                  <span>
                    Delivered Revenue
                  </span>

                  <strong>
                    ₹
                    {formatPrice(
                      totalRevenue
                    )}
                  </strong>
                </div>
              </div>
            </div>

            {/* =====================================
                INVENTORY OVERVIEW
            ===================================== */}

            <div className="dashboard-customers">

              <div className="dashboard-section-title">

                <div>
                  <h3>
                    📦 Inventory
                    Overview
                  </h3>

                  <p>
                    Current stock levels
                    for ShopMind AI
                    products
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    onOpenProducts
                  }
                >
                  Manage Products →
                </button>
              </div>

              {products.length ===
              0 ? (
                <div className="dashboard-empty">
                  No products found.
                </div>
              ) : (
                <div className="dashboard-users-list">

                  {products.map(
                    (product) => {
                      const stock =
                        Number(
                          product.stock ||
                            0
                        );

                      const stockStatus =
                        getStockStatus(
                          stock
                        );

                      return (
                        <div
                          className="dashboard-user-row"
                          key={
                            product._id
                          }
                        >

                          <div className="dashboard-user-main">

                            <div className="dashboard-user-avatar">
                              {product.icon ||
                                "📦"}
                            </div>

                            <div>
                              <strong>
                                {
                                  product.name
                                }
                              </strong>

                              <small>
                                {product.category ||
                                  "Product"}
                              </small>
                            </div>

                          </div>

                          <div className="dashboard-user-joined">

                            <span>
                              STOCK
                            </span>

                            <strong>
                              {stock}{" "}
                              units
                            </strong>

                          </div>

                          <div className="dashboard-user-joined">

                            <span>
                              PRICE
                            </span>

                            <strong>
                              ₹
                              {formatPrice(
                                product.price
                              )}
                            </strong>

                          </div>

                          <div
                            className={`dashboard-role-badge ${stockStatus.className}`}
                          >
                            {
                              stockStatus.icon
                            }{" "}
                            {
                              stockStatus.text
                            }
                          </div>

                        </div>
                      );
                    }
                  )}

                </div>
              )}

            </div>

            {/* =====================================
                SALES ANALYTICS
            ===================================== */}

            <div className="dashboard-analytics">

              <div className="dashboard-section-heading">

                <div>
                  <h3>
                    📈 Sales Analytics
                  </h3>

                  <p>
                    Performance based
                    on ShopMind AI
                    orders.
                  </p>
                </div>

              </div>

              <div className="dashboard-analytics-summary">

                <div className="dashboard-analytics-card">

                  <div className="dashboard-analytics-icon">
                    💰
                  </div>

                  <span>
                    Delivered Revenue
                  </span>

                  <strong>
                    ₹
                    {formatPrice(
                      totalRevenue
                    )}
                  </strong>

                  <small>
                    Revenue from
                    delivered orders
                  </small>

                </div>

                <div className="dashboard-analytics-card">

                  <div className="dashboard-analytics-icon">
                    🧾
                  </div>

                  <span>
                    Average Order Value
                  </span>

                  <strong>
                    ₹
                    {formatPrice(
                      averageOrderValue
                    )}
                  </strong>

                  <small>
                    Average delivered
                    order
                  </small>

                </div>

                <div className="dashboard-analytics-card">

                  <div className="dashboard-analytics-icon">
                    📦
                  </div>

                  <span>
                    Delivery Rate
                  </span>

                  <strong>
                    {
                      deliveryRate
                    }
                    %
                  </strong>

                  <small>
                    Delivered vs
                    non-cancelled
                    orders
                  </small>

                </div>

                <div className="dashboard-analytics-card">

                  <div className="dashboard-analytics-icon">
                    💵
                  </div>

                  <span>
                    Inventory Value
                  </span>

                  <strong>
                    ₹
                    {formatPrice(
                      inventoryValue
                    )}
                  </strong>

                  <small>
                    Current value of
                    available stock
                  </small>

                </div>

              </div>

              {/* ORDER STATUS */}

              <div className="dashboard-status-analysis">

                <div className="dashboard-status-header">

                  <div>
                    <h4>
                      Order Status
                    </h4>

                    <p>
                      Current order
                      distribution
                    </p>
                  </div>

                  <div className="dashboard-total-orders">

                    <span>
                      Total
                    </span>

                    <strong>
                      {
                        totalOrders
                      }
                    </strong>

                  </div>

                </div>

                <div className="dashboard-status-list">

                  {statusData.map(
                    (status) => {
                      const percentage =
                        getStatusPercentage(
                          status.count
                        );

                      return (
                        <div
                          className="dashboard-status-item"
                          key={
                            status.name
                          }
                        >

                          <div className="dashboard-status-info">

                            <div>

                              <span className="dashboard-status-emoji">
                                {
                                  status.icon
                                }
                              </span>

                              <strong>
                                {
                                  status.name
                                }
                              </strong>

                            </div>

                            <div>

                              <strong>
                                {
                                  status.count
                                }
                              </strong>

                              <span>
                                {
                                  percentage
                                }
                                %
                              </span>

                            </div>

                          </div>

                          <div className="dashboard-progress-track">

                            <div
                              className={`dashboard-progress-bar dashboard-progress-${status.className}`}
                              style={{
                                width: `${percentage}%`,
                              }}
                            />

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>

              </div>

            </div>

            {/* =====================================
                STORE MANAGEMENT
            ===================================== */}

            <div className="admin-management">

              <h3>
                Store Management
              </h3>

              <div className="admin-management-grid">

                <button
                  type="button"
                  className="admin-management-card"
                  onClick={
                    onOpenProducts
                  }
                >

                  <span className="admin-management-icon">
                    📦
                  </span>

                  <strong>
                    Manage Products
                  </strong>

                  <small>
                    Add, edit,
                    delete and manage
                    stock
                  </small>

                  <span>
                    Open Products →
                  </span>

                </button>

                <button
                  type="button"
                  className="admin-management-card"
                  onClick={
                    onOpenOrders
                  }
                >

                  <span className="admin-management-icon">
                    🛒
                  </span>

                  <strong>
                    Manage Orders
                  </strong>

                  <small>
                    View and update
                    customer orders
                  </small>

                  <span>
                    Open Orders →
                  </span>

                </button>

              </div>

            </div>

            {/* =====================================
                CUSTOMER MANAGEMENT
            ===================================== */}

            <div className="dashboard-customers">

              <div className="dashboard-section-title">

                <div>

                  <h3>
                    👥 Customer
                    Management
                  </h3>

                  <p>
                    Registered
                    ShopMind AI
                    accounts
                  </p>

                </div>

                <div className="dashboard-customer-summary">

                  <span>
                    Customers{" "}
                    <strong>
                      {
                        totalCustomers
                      }
                    </strong>
                  </span>

                  <span>
                    Admins{" "}
                    <strong>
                      {
                        totalAdmins
                      }
                    </strong>
                  </span>

                  <span>
                    Total{" "}
                    <strong>
                      {
                        totalUsers
                      }
                    </strong>
                  </span>

                </div>

              </div>

              {users.length ===
              0 ? (
                <div className="dashboard-empty">
                  No registered users
                  found.
                </div>
              ) : (
                <div className="dashboard-users-list">

                  {users.map(
                    (account) => (
                      <div
                        className="dashboard-user-row"
                        key={
                          account._id
                        }
                      >

                        <div className="dashboard-user-main">

                          <div className="dashboard-user-avatar">
                            {account.role ===
                            "admin"
                              ? "🛡️"
                              : "👤"}
                          </div>

                          <div>

                            <strong>
                              {account.name ||
                                "User"}
                            </strong>

                            <small>
                              {account.email ||
                                "No email"}
                            </small>

                          </div>

                        </div>

                        <div className="dashboard-user-joined">

                          <span>
                            JOINED
                          </span>

                          <strong>
                            {formatDate(
                              account.createdAt
                            )}
                          </strong>

                        </div>

                        <div
                          className={
                            account.role ===
                            "admin"
                              ? "dashboard-role-badge dashboard-role-admin"
                              : "dashboard-role-badge dashboard-role-user"
                          }
                        >
                          {account.role ===
                          "admin"
                            ? "Admin"
                            : "Customer"}
                        </div>

                      </div>
                    )
                  )}

                </div>
              )}

            </div>

            {/* =====================================
                RECENT ORDERS
            ===================================== */}

            <div className="dashboard-recent-orders">

              <div className="dashboard-section-title">

                <div>

                  <h3>
                    🧾 Recent Orders
                  </h3>

                  <p>
                    Latest customer
                    orders
                  </p>

                </div>

                <button
                  type="button"
                  onClick={
                    onOpenOrders
                  }
                >
                  View All Orders →
                </button>

              </div>

              {orders.length ===
              0 ? (
                <div className="dashboard-empty">
                  No orders found.
                </div>
              ) : (
                <div className="dashboard-orders-list">

                  {orders
                    .slice(0, 5)
                    .map(
                      (order) => (
                        <div
                          className="dashboard-order-row"
                          key={
                            order._id
                          }
                        >

                          {/* CUSTOMER */}

                          <div className="dashboard-order-customer">

                            <div className="dashboard-customer-icon">
                              👤
                            </div>

                            <div>

                              <strong>
                                {order.user
                                  ?.name ||
                                  order
                                    .shippingAddress
                                    ?.fullName ||
                                  "Customer"}
                              </strong>

                              <small>
                                {order.user
                                  ?.email ||
                                  order
                                    .shippingAddress
                                    ?.phone ||
                                  "ShopMind customer"}
                              </small>

                            </div>

                          </div>

                          {/* ORDER ID */}

                          <div className="dashboard-order-id">

                            <span>
                              ORDER ID
                            </span>

                            <strong>
                              #
                              {order._id
                                ?.slice(
                                  -8
                                )
                                .toUpperCase()}
                            </strong>

                          </div>

                          {/* TOTAL */}

                          <div className="dashboard-order-amount">

                            <span>
                              TOTAL
                            </span>

                            <strong>
                              ₹
                              {formatPrice(
                                order.totalAmount
                              )}
                            </strong>

                          </div>

                          {/* DATE */}

                          <div className="dashboard-order-date">

                            <span>
                              DATE
                            </span>

                            <strong>
                              {formatDate(
                                order.createdAt
                              )}
                            </strong>

                          </div>

                          {/* STATUS */}

                          <div
                            className={`dashboard-status dashboard-status-${(
                              order.status ||
                              "placed"
                            )
                              .toLowerCase()
                              .replace(
                                /\s+/g,
                                "-"
                              )}`}
                          >
                            {order.status ||
                              "Placed"}
                          </div>

                        </div>
                      )
                    )}

                </div>
              )}

            </div>

          </>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;