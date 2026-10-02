// ANNA-APP/frontend/src/services/bookingService.js

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

const bookingAPI = axios.create({
  baseURL: `${API_BASE_URL}/bookings`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

/* =====================================================
   REQUEST INTERCEPTOR
   Automatically sends owner JWT token
===================================================== */

bookingAPI.interceptors.request.use(
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
   GET ALL BOOKINGS
===================================================== */

const getBookings = async (params = {}) => {
  try {
    const response =
      await bookingAPI.get("/", {
        params,
      });

    return handleResponse(response);
  } catch (error) {
    console.error(
      "Get Bookings Error:",
      error?.response?.data ||
        error?.message,
    );

    throw error;
  }
};

/* =====================================================
   GET BOOKING BY ID
===================================================== */

const getBookingById = async (id) => {
  if (!id) {
    throw new Error(
      "Booking ID is required",
    );
  }

  try {
    const response =
      await bookingAPI.get(`/${id}`);

    return handleResponse(response);
  } catch (error) {
    console.error(
      "Get Booking Error:",
      error?.response?.data ||
        error?.message,
    );

    throw error;
  }
};

const getBooking = getBookingById;

/* =====================================================
   CREATE BOOKING
===================================================== */

const createBooking = async (
  bookingData,
) => {
  try {
    const response =
      await bookingAPI.post(
        "/",
        bookingData,
      );

    return handleResponse(response);
  } catch (error) {
    console.error(
      "Create Booking Error:",
      error?.response?.data ||
        error?.message,
    );

    throw error;
  }
};

/* =====================================================
   UPDATE BOOKING
===================================================== */

const updateBooking = async (
  id,
  bookingData,
) => {
  if (!id) {
    throw new Error(
      "Booking ID is required",
    );
  }

  try {
    const response =
      await bookingAPI.put(
        `/${id}`,
        bookingData,
      );

    return handleResponse(response);
  } catch (error) {
    console.error(
      "Update Booking Error:",
      error?.response?.data ||
        error?.message,
    );

    throw error;
  }
};

/* =====================================================
   UPDATE BOOKING STATUS
===================================================== */

const updateBookingStatus = async (
  id,
  status,
) => {
  if (!id) {
    throw new Error(
      "Booking ID is required",
    );
  }

  if (!status) {
    throw new Error(
      "Booking status is required",
    );
  }

  try {
    const response =
      await bookingAPI.patch(
        `/${id}/status`,
        { status },
      );

    return handleResponse(response);
  } catch (error) {
    console.error(
      "Update Booking Status Error:",
      error?.response?.data ||
        error?.message,
    );

    throw error;
  }
};

/* =====================================================
   ACCEPT BOOKING
===================================================== */

const acceptBooking = async (id) => {
  if (!id) {
    throw new Error(
      "Booking ID is required",
    );
  }

  try {
    const response =
      await bookingAPI.patch(
        `/${id}/accept`,
      );

    return handleResponse(response);
  } catch (error) {
    console.error(
      "Accept Booking Error:",
      error?.response?.data ||
        error?.message,
    );

    throw error;
  }
};

/* =====================================================
   REJECT BOOKING
===================================================== */

const rejectBooking = async (
  id,
  reason = "",
) => {
  if (!id) {
    throw new Error(
      "Booking ID is required",
    );
  }

  try {
    const response =
      await bookingAPI.patch(
        `/${id}/reject`,
        { reason },
      );

    return handleResponse(response);
  } catch (error) {
    console.error(
      "Reject Booking Error:",
      error?.response?.data ||
        error?.message,
    );

    throw error;
  }
};

/* =====================================================
   COMPLETE BOOKING
===================================================== */

const completeBooking = async (id) => {
  if (!id) {
    throw new Error(
      "Booking ID is required",
    );
  }

  try {
    const response =
      await bookingAPI.patch(
        `/${id}/complete`,
      );

    return handleResponse(response);
  } catch (error) {
    console.error(
      "Complete Booking Error:",
      error?.response?.data ||
        error?.message,
    );

    throw error;
  }
};

/* =====================================================
   CANCEL BOOKING
===================================================== */

const cancelBooking = async (id) => {
  if (!id) {
    throw new Error(
      "Booking ID is required",
    );
  }

  try {
    const response =
      await bookingAPI.patch(
        `/${id}/cancel`,
      );

    return handleResponse(response);
  } catch (error) {
    console.error(
      "Cancel Booking Error:",
      error?.response?.data ||
        error?.message,
    );

    throw error;
  }
};

/* =====================================================
   DELETE BOOKING
===================================================== */

const deleteBooking = async (id) => {
  if (!id) {
    throw new Error(
      "Booking ID is required",
    );
  }

  try {
    const response =
      await bookingAPI.delete(
        `/${id}`,
      );

    return handleResponse(response);
  } catch (error) {
    console.error(
      "Delete Booking Error:",
      error?.response?.data ||
        error?.message,
    );

    throw error;
  }
};

/* =====================================================
   TODAY BOOKINGS
===================================================== */

const getTodayBookings = async () => {
  try {
    const response =
      await bookingAPI.get(
        "/today",
      );

    return handleResponse(response);
  } catch (error) {
    console.error(
      "Get Today Bookings Error:",
      error?.response?.data ||
        error?.message,
    );

    throw error;
  }
};

/* =====================================================
   UPCOMING BOOKINGS
===================================================== */

const getUpcomingBookings = async () => {
  try {
    const response =
      await bookingAPI.get(
        "/upcoming",
      );

    return handleResponse(response);
  } catch (error) {
    console.error(
      "Get Upcoming Bookings Error:",
      error?.response?.data ||
        error?.message,
    );

    throw error;
  }
};

/* =====================================================
   BOOKING SERVICE
===================================================== */

const bookingService = {
  getBookings,
  getBookingById,
  getBooking,

  createBooking,
  updateBooking,

  updateBookingStatus,

  acceptBooking,
  rejectBooking,
  completeBooking,
  cancelBooking,
  deleteBooking,

  getTodayBookings,
  getUpcomingBookings,
};

export default bookingService;

/* =====================================================
   NAMED EXPORTS
===================================================== */

export {
  getBookings,
  getBookingById,
  getBooking,

  createBooking,
  updateBooking,

  updateBookingStatus,

  acceptBooking,
  rejectBooking,
  completeBooking,
  cancelBooking,
  deleteBooking,

  getTodayBookings,
  getUpcomingBookings,
};