// ANNA-APP/frontend/src/services/bookingService.js

import axios from "axios";

// ======================================================
// API CONFIGURATION
// ======================================================

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5001/api";

const TOKEN_KEY = "nivetha_anna_token";

// ======================================================
// AXIOS INSTANCE
// ======================================================

const bookingAPI = axios.create({
  baseURL: `${API_BASE_URL}/bookings`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// ======================================================
// REQUEST INTERCEPTOR
// ======================================================

bookingAPI.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem(TOKEN_KEY);

    if (token) {
      config.headers =
        config.headers || {};

      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },
  (error) =>
    Promise.reject(error)
);

// ======================================================
// RESPONSE INTERCEPTOR
// ======================================================

bookingAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error?.response?.status === 401
    ) {
      localStorage.removeItem(
        TOKEN_KEY
      );

      localStorage.removeItem(
        "nivetha_anna_user"
      );
    }

    return Promise.reject(error);
  }
);

// ======================================================
// RESPONSE HANDLER
// ======================================================

const handleResponse = (response) => {
  if (!response) {
    throw new Error(
      "No response received from server"
    );
  }

  const data = response.data;

  if (!data) {
    throw new Error(
      "Invalid server response"
    );
  }

  if (data.success === false) {
    throw new Error(
      data.message ||
        "Booking request failed"
    );
  }

  return data;
};

// ======================================================
// ERROR HANDLER
// ======================================================

const handleError = (
  error,
  fallbackMessage
) => {
  console.error(
    fallbackMessage,
    error?.response?.data ||
      error?.message ||
      error
  );

  const message =
    error?.response?.data?.message ||
    error?.message ||
    fallbackMessage;

  const customError =
    new Error(message);

  customError.status =
    error?.response?.status;

  customError.response =
    error?.response;

  throw customError;
};

// ======================================================
// GET ALL BOOKINGS
// GET /api/bookings
// ======================================================

const getBookings = async (
  params = {}
) => {
  try {
    const response =
      await bookingAPI.get("/", {
        params,
      });

    return handleResponse(response);
  } catch (error) {
    return handleError(
      error,
      "Failed to fetch bookings"
    );
  }
};

// ======================================================
// GET SINGLE BOOKING
// GET /api/bookings/:id
// ======================================================

const getBookingById = async (
  id
) => {
  if (!id) {
    throw new Error(
      "Booking ID is required"
    );
  }

  try {
    const response =
      await bookingAPI.get(
        `/${id}`
      );

    return handleResponse(response);
  } catch (error) {
    return handleError(
      error,
      "Failed to fetch booking"
    );
  }
};

const getBooking =
  getBookingById;

// ======================================================
// UPDATE NUMBER OF PERSONS
// PUT /api/bookings/:id/persons
// ======================================================

const updateBookingPersons = async (
  id,
  persons
) => {
  if (!id) {
    throw new Error(
      "Booking ID is required"
    );
  }

  const numericPersons =
    Number(persons);

  if (
    !Number.isInteger(
      numericPersons
    ) ||
    numericPersons < 1
  ) {
    throw new Error(
      "Persons must be a valid number greater than 0"
    );
  }

  try {
    const response =
      await bookingAPI.put(
        `/${id}/persons`,
        {
          persons:
            numericPersons,
        }
      );

    return handleResponse(response);
  } catch (error) {
    return handleError(
      error,
      "Failed to update number of persons"
    );
  }
};

// ======================================================
// ACCEPT BOOKING
// PUT /api/bookings/:id/accept
// ======================================================

const acceptBooking = async (
  id
) => {
  if (!id) {
    throw new Error(
      "Booking ID is required"
    );
  }

  try {
    const response =
      await bookingAPI.put(
        `/${id}/accept`
      );

    return handleResponse(response);
  } catch (error) {
    return handleError(
      error,
      "Failed to accept booking"
    );
  }
};

// ======================================================
// REJECT BOOKING
// PUT /api/bookings/:id/reject
// ======================================================

const rejectBooking = async (
  id,
  reason = ""
) => {
  if (!id) {
    throw new Error(
      "Booking ID is required"
    );
  }

  try {
    const response =
      await bookingAPI.put(
        `/${id}/reject`,
        {
          reason: String(
            reason || ""
          ).trim(),
        }
      );

    return handleResponse(response);
  } catch (error) {
    return handleError(
      error,
      "Failed to reject booking"
    );
  }
};

// ======================================================
// CONFIRM BOOKING
// PUT /api/bookings/:id/confirm
// ======================================================

const confirmBooking = async (
  id
) => {
  if (!id) {
    throw new Error(
      "Booking ID is required"
    );
  }

  try {
    const response =
      await bookingAPI.put(
        `/${id}/confirm`
      );

    return handleResponse(response);
  } catch (error) {
    return handleError(
      error,
      "Failed to confirm booking"
    );
  }
};

// ======================================================
// COMPLETE BOOKING
// PUT /api/bookings/:id/complete
// ======================================================

const completeBooking = async (
  id
) => {
  if (!id) {
    throw new Error(
      "Booking ID is required"
    );
  }

  try {
    const response =
      await bookingAPI.put(
        `/${id}/complete`
      );

    return handleResponse(response);
  } catch (error) {
    return handleError(
      error,
      "Failed to complete booking"
    );
  }
};

