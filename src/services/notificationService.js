import axios from "axios";

/* =====================================================
   API CONFIGURATION
===================================================== */

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5001/api";

const TOKEN_KEY = "nivetha_anna_token";

/* =====================================================
   AXIOS INSTANCE
===================================================== */

const notificationAPI = axios.create({
  baseURL: `${API_BASE_URL}/notifications`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

/* =====================================================
   REQUEST INTERCEPTOR
===================================================== */

notificationAPI.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem(TOKEN_KEY);

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },
  (error) =>
    Promise.reject(error)
);

/* =====================================================
   RESPONSE INTERCEPTOR
===================================================== */

notificationAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error?.response?.status === 401
    ) {
      localStorage.removeItem(
        "nivetha_anna_token"
      );

      localStorage.removeItem(
        "nivetha_anna_user"
      );
    }

    return Promise.reject(error);
  }
);

/* =====================================================
   RESPONSE HANDLER
===================================================== */

const handleResponse = (response) => {
  if (!response?.data) {
    throw new Error(
      "Invalid server response"
    );
  }

  if (response.data.success === false) {
    throw new Error(
      response.data.message ||
        "Notification request failed"
    );
  }

  return response.data;
};

/* =====================================================
   GET ALL NOTIFICATIONS
===================================================== */

const getNotifications = async () => {
  try {
    const response =
      await notificationAPI.get("/");

    return handleResponse(response);
  } catch (error) {
    console.error(
      "Get Owner Notifications Error:",
      error?.response?.data ||
        error?.message
    );

    throw error;
  }
};

/* =====================================================
   GET UNREAD NOTIFICATIONS
===================================================== */

const getUnreadNotifications =
  async () => {
    try {
      const response =
        await notificationAPI.get(
          "/unread"
        );

      return handleResponse(response);
    } catch (error) {
      console.error(
        "Get Unread Notifications Error:",
        error?.response?.data ||
          error?.message
      );

      throw error;
    }
  };

/* =====================================================
   GET UNREAD COUNT
===================================================== */

const getUnreadCount = async () => {
  try {
    const response =
      await notificationAPI.get(
        "/unread-count"
      );

    return handleResponse(response);
  } catch (error) {
    console.error(
      "Get Unread Notification Count Error:",
      error?.response?.data ||
        error?.message
    );

    throw error;
  }
};

/* =====================================================
   GET SINGLE NOTIFICATION
===================================================== */

const getNotificationById = async (
  id
) => {
  if (!id) {
    throw new Error(
      "Notification ID is required"
    );
  }

  try {
    const response =
      await notificationAPI.get(
        `/${id}`
      );

    return handleResponse(response);
  } catch (error) {
    console.error(
      "Get Notification Error:",
      error?.response?.data ||
        error?.message
    );

    throw error;
  }
};

/* =====================================================
   MARK ONE AS READ
===================================================== */

const markAsRead = async (id) => {
  if (!id) {
    throw new Error(
      "Notification ID is required"
    );
  }

  try {
    const response =
      await notificationAPI.patch(
        `/${id}/read`
      );

    return handleResponse(response);
  } catch (error) {
    console.error(
      "Mark Notification As Read Error:",
      error?.response?.data ||
        error?.message
    );

    throw error;
  }
};

/* =====================================================
   MARK ALL AS READ
===================================================== */

const markAllAsRead = async () => {
  try {
    const response =
      await notificationAPI.patch(
        "/read-all"
      );

    return handleResponse(response);
  } catch (error) {
    console.error(
      "Mark All Notifications As Read Error:",
      error?.response?.data ||
        error?.message
    );

    throw error;
  }
};

/* =====================================================
   DELETE ONE NOTIFICATION
===================================================== */

const deleteNotification = async (
  id
) => {
  if (!id) {
    throw new Error(
      "Notification ID is required"
    );
  }

  try {
    const response =
      await notificationAPI.delete(
        `/${id}`
      );

    return handleResponse(response);
  } catch (error) {
    console.error(
      "Delete Notification Error:",
      error?.response?.data ||
        error?.message
    );

    throw error;
  }
};

/* =====================================================
   DELETE READ NOTIFICATIONS
===================================================== */

const deleteReadNotifications =
  async () => {
    try {
      const response =
        await notificationAPI.delete(
          "/read"
        );

      return handleResponse(response);
    } catch (error) {
      console.error(
        "Delete Read Notifications Error:",
        error?.response?.data ||
          error?.message
      );

      throw error;
    }
  };

/* =====================================================
   DELETE ALL NOTIFICATIONS
===================================================== */

const deleteAllNotifications =
  async () => {
    try {
      const response =
        await notificationAPI.delete(
          "/all"
        );

      return handleResponse(response);
    } catch (error) {
      console.error(
        "Delete All Notifications Error:",
        error?.response?.data ||
          error?.message
      );

      throw error;
    }
  };

/* =====================================================
   SERVICE OBJECT
===================================================== */

const notificationService = {
  getNotifications,
  getUnreadNotifications,
  getUnreadCount,
  getNotificationById,

  markAsRead,
  markAllAsRead,

  deleteNotification,
  deleteReadNotifications,
  deleteAllNotifications,
};

/* =====================================================
   DEFAULT EXPORT
===================================================== */

export default notificationService;

/* =====================================================
   NAMED EXPORTS
===================================================== */

export {
  getNotifications,
  getUnreadNotifications,
  getUnreadCount,
  getNotificationById,

  markAsRead,
  markAllAsRead,

  deleteNotification,
  deleteReadNotifications,
  deleteAllNotifications,
};