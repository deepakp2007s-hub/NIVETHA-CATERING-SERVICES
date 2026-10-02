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

const reportAPI = axios.create({
  baseURL: `${API_BASE_URL}/reports`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 20000,
});

/* =====================================================
   REQUEST INTERCEPTOR
   Automatically sends owner JWT token
===================================================== */

reportAPI.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem(TOKEN_KEY);

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

/* =====================================================
   RESPONSE HANDLER
===================================================== */

const handleResponse = (response) => {
  if (!response?.data) {
    throw new Error(
      "Invalid server response",
    );
  }

  if (response.data.success === false) {
    throw new Error(
      response.data.message ||
        "Request failed",
    );
  }

  return response.data;
};

/* =====================================================
   SUMMARY
===================================================== */

const getSummaryReport = async () => {
  try {
    const response =
      await reportAPI.get("/summary");

    return handleResponse(response);
  } catch (error) {
    console.error(
      "Get Summary Report Error:",
      error?.response?.data ||
        error?.message,
    );

    throw error;
  }
};

/* =====================================================
   BOOKING REPORT
===================================================== */

const getBookingReport = async (
  params = {},
) => {
  try {
    const response =
      await reportAPI.get(
        "/bookings",
        {
          params,
        },
      );

    return handleResponse(response);
  } catch (error) {
    console.error(
      "Get Booking Report Error:",
      error?.response?.data ||
        error?.message,
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
      await reportAPI.get(
        "/customers",
      );

    return handleResponse(response);
  } catch (error) {
    console.error(
      "Get Customer Report Error:",
      error?.response?.data ||
        error?.message,
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
      await reportAPI.get("/foods");

    return handleResponse(response);
  } catch (error) {
    console.error(
      "Get Food Report Error:",
      error?.response?.data ||
        error?.message,
    );

    throw error;
  }
};

/* =====================================================
   CATERING REPORT
===================================================== */

const getCateringReport = async (
  params = {},
) => {
  try {
    const response =
      await reportAPI.get(
        "/catering",
        {
          params,
        },
      );

    return handleResponse(response);
  } catch (error) {
    console.error(
      "Get Catering Report Error:",
      error?.response?.data ||
        error?.message,
    );

    throw error;
  }
};

/* =====================================================
   CREATE REPORT
===================================================== */

const createReport = async (
  reportData,
) => {
  if (
    !reportData ||
    typeof reportData !== "object"
  ) {
    throw new Error(
      "Report data is required",
    );
  }

  try {
    const response =
      await reportAPI.post(
        "/",
        reportData,
      );

    return handleResponse(response);
  } catch (error) {
    console.error(
      "Create Report Error:",
      error?.response?.data ||
        error?.message,
    );

    throw error;
  }
};

/* =====================================================
   SAVED REPORTS
===================================================== */

const getSavedReports = async (
  params = {},
) => {
  try {
    const response =
      await reportAPI.get(
        "/saved",
        {
          params,
        },
      );

    return handleResponse(response);
  } catch (error) {
    console.error(
      "Get Saved Reports Error:",
      error?.response?.data ||
        error?.message,
    );

    throw error;
  }
};

/* =====================================================
   REPORT BY ID
===================================================== */

const getReportById = async (
  id,
  params = {},
) => {
  if (!id) {
    throw new Error(
      "Report ID is required",
    );
  }

  try {
    const response =
      await reportAPI.get(
        `/saved/${id}`,
        {
          params,
        },
      );

    return handleResponse(response);
  } catch (error) {
    console.error(
      "Get Report Error:",
      error?.response?.data ||
        error?.message,
    );

    throw error;
  }
};

/* =====================================================
   DELETE REPORT
===================================================== */

const deleteReport = async (
  id,
  params = {},
) => {
  if (!id) {
    throw new Error(
      "Report ID is required",
    );
  }

  try {
    const response =
      await reportAPI.delete(
        `/saved/${id}`,
        {
          params,
        },
      );

    return handleResponse(response);
  } catch (error) {
    console.error(
      "Delete Report Error:",
      error?.response?.data ||
        error?.message,
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
  getCustomerReport,
  getFoodReport,
  getCateringReport,
  createReport,
  getSavedReports,
  getReportById,
  deleteReport,
};

export default reportService;

/* =====================================================
   NAMED EXPORTS
===================================================== */

export {
  getSummaryReport,
  getBookingReport,
  getCustomerReport,
  getFoodReport,
  getCateringReport,
  createReport,
  getSavedReports,
  getReportById,
  deleteReport,
};