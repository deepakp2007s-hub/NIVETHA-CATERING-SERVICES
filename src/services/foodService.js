// ANNA-APP/frontend/src/services/foodService.js

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

const foodAPI = axios.create({
  baseURL: `${API_BASE_URL}/foods`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

/* =====================================================
   REQUEST INTERCEPTOR
   Automatically sends owner JWT token
===================================================== */

foodAPI.interceptors.request.use(
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
   GET ALL FOODS
===================================================== */

const getFoods = async (params = {}) => {
  try {
    const response =
      await foodAPI.get("/", {
        params,
      });

    return handleResponse(response);
  } catch (error) {
    console.error(
      "Get Foods Error:",
      error?.response?.data ||
        error?.message,
    );

    throw error;
  }
};

/* =====================================================
   GET AVAILABLE FOODS
===================================================== */

const getAvailableFoods = async () => {
  try {
    const response =
      await foodAPI.get("/available");

    return handleResponse(response);
  } catch (error) {
    console.error(
      "Get Available Foods Error:",
      error?.response?.data ||
        error?.message,
    );

    throw error;
  }
};

/* =====================================================
   GET FOOD BY ID
===================================================== */

const getFoodById = async (id) => {
  if (!id) {
    throw new Error(
      "Food ID is required",
    );
  }

  try {
    const response =
      await foodAPI.get(`/${id}`);

    return handleResponse(response);
  } catch (error) {
    console.error(
      "Get Food Error:",
      error?.response?.data ||
        error?.message,
    );

    throw error;
  }
};

/* =====================================================
   CREATE FOOD
===================================================== */

const createFood = async (foodData) => {
  if (
    !foodData ||
    typeof foodData !== "object"
  ) {
    throw new Error(
      "Food data is required",
    );
  }

  try {
    const payload = {
      ...foodData,

      name: String(
        foodData.name || "",
      ).trim(),

      tamilName: String(
        foodData.tamilName || "",
      ).trim(),

      category: String(
        foodData.category || "",
      ).trim(),

      type: String(
        foodData.type || "",
      ).trim(),

      description: String(
        foodData.description || "",
      ).trim(),

      image: String(
        foodData.image || "",
      ).trim(),

      isAvailable:
        foodData.isAvailable !== false,

      displayOrder:
        Number.isFinite(
          Number(foodData.displayOrder),
        )
          ? Number(foodData.displayOrder)
          : 0,
    };

    const response =
      await foodAPI.post(
        "/",
        payload,
      );

    return handleResponse(response);
  } catch (error) {
    console.error(
      "Create Food Error:",
      error?.response?.data ||
        error?.message,
    );

    throw error;
  }
};

/* =====================================================
   UPDATE FOOD
===================================================== */

const updateFood = async (
  id,
  foodData,
) => {
  if (!id) {
    throw new Error(
      "Food ID is required",
    );
  }

  if (
    !foodData ||
    typeof foodData !== "object"
  ) {
    throw new Error(
      "Food data is required",
    );
  }

  try {
    const response =
      await foodAPI.put(
        `/${id}`,
        foodData,
      );

    return handleResponse(response);
  } catch (error) {
    console.error(
      "Update Food Error:",
      error?.response?.data ||
        error?.message,
    );

    throw error;
  }
};

/* =====================================================
   TOGGLE FOOD AVAILABILITY
===================================================== */

const toggleFoodAvailability = async (
  id,
) => {
  if (!id) {
    throw new Error(
      "Food ID is required",
    );
  }

  try {
    const response =
      await foodAPI.patch(
        `/${id}/availability`,
      );

    return handleResponse(response);
  } catch (error) {
    console.error(
      "Toggle Food Availability Error:",
      error?.response?.data ||
        error?.message,
    );

    throw error;
  }
};

const updateFoodAvailability =
  toggleFoodAvailability;

/* =====================================================
   DELETE FOOD
===================================================== */

const deleteFood = async (id) => {
  if (!id) {
    throw new Error(
      "Food ID is required",
    );
  }

  try {
    const response =
      await foodAPI.delete(`/${id}`);

    return handleResponse(response);
  } catch (error) {
    console.error(
      "Delete Food Error:",
      error?.response?.data ||
        error?.message,
    );

    throw error;
  }
};

/* =====================================================
   FOOD SERVICE
===================================================== */

const foodService = {
  getFoods,
  getAvailableFoods,
  getFoodById,

  createFood,
  updateFood,

  toggleFoodAvailability,
  updateFoodAvailability,

  deleteFood,
};

export default foodService;

/* =====================================================
   NAMED EXPORTS
===================================================== */

export {
  getFoods,
  getAvailableFoods,
  getFoodById,

  createFood,
  updateFood,

  toggleFoodAvailability,
  updateFoodAvailability,

  deleteFood,
};