import React from "react";
import { useNavigate } from "react-router-dom";
import "./NotificationPanel.css";

const NotificationPanel = ({
  notifications = [],
  loading = false,
  onMarkRead,
  onMarkAllRead,
  onDelete,
}) => {
  const navigate = useNavigate();

  const safeNotifications = Array.isArray(notifications)
    ? notifications
    : [];

  const unreadCount = safeNotifications.filter(
    (notification) => !notification?.isRead
  ).length;

  const formatDate = (dateValue) => {
    if (!dateValue) return "";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateValue) => {
    if (!dateValue) return "";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getNotificationIcon = (type) => {
    switch (String(type || "").toLowerCase()) {
      case "booking":
        return "📋";

      case "confirmed":
        return "✅";

      case "rejected":
        return "❌";

      case "food":
        return "🍛";

      case "customer":
        return "👤";

      case "warning":
        return "⚠️";

      case "success":
        return "🎉";

      default:
        return "🔔";
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification) return;

    if (!notification.isRead && onMarkRead) {
      onMarkRead(notification);
    }

    const bookingId =
      notification.bookingId?._id ||
      notification.bookingId ||
      notification.booking?._id;

    if (bookingId) {
      navigate(`/booking/${bookingId}`);
    }
  };

  return (
    <section className="anna-notification-panel">
      <div className="anna-notification-header">
        <div>
          <h2>Notifications</h2>

          <p>
            {unreadCount > 0
              ? `${unreadCount} unread notification${
                  unreadCount > 1 ? "s" : ""
                }`
              : "You're all caught up"}
          </p>
        </div>

        {unreadCount > 0 && onMarkAllRead && (
          <button
            type="button"
            className="anna-notification-mark-all"
            onClick={onMarkAllRead}
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="anna-notification-list">
        {loading ? (
          <div className="anna-notification-loading">
            <span className="anna-notification-spinner" />
            <p>Loading notifications...</p>
          </div>
        ) : safeNotifications.length === 0 ? (
          <div className="anna-notification-empty">
            <div className="anna-notification-empty-icon">
              🔔
            </div>

            <h3>No notifications</h3>

            <p>
              New booking and catering updates will appear here.
            </p>
          </div>
        ) : (
          safeNotifications.map((notification, index) => {
            const notificationId =
              notification?._id ||
              notification?.id ||
              `notification-${index}`;

            return (
              <article
                key={notificationId}
                className={`anna-notification-item ${
                  !notification?.isRead ? "unread" : ""
                }`}
                onClick={() =>
                  handleNotificationClick(notification)
                }
              >
                <div className="anna-notification-icon">
                  {getNotificationIcon(notification?.type)}
                </div>

                <div className="anna-notification-content">
                  <div className="anna-notification-title-row">
                    <h3>
                      {notification?.title || "Notification"}
                    </h3>

                    {!notification?.isRead && (
                      <span className="anna-notification-unread-dot" />
                    )}
                  </div>

                  <p>
                    {notification?.message ||
                      "You have a new update."}
                  </p>

                  <div className="anna-notification-meta">
                    {notification?.createdAt && (
                      <>
                        <span>
                          {formatDate(notification.createdAt)}
                        </span>

                        <span>•</span>

                        <span>
                          {formatTime(notification.createdAt)}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="anna-notification-actions">
                  {!notification?.isRead && onMarkRead && (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onMarkRead(notification);
                      }}
                    >
                      Read
                    </button>
                  )}

                  {onDelete && (
                    <button
                      type="button"
                      className="delete"
                      onClick={(event) => {
                        event.stopPropagation();
                        onDelete(notification);
                      }}
                      aria-label="Delete notification"
                      title="Delete"
                    >
                      ×
                    </button>
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
};

export default NotificationPanel;