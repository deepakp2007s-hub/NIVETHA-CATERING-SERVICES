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
  (error) =>
    Promise.reject(error)
);

/* =====================================================
   RESPONSE INTERCEPTOR
===================================================== */

foodAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
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
        "Request failed"
    );
  }

  return response.data;
};

/* =====================================================
   GET ALL FOODS
===================================================== */

const getFoods = async (params = {}) => {
  try {
    const response = await foodAPI.get("/", {
      params,
    });

    return handleResponse(response);
  } catch (error) {
    console.error(
      "Get Foods Error:",
      error?.response?.data ||
        error?.message
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
        error?.message
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
      "Food ID is required"
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
        error?.message
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
      "Food data is required"
    );
  }

  const payload = {
    name: String(
      foodData.name || ""
    ).trim(),

    tamilName: String(
      foodData.tamilName || ""
    ).trim(),

    category: String(
      foodData.category || ""
    ).trim(),

    type: String(
      foodData.type || ""
    ).trim(),

    price: Number(foodData.price),

    image: String(
      foodData.image || ""
    ).trim(),

    description: String(
      foodData.description || ""
    ).trim(),

    available:
      foodData.available !== false,
  };

  if (
    !payload.name ||
    !payload.category ||
    !payload.type
  ) {
    throw new Error(
      "Name, category and type are required"
    );
  }

  if (
    !Number.isFinite(payload.price) ||
    payload.price < 0
  ) {
    throw new Error(
      "Price must be a valid number"
    );
  }

  try {
    const response =
      await foodAPI.post(
        "/",
        payload
      );

    return handleResponse(response);
  } catch (error) {
    console.error(
      "Create Food Error:",
      error?.response?.data ||
        error?.message
    );

    throw error;
  }
};

/* =====================================================
   UPDATE FOOD
===================================================== */

const updateFood = async (
  id,
  foodData
) => {
  if (!id) {
    throw new Error(
      "Food ID is required"
    );
  }

  if (
    !foodData ||
    typeof foodData !== "object"
  ) {
    throw new Error(
      "Food data is required"
    );
  }

  const payload = {
    ...foodData,
  };

  if (payload.name !== undefined) {
    payload.name = String(
      payload.name
    ).trim();
  }

  if (payload.tamilName !== undefined) {
    payload.tamilName = String(
      payload.tamilName
    ).trim();
  }

  if (payload.category !== undefined) {
    payload.category = String(
      payload.category
    ).trim();
  }

  if (payload.type !== undefined) {
    payload.type = String(
      payload.type
    ).trim();
  }

  if (payload.description !== undefined) {
    payload.description = String(
      payload.description
    ).trim();
  }

  if (payload.image !== undefined) {
    payload.image = String(
      payload.image
    ).trim();
  }

  if (payload.price !== undefined) {
    payload.price = Number(
      payload.price
    );
  }

  if (payload.available !== undefined) {
    if (
      typeof payload.available ===
      "string"
    ) {
      payload.available =
        payload.available
          .trim()
          .toLowerCase() === "true";
    } else {
      payload.available =
        Boolean(payload.available);
    }
  }

  try {
    const response =
      await foodAPI.put(
        `/${id}`,
        payload
      );

    return handleResponse(response);
  } catch (error) {
    console.error(
      "Update Food Error:",
      error?.response?.data ||
        error?.message
    );

    throw error;
  }
};

/* =====================================================
   TOGGLE FOOD AVAILABILITY
===================================================== */

const toggleFoodAvailability =
  async (id) => {
    if (!id) {
      throw new Error(
        "Food ID is required"
      );
    }

    try {
      /*
        IMPORTANT:
        Backend route is:
        PATCH /foods/:id/toggle-availability
      */

      const response =
        await foodAPI.patch(
          `/${id}/toggle-availability`
        );

      return handleResponse(response);
    } catch (error) {
      console.error(
        "Toggle Food Availability Error:",
        error?.response?.data ||
          error?.message
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
      "Food ID is required"
    );
  }

  try {
    const response =
      await foodAPI.delete(
        `/${id}`
      );

    return handleResponse(response);
  } catch (error) {
    console.error(
      "Delete Food Error:",
      error?.response?.data ||
        error?.message
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

/* =====================================================
   DEFAULT EXPORT
===================================================== */

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