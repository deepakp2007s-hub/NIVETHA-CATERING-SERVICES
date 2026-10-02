// ANNA-APP/frontend/src/services/customerService.js

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

const customerAPI = axios.create({
  baseURL: `${API_BASE_URL}/customers`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

/* =====================================================
   REQUEST INTERCEPTOR
   Automatically sends owner JWT token
===================================================== */

customerAPI.interceptors.request.use(
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
   GET ALL CUSTOMERS
===================================================== */

const getCustomers = async (params = {}) => {
  try {
    const response =
      await customerAPI.get("/", {
        params,
      });

    return handleResponse(response);
  } catch (error) {
    console.error(
      "Get Customers Error:",
      error?.response?.data ||
        error?.message,
    );

    throw error;
  }
};

/* =====================================================
   GET CUSTOMER BY ID
===================================================== */

const getCustomerById = async (id) => {
  if (!id) {
    throw new Error(
      "Customer ID is required",
    );
  }

  try {
    const response =
      await customerAPI.get(`/${id}`);

    return handleResponse(response);
  } catch (error) {
    console.error(
      "Get Customer Error:",
      error?.response?.data ||
        error?.message,
    );

    throw error;
  }
};

const getCustomer = getCustomerById;

/* =====================================================
   CREATE CUSTOMER
===================================================== */

const createCustomer = async (
  customerData,
) => {
  try {
    const response =
      await customerAPI.post(
        "/",
        customerData,
      );

    return handleResponse(response);
  } catch (error) {
    console.error(
      "Create Customer Error:",
      error?.response?.data ||
        error?.message,
    );

    throw error;
  }
};

/* =====================================================
   UPDATE CUSTOMER
===================================================== */

const updateCustomer = async (
  id,
  customerData,
) => {
  if (!id) {
    throw new Error(
      "Customer ID is required",
    );
  }

  try {
    const response =
      await customerAPI.put(
        `/${id}`,
        customerData,
      );

    return handleResponse(response);
  } catch (error) {
    console.error(
      "Update Customer Error:",
      error?.response?.data ||
        error?.message,
    );

    throw error;
  }
};

/* =====================================================
   DELETE CUSTOMER
===================================================== */

const deleteCustomer = async (id) => {
  if (!id) {
    throw new Error(
      "Customer ID is required",
    );
  }

  try {
    const response =
      await customerAPI.delete(
        `/${id}`,
      );

    return handleResponse(response);
  } catch (error) {
    console.error(
      "Delete Customer Error:",
      error?.response?.data ||
        error?.message,
    );

    throw error;
  }
};

/* =====================================================
   SEARCH CUSTOMERS
===================================================== */

const searchCustomers = async (query) => {
  try {
    const response =
      await customerAPI.get(
        "/search",
        {
          params: {
            search: query,
            q: query,
          },
        },
      );

    return handleResponse(response);
  } catch (error) {
    console.error(
      "Search Customers Error:",
      error?.response?.data ||
        error?.message,
    );

    throw error;
  }
};

/* =====================================================
   GET CUSTOMER BOOKINGS
===================================================== */

const getCustomerBookings = async (id) => {
  if (!id) {
    throw new Error(
      "Customer ID is required",
    );
  }

  try {
    const response =
      await customerAPI.get(
        `/${id}/bookings`,
      );

    return handleResponse(response);
  } catch (error) {
    console.error(
      "Get Customer Bookings Error:",
      error?.response?.data ||
        error?.message,
    );

    throw error;
  }
};

/* =====================================================
   CUSTOMER SERVICE
===================================================== */

const customerService = {
  getCustomers,
  getCustomerById,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  searchCustomers,
  getCustomerBookings,
};

export default customerService;

/* =====================================================
   NAMED EXPORTS
===================================================== */

export {
  getCustomers,
  getCustomerById,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  searchCustomers,
  getCustomerBookings,
};