// ======================================================
// CANCEL BOOKING
// PUT /api/bookings/:id/cancel
// ======================================================

const cancelBooking = async (
  id,
  reason = ""
) => {
  if (!id) {
    throw new Error(
      "Booking ID is required"
    );
  }

  try {
    const response =
      await bookingAPI.put(
        `/${id}/cancel`,
        {
          reason: String(
            reason || ""
          ).trim(),
        }
      );

    return handleResponse(response);
  } catch (error) {
    return handleError(
      error,
      "Failed to cancel booking"
    );
  }
};

// ======================================================
// DELETE BOOKING
// DELETE /api/bookings/:id
// ======================================================

const deleteBooking = async (
  id
) => {
  if (!id) {
    throw new Error(
      "Booking ID is required"
    );
  }

  try {
    const response =
      await bookingAPI.delete(
        `/${id}`
      );

    return handleResponse(response);
  } catch (error) {
    return handleError(
      error,
      "Failed to delete booking"
    );
  }
};

// ======================================================
// CREATE BOOKING
// ======================================================
//
// Anna app normally receives bookings
// from Customer App.
// This method is kept for AppContext compatibility.
//
// Backend currently does NOT expose POST /api/bookings.
// Do not call this from Anna UI unless a create route
// is added later.
//

const createBooking = async (
  bookingData
) => {
  if (!bookingData) {
    throw new Error(
      "Booking data is required"
    );
  }

  try {
    const response =
      await bookingAPI.post(
        "/",
        bookingData
      );

    return handleResponse(response);
  } catch (error) {
    return handleError(
      error,
      "Failed to create booking"
    );
  }
};

// ======================================================
// UPDATE BOOKING
// ======================================================
//
// Backend currently exposes only
// PUT /:id/persons for owner-side update.
// Keep this function for compatibility.
//

const updateBooking = async (
  id,
  bookingData = {}
) => {
  if (!id) {
    throw new Error(
      "Booking ID is required"
    );
  }

  if (
    bookingData.persons !== undefined
  ) {
    return updateBookingPersons(
      id,
      bookingData.persons
    );
  }

  throw new Error(
    "Only number of persons can currently be updated from the Anna app"
  );
};

// ======================================================
// GENERIC STATUS UPDATE
// ======================================================
//
// The backend intentionally uses specific
// status action endpoints instead of
// PATCH /:id/status.
//

const updateBookingStatus = async (
  id,
  status
) => {
  if (!id) {
    throw new Error(
      "Booking ID is required"
    );
  }

  if (!status) {
    throw new Error(
      "Booking status is required"
    );
  }

  switch (status) {
    case "Accepted":
      return acceptBooking(id);

    case "Confirmed":
      return confirmBooking(id);

    case "Completed":
      return completeBooking(id);

    case "Rejected":
      return rejectBooking(id);

    case "Cancelled":
      return cancelBooking(id);

    default:
      throw new Error(
        `Unsupported booking status: ${status}`
      );
  }
};

// ======================================================
// GET TODAY BOOKINGS
// ======================================================
//
// Backend currently does not expose /today.
// Use date filter on GET /api/bookings instead.
//

const getTodayBookings = async () => {
  const today =
    new Date()
      .toISOString()
      .split("T")[0];

  return getBookings({
    date: today,
  });
};

// ======================================================
// GET UPCOMING BOOKINGS
// ======================================================
//
// Backend currently does not expose /upcoming.
// Fetch all bookings and filter event date
// on frontend.
//

const getUpcomingBookings =
  async () => {
    const response =
      await getBookings();

    const bookings =
      Array.isArray(
        response?.bookings
      )
        ? response.bookings
        : [];

    const now =
      new Date();

    now.setHours(
      0,
      0,
      0,
      0
    );

    const upcoming =
      bookings.filter(
        (booking) => {
          if (
            !booking?.eventDate
          ) {
            return false;
          }

          const eventDate =
            new Date(
              booking.eventDate
            );

          eventDate.setHours(
            0,
            0,
            0,
            0
          );

          return eventDate >= now;
        }
      );

    return {
      ...response,
      bookings: upcoming,
      count: upcoming.length,
    };
  };

// ======================================================
// BOOKING SERVICE
// ======================================================

const bookingService = {
  getBookings,
  getBookingById,
  getBooking,

  createBooking,
  updateBooking,
  updateBookingPersons,

  updateBookingStatus,

  acceptBooking,
  rejectBooking,
  confirmBooking,
  completeBooking,
  cancelBooking,
  deleteBooking,

  getTodayBookings,
  getUpcomingBookings,
};

// ======================================================
// DEFAULT EXPORT
// ======================================================

export default bookingService;

// ======================================================
// NAMED EXPORTS
// ======================================================

export {
  getBookings,
  getBookingById,
  getBooking,

  createBooking,
  updateBooking,
  updateBookingPersons,

  updateBookingStatus,

  acceptBooking,
  rejectBooking,
  confirmBooking,
  completeBooking,
  cancelBooking,
  deleteBooking,

  getTodayBookings,
  getUpcomingBookings,
};