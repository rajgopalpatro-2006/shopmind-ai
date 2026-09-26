import { useEffect, useState } from "react";

import API_URL from "./api";

function NotificationModal({
  onClose,
  onUnreadCountChange,
}) {
  // =====================================================
  // STATE
  // =====================================================

  const [
    notifications,
    setNotifications,
  ] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [
    actionLoading,
    setActionLoading,
  ] = useState(false);

  // =====================================================
  // GET TOKEN
  // =====================================================

  const getToken = () => {
    return localStorage.getItem(
      "shopmindToken"
    );
  };

  // =====================================================
  // UPDATE UNREAD COUNT IN APP.JSX
  // =====================================================

  const updateUnreadCount = (
    notificationList
  ) => {
    const unreadCount =
      notificationList.filter(
        (notification) =>
          !notification.isRead
      ).length;

    if (
      typeof onUnreadCountChange ===
      "function"
    ) {
      onUnreadCountChange(
        unreadCount
      );
    }
  };

  // =====================================================
  // LOAD NOTIFICATIONS
  // =====================================================

  const loadNotifications =
    async () => {
      try {
        setLoading(true);
        setError("");

        const token =
          getToken();

        if (!token) {
          throw new Error(
            "Please login to view notifications."
          );
        }

        const response =
          await fetch(
            `${API_URL}/api/notifications`,
            {
              headers: {
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
            "Invalid response from server."
          );
        }

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Could not load notifications."
          );
        }

        const list =
          data.notifications ||
          [];

        setNotifications(
          list
        );

        updateUnreadCount(
          list
        );
      } catch (err) {
        console.error(
          "Load notifications error:",
          err
        );

        setError(
          err.message ||
            "Could not load notifications."
        );
      } finally {
        setLoading(false);
      }
    };

  // =====================================================
  // LOAD WHEN MODAL OPENS
  // =====================================================

  useEffect(() => {
    loadNotifications();
  }, []);

  // =====================================================
  // MARK ONE AS READ
  // =====================================================

  const markAsRead = async (
    notificationId
  ) => {
    try {
      setError("");

      const token =
        getToken();

      if (!token) {
        throw new Error(
          "Please login again."
        );
      }

      const response =
        await fetch(
          `${API_URL}/api/notifications/${notificationId}/read`,
          {
            method: "PUT",

            headers: {
              Authorization:
                `Bearer ${token}`,

              "Content-Type":
                "application/json",
            },
          }
        );

      let data;

      try {
        data =
          await response.json();
      } catch {
        throw new Error(
          "Invalid response from server."
        );
      }

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Could not mark notification as read."
        );
      }

      const updatedList =
        notifications.map(
          (notification) =>
            notification._id ===
            notificationId
              ? {
                  ...notification,
                  isRead: true,
                }
              : notification
        );

      setNotifications(
        updatedList
      );

      updateUnreadCount(
        updatedList
      );
    } catch (err) {
      console.error(
        "Mark notification read error:",
        err
      );

      setError(
        err.message ||
          "Could not update notification."
      );
    }
  };

  // =====================================================
  // MARK ALL AS READ
  // =====================================================

  const markAllAsRead =
    async () => {
      try {
        setActionLoading(
          true
        );

        setError("");

        const token =
          getToken();

        if (!token) {
          throw new Error(
            "Please login again."
          );
        }

        const response =
          await fetch(
            `${API_URL}/api/notifications/read-all`,
            {
              method: "PUT",

              headers: {
                Authorization:
                  `Bearer ${token}`,

                "Content-Type":
                  "application/json",
              },
            }
          );

        let data;

        try {
          data =
            await response.json();
        } catch {
          throw new Error(
            "Invalid response from server."
          );
        }

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Could not mark all notifications as read."
          );
        }

        const updatedList =
          notifications.map(
            (notification) => ({
              ...notification,
              isRead: true,
            })
          );

        setNotifications(
          updatedList
        );

        updateUnreadCount(
          updatedList
        );
      } catch (err) {
        console.error(
          "Mark all read error:",
          err
        );

        setError(
          err.message ||
            "Could not update notifications."
        );
      } finally {
        setActionLoading(
          false
        );
      }
    };

  // =====================================================
  // DELETE ONE NOTIFICATION
  // =====================================================

  const deleteNotification =
    async (
      notificationId
    ) => {
      try {
        setError("");

        const token =
          getToken();

        if (!token) {
          throw new Error(
            "Please login again."
          );
        }

        const response =
          await fetch(
            `${API_URL}/api/notifications/${notificationId}`,
            {
              method:
                "DELETE",

              headers: {
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
            "Invalid response from server."
          );
        }

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Could not delete notification."
          );
        }

        const updatedList =
          notifications.filter(
            (notification) =>
              notification._id !==
              notificationId
          );

        setNotifications(
          updatedList
        );

        updateUnreadCount(
          updatedList
        );
      } catch (err) {
        console.error(
          "Delete notification error:",
          err
        );

        setError(
          err.message ||
            "Could not delete notification."
        );
      }
    };

  // =====================================================
  // CLEAR ALL NOTIFICATIONS
  // =====================================================

  const clearAllNotifications =
    async () => {
      if (
        notifications.length ===
        0
      ) {
        return;
      }

      const confirmed =
        window.confirm(
          "Delete all notifications?"
        );

      if (!confirmed) {
        return;
      }

      try {
        setActionLoading(
          true
        );

        setError("");

        const token =
          getToken();

        if (!token) {
          throw new Error(
            "Please login again."
          );
        }

        const response =
          await fetch(
            `${API_URL}/api/notifications`,
            {
              method:
                "DELETE",

              headers: {
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
            "Invalid response from server."
          );
        }

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Could not clear notifications."
          );
        }

        setNotifications(
          []
        );

        updateUnreadCount(
          []
        );
      } catch (err) {
        console.error(
          "Clear notifications error:",
          err
        );

        setError(
          err.message ||
            "Could not clear notifications."
        );
      } finally {
        setActionLoading(
          false
        );
      }
    };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (
    date
  ) => {
    if (!date) {
      return "";
    }

    try {
      return new Date(
        date
      ).toLocaleString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute:
            "2-digit",
        }
      );
    } catch {
      return "";
    }
  };

  // =====================================================
  // GET NOTIFICATION ICON
  // =====================================================

  const getNotificationIcon =
    (notification) => {
      const type =
        notification?.type
          ?.toLowerCase();

      if (
        type === "order"
      ) {
        return "📦";
      }

      if (
        type === "success"
      ) {
        return "✅";
      }

      if (
        type === "warning"
      ) {
        return "⚠️";
      }

      if (
        type === "wishlist"
      ) {
        return "❤️";
      }

      if (
        type === "product"
      ) {
        return "🛍️";
      }

      return "🔔";
    };

  // =====================================================
  // CHECK IF THERE ARE UNREAD NOTIFICATIONS
  // =====================================================

  const hasUnread =
    notifications.some(
      (notification) =>
        !notification.isRead
    );

  // =====================================================
  // UI
  // =====================================================

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
    >
      <div
        className="notification-modal"
        onClick={(e) =>
          e.stopPropagation()
        }
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="notification-header">
          <div>
            <h2>
              🔔 Notifications
            </h2>

            <p>
              Stay updated with
              your ShopMind AI
              activity.
            </p>
          </div>

          <button
            type="button"
            className="close-btn"
            onClick={
              onClose
            }
          >
            ✕
          </button>
        </div>

        {/* =================================================
            ACTION BUTTONS
        ================================================= */}

        {!loading &&
          notifications.length >
            0 && (
            <div className="notification-actions">
              <button
                type="button"
                onClick={
                  markAllAsRead
                }
                disabled={
                  actionLoading ||
                  !hasUnread
                }
              >
                ✓ Mark All Read
              </button>

              <button
                type="button"
                onClick={
                  clearAllNotifications
                }
                disabled={
                  actionLoading
                }
              >
                🗑️ Clear All
              </button>
            </div>
          )}

        {/* =================================================
            ERROR
        ================================================= */}

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

              fontWeight:
                "600",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* =================================================
            LOADING
        ================================================= */}

        {loading ? (
          <div className="notification-loading">
            <div
              style={{
                fontSize:
                  "45px",
              }}
            >
              🔔
            </div>

            <h3>
              Loading notifications...
            </h3>

            <p>
              Please wait while
              we get your latest
              updates.
            </p>
          </div>
        ) : notifications.length ===
          0 ? (
          /* =================================================
              EMPTY
          ================================================= */

          <div className="notification-empty">
            <div
              style={{
                fontSize:
                  "60px",

                marginBottom:
                  "10px",
              }}
            >
              🔕
            </div>

            <h3>
              No Notifications
            </h3>

            <p>
              You don't have any
              notifications yet.
            </p>

            <button
              type="button"
              onClick={
                onClose
              }
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          /* =================================================
              NOTIFICATION LIST
          ================================================= */

          <div className="notification-list">
            {notifications.map(
              (
                notification
              ) => (
                <div
                  key={
                    notification._id
                  }
                  className={`notification-item ${
                    notification.isRead
                      ? "notification-read"
                      : "notification-unread"
                  }`}
                  onClick={() => {
                    if (
                      !notification.isRead
                    ) {
                      markAsRead(
                        notification._id
                      );
                    }
                  }}
                >
                  {/* ICON */}

                  <div className="notification-icon">
                    {getNotificationIcon(
                      notification
                    )}
                  </div>

                  {/* CONTENT */}

                  <div className="notification-content">
                    <div className="notification-title-row">
                      <h3>
                        {notification.title ||
                          "ShopMind AI"}
                      </h3>

                      {!notification.isRead && (
                        <span className="notification-unread-dot" />
                      )}
                    </div>

                    <p>
                      {notification.message ||
                        "You have a new notification."}
                    </p>

                    <span className="notification-date">
                      {formatDate(
                        notification.createdAt
                      )}
                    </span>
                  </div>

                  {/* DELETE */}

                  <button
                    type="button"
                    className="notification-delete-btn"
                    title="Delete notification"
                    onClick={(
                      e
                    ) => {
                      e.stopPropagation();

                      deleteNotification(
                        notification._id
                      );
                    }}
                  >
                    🗑️
                  </button>
                </div>
              )
            )}
          </div>
        )}

        {/* =================================================
            FOOTER
        ================================================= */}

        {!loading &&
          notifications.length >
            0 && (
            <div
              style={{
                marginTop:
                  "15px",

                paddingTop:
                  "15px",

                borderTop:
                  "1px solid #e2e8f0",

                textAlign:
                  "center",

                color:
                  "#64748b",

                fontSize:
                  "13px",
              }}
            >
              {
                notifications.filter(
                  (
                    notification
                  ) =>
                    !notification.isRead
                ).length
              }{" "}
              unread notification
              {notifications.filter(
                (
                  notification
                ) =>
                  !notification.isRead
              ).length === 1
                ? ""
                : "s"}
            </div>
          )}
      </div>
    </div>
  );
}

export default NotificationModal;