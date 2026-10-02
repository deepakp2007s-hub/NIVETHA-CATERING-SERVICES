// ANNA-APP/frontend/src/context/AppContext.jsx

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import authService from "../services/authService.js";
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
  =================================================== */

  const [user, setUser] = useState(() =>
    authService.getStoredUser()
  );

  const [isAuthenticated, setIsAuthenticated] =
    useState(() =>
      Boolean(authService.getStoredToken())
    );

  const [authLoading, setAuthLoading] = useState(true);

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
     INITIAL AUTH CHECK
  =================================================== */

  useEffect(() => {
    let mounted = true;

    const checkAuthentication = async () => {
      const token = authService.getStoredToken();

      if (!token) {
        if (mounted) {
          setUser(null);
          setIsAuthenticated(false);
          setAuthLoading(false);
        }

        return;
      }

      try {
        setAuthLoading(true);

        const response =
          await authService.getCurrentUser();

        const currentUser =
          response?.owner ||
          response?.user ||
          null;

        if (!currentUser) {
          throw new Error(
            "Owner profile not found."
          );
        }

        if (mounted) {
          setUser(currentUser);
          setIsAuthenticated(true);
        }
      } catch (requestError) {
        console.error(
          "AUTH CHECK ERROR:",
          requestError
        );

        if (
          requestError?.response?.status === 401 ||
          requestError?.response?.status === 403
        ) {
          authService.clearToken();
          authService.clearUser();

          if (mounted) {
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      } finally {
        if (mounted) {
          setAuthLoading(false);
        }
      }
    };

    checkAuthentication();

    return () => {
      mounted = false;
    };
  }, []);

  /* ===================================================
     STORAGE SYNC
  =================================================== */

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === "nivetha_anna_user") {
        const storedUser =
          authService.getStoredUser();

        setUser(storedUser);
      }

      if (event.key === "nivetha_anna_token") {
        const storedToken =
          authService.getStoredToken();

        setIsAuthenticated(
          Boolean(storedToken)
        );
      }
    };

    window.addEventListener(
      "storage",
      handleStorageChange
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange
      );
    };
  }, []);

  /* ===================================================
     LOGIN
  =================================================== */

  const login = useCallback(
    async (loginData) => {
      setError(null);
      setAuthLoading(true);

      try {
        const response =
          await authService.login(loginData);

        const loggedInUser =
          response?.owner ||
          response?.user ||
          null;

        const loggedInToken =
          response?.token ||
          authService.getStoredToken();

        if (!loggedInUser) {
          throw new Error(
            "Login successful, but owner data was not returned."
          );
        }

        if (!loggedInToken) {
          throw new Error(
            "Login successful, but authentication token was not returned."
          );
        }

        authService.saveUser(loggedInUser);
        authService.saveToken(loggedInToken);

        setUser(loggedInUser);
        setIsAuthenticated(true);

        return {
          ...response,
          success: true,
          owner: loggedInUser,
          user: loggedInUser,
          token: loggedInToken,
        };
      } catch (requestError) {
        console.error(
          "LOGIN ERROR:",
          requestError
        );

        setError(
          requestError?.response?.data?.message ||
            requestError?.message ||
            "Login failed"
        );

        throw requestError;
      } finally {
        setAuthLoading(false);
      }
    },
    []
  );

  /* ===================================================
     LOGOUT
  =================================================== */

  const logout = useCallback(() => {
    try {
      authService.logout();
    } catch (logoutError) {
      console.error(
        "LOGOUT ERROR:",
        logoutError
      );
    }

    setUser(null);
    setIsAuthenticated(false);

    setBookings([]);
    setCustomers([]);
    setFoods([]);
    setNotifications([]);
    setReports(null);
  }, []);

  /* ===================================================
     UPDATE PROFILE
  =================================================== */

  const updateProfile = useCallback(
    async (profileData) => {
      setError(null);

      try {
        const response =
          await authService.updateProfile(
            profileData
          );

        const updatedUser =
          response?.owner ||
          response?.user ||
          null;

        if (updatedUser) {
          authService.saveUser(updatedUser);

          setUser(updatedUser);
          setIsAuthenticated(
            Boolean(authService.getStoredToken())
          );
        }

        return response;
      } catch (requestError) {
        console.error(
          "UPDATE PROFILE ERROR:",
          requestError
        );

        setError(
          requestError?.response?.data?.message ||
            requestError?.message ||
            "Failed to update profile"
        );

        throw requestError;
      }
    },
    []
  );

  /* ===================================================
     CHANGE PASSWORD
  =================================================== */

  const changePassword = useCallback(
    async (
      currentPassword,
      newPassword
    ) => {
      setError(null);

      try {
        return await authService.changePassword(
          currentPassword,
          newPassword
        );
      } catch (requestError) {
        console.error(
          "CHANGE PASSWORD ERROR:",
          requestError
        );

        setError(
          requestError?.response?.data?.message ||
            requestError?.message ||
            "Failed to change password"
        );

        throw requestError;
      }
    },
    []
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

        setBookings(
          Array.isArray(bookingList)
            ? bookingList
            : []
        );

        return response;
      } catch (requestError) {
        console.error(
          "LOAD BOOKINGS ERROR:",
          requestError
        );

        setError(
          requestError?.response?.data?.message ||
            "Failed to load bookings"
        );

        throw requestError;
      } finally {
        setBookingsLoading(false);
      }
    },
    []
  );

  const getBookingById = useCallback(
    async (bookingId) => {
      return bookingService.getBookingById(
        bookingId
      );
    },
    []
  );

  const createBooking = useCallback(
    async (bookingData) => {
      setError(null);

      const response =
        await bookingService.createBooking(
          bookingData
        );

      await loadBookings();

      return response;
    },
    [loadBookings]
  );

  const updateBooking = useCallback(
    async (
      bookingId,
      bookingData
    ) => {
      setError(null);

      const response =
        await bookingService.updateBooking(
          bookingId,
          bookingData
        );

      await loadBookings();

      return response;
    },
    [loadBookings]
  );

  const updateBookingStatus = useCallback(
    async (
      bookingId,
      status
    ) => {
      setError(null);

      const response =
        await bookingService.updateBookingStatus(
          bookingId,
          status
        );

      await loadBookings();

      return response;
    },
    [loadBookings]
  );

  const acceptBooking = useCallback(
    async (bookingId) => {
      const response =
        await bookingService.acceptBooking(
          bookingId
        );

      await loadBookings();

      return response;
    },
    [loadBookings]
  );

  const confirmBooking = useCallback(
    async (bookingId) => {
      if (
        typeof bookingService.confirmBooking !==
        "function"
      ) {
        throw new Error(
          "confirmBooking is not available in bookingService"
        );
      }

      const response =
        await bookingService.confirmBooking(
          bookingId
        );

      await loadBookings();

      return response;
    },
    [loadBookings]
  );

  const rejectBooking = useCallback(
    async (bookingId) => {
      const response =
        await bookingService.rejectBooking(
          bookingId
        );

      await loadBookings();

      return response;
    },
    [loadBookings]
  );

  const completeBooking = useCallback(
    async (bookingId) => {
      const response =
        await bookingService.completeBooking(
          bookingId
        );

      await loadBookings();

      return response;
    },
    [loadBookings]
  );

  const cancelBooking = useCallback(
    async (bookingId) => {
      const response =
        await bookingService.cancelBooking(
          bookingId
        );

      await loadBookings();

      return response;
    },
    [loadBookings]
  );

  const deleteBooking = useCallback(
    async (bookingId) => {
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
    },
    []
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

        setCustomers(
          Array.isArray(customerList)
            ? customerList
            : []
        );

        return response;
      } catch (requestError) {
        console.error(
          "LOAD CUSTOMERS ERROR:",
          requestError
        );

        setError(
          requestError?.response?.data?.message ||
            "Failed to load customers"
        );

        throw requestError;
      } finally {
        setCustomersLoading(false);
      }
    },
    []
  );

  const getCustomerById = useCallback(
    async (customerId) => {
      return customerService.getCustomerById(
        customerId
      );
    },
    []
  );

  const createCustomer = useCallback(
    async (customerData) => {
      const response =
        await customerService.createCustomer(
          customerData
        );

      await loadCustomers();

      return response;
    },
    [loadCustomers]
  );

  const updateCustomer = useCallback(
    async (
      customerId,
      customerData
    ) => {
      const response =
        await customerService.updateCustomer(
          customerId,
          customerData
        );

      await loadCustomers();

      return response;
    },
    [loadCustomers]
  );

  const deleteCustomer = useCallback(
    async (customerId) => {
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
    },
    []
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

        setFoods(
          Array.isArray(foodList)
            ? foodList
            : []
        );

        return response;
      } catch (requestError) {
        console.error(
          "LOAD FOODS ERROR:",
          requestError
        );

        setError(
          requestError?.response?.data?.message ||
            "Failed to load foods"
        );

        throw requestError;
      } finally {
        setFoodsLoading(false);
      }
    },
    []
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

        setFoods(
          Array.isArray(foodList)
            ? foodList
            : []
        );

        return response;
      } catch (requestError) {
        console.error(
          "LOAD AVAILABLE FOODS ERROR:",
          requestError
        );

        setError(
          requestError?.response?.data?.message ||
            "Failed to load available foods"
        );

        throw requestError;
      } finally {
        setFoodsLoading(false);
      }
    },
    []
  );

  const getFoodById = useCallback(
    async (foodId) => {
      return foodService.getFoodById(foodId);
    },
    []
  );

  const createFood = useCallback(
    async (foodData) => {
      const response =
        await foodService.createFood(
          foodData
        );

      await loadFoods();

      return response;
    },
    [loadFoods]
  );

  const updateFood = useCallback(
    async (
      foodId,
      foodData
    ) => {
      const response =
        await foodService.updateFood(
          foodId,
          foodData
        );

      await loadFoods();

      return response;
    },
    [loadFoods]
  );

  const toggleFoodAvailability =
    useCallback(
      async (foodId) => {
        const response =
          await foodService.toggleFoodAvailability(
            foodId
          );

        await loadFoods();

        return response;
      },
      [loadFoods]
    );

  const deleteFood = useCallback(
    async (foodId) => {
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
    },
    []
  );

  /* ===================================================
     NOTIFICATIONS
  =================================================== */

  const loadNotifications = useCallback(
    async (params = {}) => {
      setNotificationsLoading(true);
      setError(null);

      try {
        const response =
          await notificationService.getNotifications(
            params
          );

        const notificationList =
          Array.isArray(response)
            ? response
            : response?.notifications ||
              response?.data?.notifications ||
              response?.data ||
              [];

        setNotifications(
          Array.isArray(notificationList)
            ? notificationList
            : []
        );

        return response;
      } catch (requestError) {
        console.error(
          "LOAD NOTIFICATIONS ERROR:",
          requestError
        );

        setError(
          requestError?.response?.data?.message ||
            "Failed to load notifications"
        );

        throw requestError;
      } finally {
        setNotificationsLoading(false);
      }
    },
    []
  );

  const markNotificationAsRead =
    useCallback(
      async (notificationId) => {
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
      },
      []
    );

  const markAllNotificationsAsRead =
    useCallback(async () => {
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
    }, []);

  const deleteNotification = useCallback(
    async (notificationId) => {
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
    },
    []
  );

  const deleteAllNotifications =
    useCallback(async () => {
      const response =
        await notificationService.deleteAllNotifications();

      setNotifications([]);

      return response;
    }, []);

  /* ===================================================
     REPORTS
  =================================================== */

  const loadDashboardReport =
    useCallback(async () => {
      setReportsLoading(true);
      setError(null);

      try {
        if (
          typeof reportService.getDashboardReport !==
          "function"
        ) {
          throw new Error(
            "getDashboardReport is not available in reportService"
          );
        }

        const response =
          await reportService.getDashboardReport();

        const reportData =
          response?.report ||
          response?.data ||
          response;

        setReports(reportData);

        return response;
      } catch (requestError) {
        console.error(
          "LOAD DASHBOARD REPORT ERROR:",
          requestError
        );

        setError(
          requestError?.response?.data?.message ||
            "Failed to load dashboard report"
        );

        throw requestError;
      } finally {
        setReportsLoading(false);
      }
    }, []);

  const getBookingReport = useCallback(
    async (params = {}) => {
      return reportService.getBookingReport(
        params
      );
    },
    []
  );

  const getCustomerReport = useCallback(
    async (params = {}) => {
      return reportService.getCustomerReport(
        params
      );
    },
    []
  );

  const getFoodReport = useCallback(
    async (params = {}) => {
      return reportService.getFoodReport(
        params
      );
    },
    []
  );

  const exportReport = useCallback(
    async (
      type,
      params = {}
    ) => {
      if (
        typeof reportService.exportReport !==
        "function"
      ) {
        throw new Error(
          "exportReport is not available in reportService"
        );
      }

      return reportService.exportReport(
        type,
        params
      );
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
      setUser,
      isAuthenticated,
      authLoading,

      login,
      logout,

      updateProfile,
      changePassword,

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
      markNotificationAsRead,
      markAllNotificationsAsRead,
      deleteNotification,
      deleteAllNotifications,

      /* Reports */
      reports,
      setReports,
      reportsLoading,
      loadDashboardReport,
      getBookingReport,
      getCustomerReport,
      getFoodReport,
      exportReport,
    }),
    [
      user,
      isAuthenticated,
      authLoading,

      login,
      logout,
      updateProfile,
      changePassword,

      error,

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

      clearError,
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
      markNotificationAsRead,
      markAllNotificationsAsRead,
      deleteNotification,
      deleteAllNotifications,

      loadDashboardReport,
      getBookingReport,
      getCustomerReport,
      getFoodReport,
      exportReport,
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