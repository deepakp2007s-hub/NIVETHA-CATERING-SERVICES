// ANNA-APP/frontend/src/services/reportService.js

import axios from "axios";

/* =====================================================
   API CONFIGURATION
===================================================== */

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5001/api";

const TOKEN_KEY = "nivetha_anna_token";
const USER_KEY = "nivetha_anna_user";

/* =====================================================
   AXIOS HELPERS
===================================================== */

const createAPI = (baseURL) => {
  const api = axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
    },
    timeout: 20000,
  });

  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem(TOKEN_KEY);

      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error?.response?.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }

      return Promise.reject(error);
    }
  );

  return api;
};

/* =====================================================
   API INSTANCES
===================================================== */

const reportAPI = createAPI(
  `${API_BASE_URL}/reports`
);

const dashboardAPI = createAPI(
  `${API_BASE_URL}/dashboard`
);

const bookingAPI = createAPI(
  `${API_BASE_URL}/bookings`
);

const customerAPI = createAPI(
  `${API_BASE_URL}/customers`
);

const foodAPI = createAPI(
  `${API_BASE_URL}/foods`
);

/* =====================================================
   RESPONSE HANDLER
===================================================== */

const handleResponse = (response) => {
  if (!response?.data) {
    throw new Error("Invalid server response");
  }

  if (response.data.success === false) {
    throw new Error(
      response.data.message ||
        "Report request failed"
    );
  }

  return response.data;
};

/* =====================================================
   SUMMARY REPORT
===================================================== */

const getSummaryReport = async () => {
  try {
    const response =
      await dashboardAPI.get("/stats");

    return handleResponse(response);
  } catch (error) {
    console.error(
      "Get Summary Report Error:",
      error?.response?.data ||
        error?.message ||
        error
    );

    throw error;
  }
};

/* =====================================================
   BOOKING REPORT
===================================================== */

const getBookingReport = async (
  params = {}
) => {
  try {
    const response =
      await reportAPI.get("/bookings", {
        params,
      });

    return handleResponse(response);
  } catch (error) {
    console.error(
      "Get Booking Report Error:",
      error?.response?.data ||
        error?.message ||
        error
    );

    throw error;
  }
};

/* =====================================================
   FUNCTION-WISE REPORT
===================================================== */

const getFunctionReport = async () => {
  try {
    const response =
      await reportAPI.get("/functions");

    return handleResponse(response);
  } catch (error) {
    console.error(
      "Get Function Report Error:",
      error?.response?.data ||
        error?.message ||
        error
    );

    throw error;
  }
};

/* =====================================================
   DATE-WISE REPORT
===================================================== */

const getDateReport = async () => {
  try {
    const response =
      await reportAPI.get("/dates");

    return handleResponse(response);
  } catch (error) {
    console.error(
      "Get Date Report Error:",
      error?.response?.data ||
        error?.message ||
        error
    );

    throw error;
  }
};

/* =====================================================
   FOOD REPORT
===================================================== */

const getFoodReport = async () => {
  try {
    const response =
      await foodAPI.get("/");

    const data =
      handleResponse(response);

    const foods =
      Array.isArray(data?.foods)
        ? data.foods
        : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];

    return {
      ...data,
      foods,
      totalFoods:
        data?.totalFoods ??
        foods.length,
    };
  } catch (error) {
    console.error(
      "Get Food Report Error:",
      error?.response?.data ||
        error?.message ||
        error
    );

    throw error;
  }
};

/* =====================================================
   CUSTOMER REPORT
===================================================== */

const getCustomerReport = async () => {
  try {
    const response =
      await customerAPI.get("/");

    const data =
      handleResponse(response);

    const customers =
      Array.isArray(data?.customers)
        ? data.customers
        : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];

    return {
      ...data,
      customers,
      totalCustomers:
        data?.totalCustomers ??
        customers.length,
    };
  } catch (error) {
    console.error(
      "Get Customer Report Error:",
      error?.response?.data ||
        error?.message ||
        error
    );

    throw error;
  }
};

/* =====================================================
   CATERING REPORT
===================================================== */

const getCateringReport = async () => {
  try {
    const response =
      await bookingAPI.get("/");

    const data =
      handleResponse(response);

    const bookings =
      Array.isArray(data?.bookings)
        ? data.bookings
        : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];

    const activeBookings =
      bookings.filter(
        (booking) =>
          !["Cancelled", "Rejected"].includes(
            booking?.status
          )
      );

    const totalPersons =
      activeBookings.reduce(
        (total, booking) =>
          total +
          Number(
            booking?.persons ??
              booking?.numberOfPersons ??
              0
          ),
        0
      );

    const cookingServiceBookings =
      activeBookings.filter(
        (booking) =>
          booking?.cateringServices
            ?.cookingService === true ||
          booking?.cookingService === true
      ).length;

    const servingStaffBookings =
      activeBookings.filter(
        (booking) =>
          booking?.cateringServices
            ?.servingStaff === true ||
          booking?.servingStaff === true
      ).length;

    return {
      ...data,
      bookings,
      totalBookings:
        data?.totalBookings ??
        bookings.length,
      totalPersons:
        data?.totalPersons ??
        totalPersons,
      cookingServiceBookings,
      servingStaffBookings,
    };
  } catch (error) {
    console.error(
      "Get Catering Report Error:",
      error?.response?.data ||
        error?.message ||
        error
    );

    throw error;
  }
};

/* =====================================================
   REPORT SERVICE
===================================================== */

const reportService = {
  getSummaryReport,
  getBookingReport,
  getFunctionReport,
  getDateReport,
  getFoodReport,
  getCustomerReport,
  getCateringReport,
};

export default reportService;

/* =====================================================
   NAMED EXPORTS
===================================================== */

export {
  getSummaryReport,
  getBookingReport,
  getFunctionReport,
  getDateReport,
  getFoodReport,
  getCustomerReport,
  getCateringReport,
};