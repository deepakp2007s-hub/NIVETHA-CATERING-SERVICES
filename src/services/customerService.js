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
      config.headers = config.headers || {};

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
   RESPONSE INTERCEPTOR
===================================================== */

customerAPI.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(
        "nivetha_anna_user",
      );
    }

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
   GET /api/customers
===================================================== */

const getCustomers = async (
  params = {},
) => {
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
   GET /api/customers/:id
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

/*
  Compatibility alias
*/

const getCustomer =
  getCustomerById;

/* =====================================================
   CREATE CUSTOMER
===================================================== */

/*
  Anna backend does NOT currently have:
  POST /api/customers

  Customer accounts are created from the
  Customer App registration flow.

  Keep this function only for compatibility,
  but fail clearly instead of making a wrong API call.
*/

const createCustomer = async () => {
  throw new Error(
    "Creating customers from Anna App is not supported. Customers register from the Customer App.",
  );
};

/* =====================================================
   UPDATE CUSTOMER
   PUT /api/customers/:id
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

  if (
    !customerData ||
    typeof customerData !== "object"
  ) {
    throw new Error(
      "Customer data is required",
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
   DELETE /api/customers/:id
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
   GET /api/customers?search=query
===================================================== */

const searchCustomers = async (
  query,
) => {
  const searchText = String(
    query || "",
  ).trim();

  try {
    const response =
      await customerAPI.get("/", {
        params: {
          search: searchText,
        },
      });

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

/*
  Backend returns customer bookings
  directly from:

  GET /api/customers/:id

  Response:
  {
    success: true,
    customer: {...},
    bookings: [...]
  }
*/

const getCustomerBookings = async (
  id,
) => {
  if (!id) {
    throw new Error(
      "Customer ID is required",
    );
  }

  try {
    const response =
      await customerAPI.get(
        `/${id}`,
      );

    const data =
      handleResponse(response);

    return {
      ...data,
      bookings:
        Array.isArray(
          data.bookings,
        )
          ? data.bookings
          : [],
    };
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