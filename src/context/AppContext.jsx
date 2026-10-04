// ANNA-APP/frontend/src/context/AppContext.jsx

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { useAuth } from "./AuthContext.jsx";

import bookingService from "../services/bookingService.js";
import customerService from "../services/customerService.js";
import foodService from "../services/foodService.js";
import notificationService from "../services/notificationService.js";
import reportService from "../services/reportService.js";

/* =====================================================
   CONTEXT
===================================================== */

const AppContext = createContext(null);

/* =====================================================
   APP PROVIDER
===================================================== */

export const AppProvider = ({ children }) => {
  /* ===================================================
     AUTH
     
     AuthContext is the single source of truth.
  =================================================== */

  const {
    user,
    isAuthenticated,
    loading: authLoading,
    login,
    logout,
    updateProfile,
    changePassword,
  } = useAuth();

  /* ===================================================
     GLOBAL DATA
  =================================================== */

  const [bookings, setBookings] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [foods, setFoods] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [reports, setReports] = useState(null);

  /* ===================================================
     LOADING STATES
  =================================================== */

  const [bookingsLoading, setBookingsLoading] =
    useState(false);

  const [customersLoading, setCustomersLoading] =
    useState(false);

  const [foodsLoading, setFoodsLoading] =
    useState(false);

  const [
    notificationsLoading,
    setNotificationsLoading,
  ] = useState(false);

  const [reportsLoading, setReportsLoading] =
    useState(false);

  /* ===================================================
     ERROR
  =================================================== */

  const [error, setError] = useState(null);

  /* ===================================================
     ERROR MESSAGE HELPER
  =================================================== */

  const getErrorMessage = useCallback(
    (requestError, fallbackMessage) => {
      return (
        requestError?.response?.data?.message ||
        requestError?.message ||
        fallbackMessage
      );
    },
    []
  );

  /* ===================================================
     LOGIN
  =================================================== */

  const handleLogin = useCallback(
    async (loginData) => {
      setError(null);

      try {
        return await login(loginData);
      } catch (requestError) {
        const message = getErrorMessage(
          requestError,
          "Login failed"
        );

        setError(message);

        throw requestError;
      }
    },
    [login, getErrorMessage]
  );

  /* ===================================================
     LOGOUT
  =================================================== */

  const handleLogout = useCallback(() => {
    try {
      logout();
    } finally {
      /*
       * Clear current application data.
       *
       * Saved owner profile remains inside AuthContext.
       */
      setBookings([]);
      setCustomers([]);
      setFoods([]);
      setNotifications([]);
      setReports(null);
      setError(null);
    }

    return true;
  }, [logout]);

  /* ===================================================
     UPDATE PROFILE
  =================================================== */

  const handleUpdateProfile = useCallback(
    async (profileData) => {
      setError(null);

      try {
        return await updateProfile(profileData);
      } catch (requestError) {
        const message = getErrorMessage(
          requestError,
          "Failed to update profile"
        );

        setError(message);

        throw requestError;
      }
    },
    [updateProfile, getErrorMessage]
  );

  /* ===================================================
     CHANGE PASSWORD
  =================================================== */

  const handleChangePassword = useCallback(
    async (
      currentPassword,
      newPassword
    ) => {
      setError(null);

      try {
        /*
         * Supports:
         *
         * changePassword(currentPassword, newPassword)
         */

        return await changePassword(
          currentPassword,
          newPassword
        );
      } catch (requestError) {
        const message = getErrorMessage(
          requestError,
          "Failed to change password"
        );

        setError(message);

        throw requestError;
      }
    },
    [changePassword, getErrorMessage]
  );

  /* ===================================================
     BOOKINGS
  =================================================== */

  const loadBookings = useCallback(
    async (params = {}) => {
      setBookingsLoading(true);
      setError(null);

      try {
        const response =
          await bookingService.getBookings(
            params
          );

        const bookingList =
          Array.isArray(response)
            ? response
            : response?.bookings ||
              response?.data?.bookings ||
              response?.data ||
              [];

        const normalizedBookings =
          Array.isArray(bookingList)
            ? bookingList
            : [];

        setBookings(normalizedBookings);

        return response;
      } catch (requestError) {
        console.error(
          "LOAD BOOKINGS ERROR:",
          requestError
        );

        const message = getErrorMessage(
          requestError,
          "Failed to load bookings"
        );

        setError(message);

        throw requestError;
      } finally {
        setBookingsLoading(false);
      }
    },
    [getErrorMessage]
  );

  const getBookingById = useCallback(
    async (bookingId) => {
      return bookingService.getBookingById(
        bookingId
      );
    },
    []
  );

  /*
   * Anna backend does not provide POST /api/bookings.
   *
   * Customer App creates bookings.
   *
   * Keep this compatibility method so older components
   * fail with a clear message instead of an undefined
   * function.
   */

  const createBooking = useCallback(
    async () => {
      throw new Error(
        "Anna App does not create bookings. Bookings are created from the Customer App."
      );
    },
    []
  );

  const updateBooking = useCallback(
    async (
      bookingId,
      bookingData
    ) => {
      setError(null);

      try {
        const response =
          await bookingService.updateBooking(
            bookingId,
            bookingData
          );

        await loadBookings();

        return response;
      } catch (requestError) {
        const message = getErrorMessage(
          requestError,
          "Failed to update booking"
        );

        setError(message);

        throw requestError;
      }
    },
    [loadBookings, getErrorMessage]
  );

  const updateBookingStatus = useCallback(
    async (
      bookingId,
      status
    ) => {
      setError(null);

      try {
        const response =
          await bookingService.updateBookingStatus(
            bookingId,
            status
          );

        await loadBookings();

        return response;
      } catch (requestError) {
        const message = getErrorMessage(
          requestError,
          "Failed to update booking status"
        );

        setError(message);

        throw requestError;
      }
    },
    [loadBookings, getErrorMessage]
  );

  const acceptBooking = useCallback(
    async (bookingId) => {
      setError(null);

      try {
        const response =
          await bookingService.acceptBooking(
            bookingId
          );

        await loadBookings();

        return response;
      } catch (requestError) {
        setError(
          getErrorMessage(
            requestError,
            "Failed to accept booking"
          )
        );

        throw requestError;
      }
    },
    [loadBookings, getErrorMessage]
  );

  const confirmBooking = useCallback(
    async (bookingId) => {
      setError(null);

      try {
        const response =
          await bookingService.confirmBooking(
            bookingId
          );

        await loadBookings();

        return response;
      } catch (requestError) {
        setError(
          getErrorMessage(
            requestError,
            "Failed to confirm booking"
          )
        );

        throw requestError;
      }
    },
    [loadBookings, getErrorMessage]
  );

  const rejectBooking = useCallback(
    async (
      bookingId,
      reason = ""
    ) => {
      setError(null);

      try {
        const response =
          await bookingService.rejectBooking(
            bookingId,
            reason
          );

        await loadBookings();

        return response;
      } catch (requestError) {
        setError(
          getErrorMessage(
            requestError,
            "Failed to reject booking"
          )
        );

        throw requestError;
      }
    },
    [loadBookings, getErrorMessage]
  );

  const completeBooking = useCallback(
    async (bookingId) => {
      setError(null);

      try {
        const response =
          await bookingService.completeBooking(
            bookingId
          );

        await loadBookings();

        return response;
      } catch (requestError) {
        setError(
          getErrorMessage(
            requestError,
            "Failed to complete booking"
          )
        );

        throw requestError;
      }
    },
    [loadBookings, getErrorMessage]
  );

  const cancelBooking = useCallback(
    async (
      bookingId,
      reason = ""
    ) => {
      setError(null);

      try {
        const response =
          await bookingService.cancelBooking(
            bookingId,
            reason
          );

        await loadBookings();

        return response;
      } catch (requestError) {
        setError(
          getErrorMessage(
            requestError,
            "Failed to cancel booking"
          )
        );

        throw requestError;
      }
    },
    [loadBookings, getErrorMessage]
  );

  const deleteBooking = useCallback(
    async (bookingId) => {
      setError(null);

      try {
        const response =
          await bookingService.deleteBooking(
            bookingId
          );

        setBookings(
          (currentBookings) =>
            currentBookings.filter(
              (booking) =>
                String(
                  booking?._id ||
                    booking?.id
                ) !== String(bookingId)
            )
        );

        return response;
      } catch (requestError) {
        setError(
          getErrorMessage(
            requestError,
            "Failed to delete booking"
          )
        );

        throw requestError;
      }
    },
    [getErrorMessage]
  );

  /* ===================================================
     CUSTOMERS
  =================================================== */

  const loadCustomers = useCallback(
    async (params = {}) => {
      setCustomersLoading(true);
      setError(null);

      try {
        const response =
          await customerService.getCustomers(
            params
          );

        const customerList =
          Array.isArray(response)
            ? response
            : response?.customers ||
              response?.data?.customers ||
              response?.data ||
              [];

        const normalizedCustomers =
          Array.isArray(customerList)
            ? customerList
            : [];

        setCustomers(normalizedCustomers);

        return response;
      } catch (requestError) {
        console.error(
          "LOAD CUSTOMERS ERROR:",
          requestError
        );

        setError(
          getErrorMessage(
            requestError,
            "Failed to load customers"
          )
        );

        throw requestError;
      } finally {
        setCustomersLoading(false);
      }
    },
    [getErrorMessage]
  );

  const getCustomerById = useCallback(
    async (customerId) => {
      return customerService.getCustomerById(
        customerId
      );
    },
    []
  );

  /*
   * Customer accounts are created from Customer App.
   * Anna backend intentionally has no POST /customers.
   */

  const createCustomer = useCallback(
    async () => {
      throw new Error(
        "Anna App does not create customer accounts. Customers register from the Customer App."
      );
    },
    []
  );

  const updateCustomer = useCallback(
    async (
      customerId,
      customerData
    ) => {
      setError(null);

      try {
        const response =
          await customerService.updateCustomer(
            customerId,
            customerData
          );

        await loadCustomers();

        return response;
      } catch (requestError) {
        setError(
          getErrorMessage(
            requestError,
            "Failed to update customer"
          )
        );

        throw requestError;
      }
    },
    [loadCustomers, getErrorMessage]
  );

  const deleteCustomer = useCallback(
    async (customerId) => {
      setError(null);

      try {
        const response =
          await customerService.deleteCustomer(
            customerId
          );

        setCustomers(
          (currentCustomers) =>
            currentCustomers.filter(
              (customer) =>
                String(
                  customer?._id ||
                    customer?.id
                ) !== String(customerId)
            )
        );

        return response;
      } catch (requestError) {
        setError(
          getErrorMessage(
            requestError,
            "Failed to delete customer"
          )
        );

        throw requestError;
      }
    },
    [getErrorMessage]
  );

  const searchCustomers = useCallback(
    async (query) => {
      return customerService.searchCustomers(
        query
      );
    },
    []
  );

  /* ===================================================
     FOODS
  =================================================== */

  const loadFoods = useCallback(
    async (params = {}) => {
      setFoodsLoading(true);
      setError(null);

      try {
        const response =
          await foodService.getFoods(params);

        const foodList =
          Array.isArray(response)
            ? response
            : response?.foods ||
              response?.data?.foods ||
              response?.data ||
              [];

        const normalizedFoods =
          Array.isArray(foodList)
            ? foodList
            : [];

        setFoods(normalizedFoods);

        return response;
      } catch (requestError) {
        console.error(
          "LOAD FOODS ERROR:",
          requestError
        );

        setError(
          getErrorMessage(
            requestError,
            "Failed to load foods"
          )
        );

        throw requestError;
      } finally {
        setFoodsLoading(false);
      }
    },
    [getErrorMessage]
  );

  const loadAvailableFoods = useCallback(
    async (params = {}) => {
      setFoodsLoading(true);
      setError(null);

      try {
        const response =
          await foodService.getAvailableFoods(
            params
          );

        const foodList =
          Array.isArray(response)
            ? response
            : response?.foods ||
              response?.data?.foods ||
              response?.data ||
              [];

        const normalizedFoods =
          Array.isArray(foodList)
            ? foodList
            : [];

        setFoods(normalizedFoods);

        return response;
      } catch (requestError) {
        console.error(
          "LOAD AVAILABLE FOODS ERROR:",
          requestError
        );

        setError(
          getErrorMessage(
            requestError,
            "Failed to load available foods"
          )
        );

        throw requestError;
      } finally {
        setFoodsLoading(false);
      }
    },
    [getErrorMessage]
  );

  const getFoodById = useCallback(
    async (foodId) => {
      return foodService.getFoodById(
        foodId
      );
    },
    []
  );

  const createFood = useCallback(
    async (foodData) => {
      setError(null);

      try {
        const response =
          await foodService.createFood(
            foodData
          );

        await loadFoods();

        return response;
      } catch (requestError) {
        setError(
          getErrorMessage(
            requestError,
            "Failed to create food"
          )
        );

        throw requestError;
      }
    },
    [loadFoods, getErrorMessage]
  );

  const updateFood = useCallback(
    async (
      foodId,
      foodData
    ) => {
      setError(null);

      try {
        const response =
          await foodService.updateFood(
            foodId,
            foodData
          );

        await loadFoods();

        return response;
      } catch (requestError) {
        setError(
          getErrorMessage(
            requestError,
            "Failed to update food"
          )
        );

        throw requestError;
      }
    },
    [loadFoods, getErrorMessage]
  );

  const toggleFoodAvailability =
    useCallback(
      async (foodId) => {
        setError(null);

        try {
          const response =
            await foodService.toggleFoodAvailability(
              foodId
            );

          await loadFoods();

          return response;
        } catch (requestError) {
          setError(
            getErrorMessage(
              requestError,
              "Failed to update food availability"
            )
          );

          throw requestError;
        }
      },
      [loadFoods, getErrorMessage]
    );

  const deleteFood = useCallback(
    async (foodId) => {
      setError(null);

      try {
        const response =
          await foodService.deleteFood(
            foodId
          );

        setFoods(
          (currentFoods) =>
            currentFoods.filter(
              (food) =>
                String(
                  food?._id ||
                    food?.id
                ) !== String(foodId)
            )
        );

        return response;
      } catch (requestError) {
        setError(
          getErrorMessage(
            requestError,
            "Failed to delete food"
          )
        );

        throw requestError;
      }
    },
    [getErrorMessage]
  );

  /* ===================================================
     NOTIFICATIONS
  =================================================== */

  const loadNotifications = useCallback(
    async () => {
      setNotificationsLoading(true);
      setError(null);

      try {
        const response =
          await notificationService.getNotifications();

        const notificationList =
          Array.isArray(response)
            ? response
            : response?.notifications ||
              response?.data?.notifications ||
              response?.data ||
              [];

        const normalizedNotifications =
          Array.isArray(notificationList)
            ? notificationList
            : [];

        setNotifications(
          normalizedNotifications
        );

        return response;
      } catch (requestError) {
        console.error(
          "LOAD NOTIFICATIONS ERROR:",
          requestError
        );

        setError(
          getErrorMessage(
            requestError,
            "Failed to load notifications"
          )
        );

        throw requestError;
      } finally {
        setNotificationsLoading(false);
      }
    },
    [getErrorMessage]
  );

  const getUnreadNotifications =
    useCallback(async () => {
      return notificationService.getUnreadNotifications();
    }, []);

  const getUnreadNotificationCount =
    useCallback(async () => {
      return notificationService.getUnreadCount();
    }, []);

  const markNotificationAsRead =
    useCallback(
      async (notificationId) => {
        setError(null);

        try {
          const response =
            await notificationService.markAsRead(
              notificationId
            );

          setNotifications(
            (currentNotifications) =>
              currentNotifications.map(
                (notification) =>
                  String(
                    notification?._id ||
                      notification?.id
                  ) === String(notificationId)
                    ? {
                        ...notification,
                        isRead: true,
                      }
                    : notification
              )
          );

          return response;
        } catch (requestError) {
          setError(
            getErrorMessage(
              requestError,
              "Failed to mark notification as read"
            )
          );

          throw requestError;
        }
      },
      [getErrorMessage]
    );

  const markAllNotificationsAsRead =
    useCallback(async () => {
      setError(null);

      try {
        const response =
          await notificationService.markAllAsRead();

        setNotifications(
          (currentNotifications) =>
            currentNotifications.map(
              (notification) => ({
                ...notification,
                isRead: true,
              })
            )
        );

        return response;
      } catch (requestError) {
        setError(
          getErrorMessage(
            requestError,
            "Failed to mark notifications as read"
          )
        );

        throw requestError;
      }
    }, [getErrorMessage]);

  const deleteNotification = useCallback(
    async (notificationId) => {
      setError(null);

      try {
        const response =
          await notificationService.deleteNotification(
            notificationId
          );

        setNotifications(
          (currentNotifications) =>
            currentNotifications.filter(
              (notification) =>
                String(
                  notification?._id ||
                    notification?.id
                ) !== String(notificationId)
            )
        );

        return response;
      } catch (requestError) {
        setError(
          getErrorMessage(
            requestError,
            "Failed to delete notification"
          )
        );

        throw requestError;
      }
    },
    [getErrorMessage]
  );

  const deleteReadNotifications =
    useCallback(async () => {
      setError(null);

      try {
        const response =
          await notificationService.deleteReadNotifications();

        setNotifications(
          (currentNotifications) =>
            currentNotifications.filter(
              (notification) =>
                !notification?.isRead
            )
        );

        return response;
      } catch (requestError) {
        setError(
          getErrorMessage(
            requestError,
            "Failed to delete read notifications"
          )
        );

        throw requestError;
      }
    }, [getErrorMessage]);

  const deleteAllNotifications =
    useCallback(async () => {
      setError(null);

      try {
        const response =
          await notificationService.deleteAllNotifications();

        setNotifications([]);

        return response;
      } catch (requestError) {
        setError(
          getErrorMessage(
            requestError,
            "Failed to delete notifications"
          )
        );

        throw requestError;
      }
    }, [getErrorMessage]);

  /* ===================================================
     REPORTS
  =================================================== */

  const getBookingReport = useCallback(
    async (params = {}) => {
      setReportsLoading(true);
      setError(null);

      try {
        const response =
          await reportService.getBookingReport(
            params
          );

        const reportData =
          response?.report ||
          response?.data ||
          response;

        setReports(reportData);

        return response;
      } catch (requestError) {
        setError(
          getErrorMessage(
            requestError,
            "Failed to load booking report"
          )
        );

        throw requestError;
      } finally {
        setReportsLoading(false);
      }
    },
    [getErrorMessage]
  );

  const getFunctionReport = useCallback(
    async () => {
      setReportsLoading(true);
      setError(null);

      try {
        const response =
          await reportService.getFunctionReport();

        const reportData =
          response?.report ||
          response?.data ||
          response;

        setReports(reportData);

        return response;
      } catch (requestError) {
        setError(
          getErrorMessage(
            requestError,
            "Failed to load function report"
          )
        );

        throw requestError;
      } finally {
        setReportsLoading(false);
      }
    },
    [getErrorMessage]
  );

  const getDateReport = useCallback(
    async () => {
      setReportsLoading(true);
      setError(null);

      try {
        const response =
          await reportService.getDateReport();

        const reportData =
          response?.report ||
          response?.data ||
          response;

        setReports(reportData);

        return response;
      } catch (requestError) {
        setError(
          getErrorMessage(
            requestError,
            "Failed to load date report"
          )
        );

        throw requestError;
      } finally {
        setReportsLoading(false);
      }
    },
    [getErrorMessage]
  );

  /*
   * Compatibility alias.
   *
   * Dashboard statistics are provided by:
   * /api/dashboard/stats
   *
   * That endpoint belongs to dashboardService/controller,
   * not reportService.
   *
   * This method intentionally does not call a nonexistent
   * reportService.getDashboardReport().
   */

  const loadDashboardReport = useCallback(
    async () => {
      return {
        success: false,
        message:
          "Dashboard statistics are loaded by the dashboard module.",
      };
    },
    []
  );

  /* ===================================================
     CLEAR ERROR
  =================================================== */

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /* ===================================================
     CONTEXT VALUE
  =================================================== */

  const value = useMemo(
    () => ({
      /* Auth */
      user,
      isAuthenticated,
      authLoading,

      login: handleLogin,
      logout: handleLogout,

      updateProfile: handleUpdateProfile,
      changePassword: handleChangePassword,

      /* Global */
      error,
      clearError,

      /* Bookings */
      bookings,
      setBookings,
      bookingsLoading,

      loadBookings,
      getBookingById,

      createBooking,
      updateBooking,
      updateBookingStatus,

      acceptBooking,
      confirmBooking,
      rejectBooking,
      completeBooking,
      cancelBooking,
      deleteBooking,

      /* Customers */
      customers,
      setCustomers,
      customersLoading,

      loadCustomers,
      getCustomerById,
      createCustomer,
      updateCustomer,
      deleteCustomer,
      searchCustomers,

      /* Foods */
      foods,
      setFoods,
      foodsLoading,

      loadFoods,
      loadAvailableFoods,
      getFoodById,
      createFood,
      updateFood,
      toggleFoodAvailability,
      deleteFood,

      /* Notifications */
      notifications,
      setNotifications,
      notificationsLoading,

      loadNotifications,
      getUnreadNotifications,
      getUnreadNotificationCount,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      deleteNotification,
      deleteReadNotifications,
      deleteAllNotifications,

      /* Reports */
      reports,
      setReports,
      reportsLoading,

      loadDashboardReport,
      getBookingReport,
      getFunctionReport,
      getDateReport,
    }),
    [
      user,
      isAuthenticated,
      authLoading,

      handleLogin,
      handleLogout,
      handleUpdateProfile,
      handleChangePassword,

      error,
      clearError,

      bookings,
      bookingsLoading,

      customers,
      customersLoading,

      foods,
      foodsLoading,

      notifications,
      notificationsLoading,

      reports,
      reportsLoading,

      loadBookings,
      getBookingById,
      createBooking,
      updateBooking,
      updateBookingStatus,
      acceptBooking,
      confirmBooking,
      rejectBooking,
      completeBooking,
      cancelBooking,
      deleteBooking,

      loadCustomers,
      getCustomerById,
      createCustomer,
      updateCustomer,
      deleteCustomer,
      searchCustomers,

      loadFoods,
      loadAvailableFoods,
      getFoodById,
      createFood,
      updateFood,
      toggleFoodAvailability,
      deleteFood,

      loadNotifications,
      getUnreadNotifications,
      getUnreadNotificationCount,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      deleteNotification,
      deleteReadNotifications,
      deleteAllNotifications,

      loadDashboardReport,
      getBookingReport,
      getFunctionReport,
      getDateReport,
    ]
  );

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

/* =====================================================
   HOOK
===================================================== */

export const useApp = () => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error(
      "useApp must be used inside AppProvider"
    );
  }

  return context;
};

export default AppContext;