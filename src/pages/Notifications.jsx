import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import notificationService from "../services/notificationService";

import "./Notifications.css";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  const normalizeNotifications = (response) => {
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response?.data)) {
      return response.data;
    }

    if (Array.isArray(response?.data?.data)) {
      return response.data.data;
    }

    if (Array.isArray(response?.notifications)) {
      return response.notifications;
    }

    if (
      Array.isArray(response?.data?.notifications)
    ) {
      return response.data.notifications;
    }

    return [];
  };

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response =
        await notificationService.getNotifications();

      setNotifications(
        normalizeNotifications(response)
      );
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Unable to load notifications."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const isRead = (notification) =>
    notification?.isRead === true ||
    notification?.read === true;

  const filteredNotifications = useMemo(() => {
    if (filter === "unread") {
      return notifications.filter(
        (notification) => !isRead(notification)
      );
    }

    if (filter === "read") {
      return notifications.filter(isRead);
    }

    return notifications;
  }, [notifications, filter]);

  const unreadCount = notifications.filter(
    (notification) => !isRead(notification)
  ).length;

  const readCount =
    notifications.length - unreadCount;

  const getTitle = (notification) =>
    notification?.title ||
    notification?.subject ||
    "Notification";

  const getMessage = (notification) =>
    notification?.message ||
    notification?.description ||
    "You have a new notification.";

  const getType = (notification) =>
    String(
      notification?.type ||
        notification?.category ||
        "general"
    ).toLowerCase();

  const getTime = (notification) => {
    const date =
      notification?.createdAt ||
      notification?.date ||
      notification?.timestamp;

    if (!date) {
      return "";
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "";
    }

    return parsed.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getIcon = (type) => {
    if (
      type.includes("booking") ||
      type.includes("order")
    ) {
      return "📅";
    }

    if (
      type.includes("food") ||
      type.includes("menu")
    ) {
      return "🍛";
    }

    if (
      type.includes("customer") ||
      type.includes("user")
    ) {
      return "👤";
    }

    if (
      type.includes("alert") ||
      type.includes("warning")
    ) {
      return "⚠️";
    }

    if (
      type.includes("success") ||
      type.includes("complete")
    ) {
      return "✓";
    }

    return "🔔";
  };

  const getId = (notification, index) =>
    notification?._id ||
    notification?.id ||
    `notification-${index}`;

  const handleMarkRead = async (notification) => {
    const id =
      notification?._id ||
      notification?.id;

    if (!id || isRead(notification)) {
      return;
    }

    setError("");
    setActionLoading(String(id));

    try {
      await notificationService.markAsRead(id);

      setNotifications((current) =>
        current.map((item) => {
          const itemId =
            item?._id ||
            item?.id;

          return String(itemId) === String(id)
            ? {
                ...item,
                isRead: true,
                read: true,
              }
            : item;
        })
      );
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Unable to mark notification as read."
      );
    } finally {
      setActionLoading("");
    }
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) {
      return;
    }

    setError("");
    setActionLoading("all");

    try {
      await notificationService.markAllAsRead();

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          isRead: true,
          read: true,
        }))
      );
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Unable to mark all notifications as read."
      );
    } finally {
      setActionLoading("");
    }
  };

  const handleDelete = async (notification) => {
    const id =
      notification?._id ||
      notification?.id;

    if (!id) {
      return;
    }

    setError("");
    setActionLoading(String(id));

    try {
      await notificationService.deleteNotification(id);

      setNotifications((current) =>
        current.filter(
          (item) =>
            String(item?._id || item?.id) !==
            String(id)
        )
      );
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Unable to delete notification."
      );
    } finally {
      setActionLoading("");
    }
  };

  const handleClearAll = async () => {
    if (notifications.length === 0) {
      return;
    }

    const confirmed = window.confirm(
      "Clear all notifications?\n\nThis will permanently delete all notifications."
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setActionLoading("clear");

    try {
      await notificationService.deleteAllNotifications();

      setNotifications([]);
      setFilter("all");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Unable to clear notifications."
      );
    } finally {
      setActionLoading("");
    }
  };

  return (
    <div className="notifications-page">
      <div className="notifications-container">
        <div className="notifications-header">
          <div>
            <span className="notifications-eyebrow">
              NIVETHA CATERING SERVICE
            </span>

            <h1>Notifications</h1>

            <p>
              Stay updated with bookings, customers
              and menu activity.
            </p>
          </div>

          <div className="notifications-header-actions">
            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={
                unreadCount === 0 ||
                actionLoading === "all"
              }
              className="notifications-mark-all"
            >
              {actionLoading === "all"
                ? "Updating..."
                : "Mark All Read"}
            </button>

            <button
              type="button"
              onClick={handleClearAll}
              disabled={
                notifications.length === 0 ||
                actionLoading === "clear"
              }
              className="notifications-clear"
            >
              {actionLoading === "clear"
                ? "Clearing..."
                : "Clear All"}
            </button>
          </div>
        </div>

        <div className="notifications-summary">
          <div className="notifications-summary-card">
            <div className="notifications-summary-icon">
              🔔
            </div>

            <div>
              <small>Total</small>
              <strong>{notifications.length}</strong>
            </div>
          </div>

          <div className="notifications-summary-card unread">
            <div className="notifications-summary-icon">
              •
            </div>

            <div>
              <small>Unread</small>
              <strong>{unreadCount}</strong>
            </div>
          </div>

          <div className="notifications-summary-card">
            <div className="notifications-summary-icon">
              ✓
            </div>

            <div>
              <small>Read</small>
              <strong>{readCount}</strong>
            </div>
          </div>
        </div>

        <div className="notifications-toolbar">
          <div className="notifications-tabs">
            <button
              type="button"
              className={
                filter === "all" ? "active" : ""
              }
              onClick={() => setFilter("all")}
            >
              All
            </button>

            <button
              type="button"
              className={
                filter === "unread" ? "active" : ""
              }
              onClick={() => setFilter("unread")}
            >
              Unread

              {unreadCount > 0 && (
                <span>{unreadCount}</span>
              )}
            </button>

            <button
              type="button"
              className={
                filter === "read" ? "active" : ""
              }
              onClick={() => setFilter("read")}
            >
              Read
            </button>
          </div>
        </div>

        {error && (
          <div className="notifications-error">
            <span>{error}</span>

            <button
              type="button"
              onClick={loadNotifications}
            >
              Try Again
            </button>
          </div>
        )}

        {loading ? (
          <div className="notifications-loading">
            <div className="notifications-spinner" />
            <p>Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="notifications-empty">
            <div className="notifications-empty-icon">
              🔔
            </div>

            <h2>
              {notifications.length === 0
                ? "No notifications"
                : "Nothing here"}
            </h2>

            <p>
              {notifications.length === 0
                ? "New activity and updates will appear here."
                : "There are no notifications in this filter."}
            </p>
          </div>
        ) : (
          <div className="notifications-list">
            {filteredNotifications.map(
              (notification, index) => {
                const id = getId(
                  notification,
                  index
                );

                const read =
                  isRead(notification);

                const type =
                  getType(notification);

                const itemLoading =
                  actionLoading === String(id);

                return (
                  <article
                    className={`notification-item ${
                      read ? "read" : "unread"
                    }`}
                    key={id}
                  >
                    <div
                      className={`notification-icon ${type}`}
                    >
                      {getIcon(type)}
                    </div>

                    <div className="notification-content">
                      <div className="notification-top">
                        <h2>
                          {getTitle(notification)}
                        </h2>

                        {!read && (
                          <span className="notification-new">
                            NEW
                          </span>
                        )}
                      </div>

                      <p>
                        {getMessage(notification)}
                      </p>

                      <small>
                        {getTime(notification)}
                      </small>
                    </div>

                    <div className="notification-actions">
                      {!read && (
                        <button
                          type="button"
                          disabled={itemLoading}
                          onClick={() =>
                            handleMarkRead(
                              notification
                            )
                          }
                        >
                          {itemLoading
                            ? "Updating..."
                            : "✓ Read"}
                        </button>
                      )}

                      <button
                        type="button"
                        className="notification-delete"
                        disabled={itemLoading}
                        onClick={() =>
                          handleDelete(
                            notification
                          )
                        }
                      >
                        {itemLoading
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>
                  </article>
                );
              }
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;