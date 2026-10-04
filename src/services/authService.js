// ANNA-APP/frontend/src/services/authService.js

import axios from "axios";

// ======================================================
// API CONFIGURATION
// ======================================================

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5001/api";

const authAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// ======================================================
// STORAGE KEYS
// ======================================================

const USER_KEY = "nivetha_anna_user";
const TOKEN_KEY = "nivetha_anna_token";

// ======================================================
// REQUEST INTERCEPTOR
// ======================================================

authAPI.interceptors.request.use(
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

// ======================================================
// RESPONSE INTERCEPTOR
// ======================================================

authAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    // Invalid/expired authentication
    if (status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }

    // Keep 403 user data unless backend specifically
    // says the account is inactive.
    if (
      status === 403 &&
      error?.response?.data?.message ===
        "Owner account is inactive"
    ) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }

    return Promise.reject(error);
  }
);

// ======================================================
// ERROR MESSAGE HELPER
// ======================================================

const getErrorMessage = (error, fallback) => {
  return (
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
};

// ======================================================
// LOCAL STORAGE - USER
// ======================================================

const getStoredUser = () => {
  try {
    const user = localStorage.getItem(USER_KEY);

    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error(
      "GET STORED USER ERROR:",
      error
    );

    return null;
  }
};

const saveUser = (user) => {
  if (!user) {
    return null;
  }

  try {
    localStorage.setItem(
      USER_KEY,
      JSON.stringify(user)
    );

    return user;
  } catch (error) {
    console.error(
      "SAVE USER ERROR:",
      error
    );

    return null;
  }
};

const clearUser = () => {
  localStorage.removeItem(USER_KEY);
};

// ======================================================
// LOCAL STORAGE - TOKEN
// ======================================================

const getStoredToken = () => {
  try {
    return (
      localStorage.getItem(TOKEN_KEY) ||
      null
    );
  } catch (error) {
    console.error(
      "GET STORED TOKEN ERROR:",
      error
    );

    return null;
  }
};

const saveToken = (token) => {
  if (!token) {
    clearToken();
    return null;
  }

  const cleanToken = String(token).trim();

  localStorage.setItem(
    TOKEN_KEY,
    cleanToken
  );

  return cleanToken;
};

const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

// ======================================================
// LOGIN
// POST /api/auth/login
// ======================================================

const login = async (loginData = {}) => {
  try {
    const email = String(
      loginData.email || ""
    )
      .trim()
      .toLowerCase();

    const phone = String(
      loginData.phone || ""
    ).trim();

    const password = String(
      loginData.password || ""
    );

    if ((!email && !phone) || !password) {
      throw new Error(
        "Phone/email and password are required"
      );
    }

    const payload = {
      password,
    };

    if (email) {
      payload.email = email;
    } else {
      payload.phone = phone;
    }

    const response = await authAPI.post(
      "/auth/login",
      payload
    );

    const data = response.data;

    const owner =
      data?.owner ||
      data?.user ||
      data?.data?.owner ||
      data?.data?.user ||
      null;

    const token =
      data?.token ||
      data?.accessToken ||
      data?.data?.token ||
      data?.data?.accessToken ||
      null;

    if (!owner) {
      throw new Error(
        "Login successful, but owner information was not returned."
      );
    }

    if (!token) {
      throw new Error(
        "Login successful, but authentication token was not returned."
      );
    }

    saveUser(owner);
    saveToken(token);

    return {
      ...data,
      success: data?.success ?? true,
      owner,
      user: owner,
      token,
    };
  } catch (error) {
    console.error(
      "LOGIN API ERROR:",
      error?.response?.data ||
        error?.message ||
        error
    );

    throw new Error(
      getErrorMessage(
        error,
        "Owner login failed"
      )
    );
  }
};

// ======================================================
// GET CURRENT OWNER
// GET /api/auth/profile
// ======================================================

const getCurrentUser = async () => {
  try {
    const token = getStoredToken();

    if (!token) {
      return null;
    }

    const response = await authAPI.get(
      "/auth/profile"
    );

    const data = response.data;

    const owner =
      data?.owner ||
      data?.user ||
      data?.data?.owner ||
      data?.data?.user ||
      null;

    if (!owner) {
      return null;
    }

    saveUser(owner);

    return {
      ...data,
      success: data?.success ?? true,
      owner,
      user: owner,
    };
  } catch (error) {
    console.error(
      "GET CURRENT USER API ERROR:",
      error?.response?.data ||
        error?.message ||
        error
    );

    throw new Error(
      getErrorMessage(
        error,
        "Failed to load owner profile"
      )
    );
  }
};

// ======================================================
// UPDATE PROFILE
// PUT /api/auth/profile
// ======================================================

const updateProfile = async (
  profileData = {}
) => {
  try {
    const payload = {};

    if (
      profileData.name !== undefined
    ) {
      payload.name = String(
        profileData.name
      ).trim();
    }

    if (
      profileData.phone !== undefined
    ) {
      payload.phone = String(
        profileData.phone
      ).trim();
    }

    if (
      profileData.email !== undefined
    ) {
      payload.email = String(
        profileData.email
      )
        .trim()
        .toLowerCase();
    }

    if (
      profileData.language !== undefined
    ) {
      payload.language =
        profileData.language;
    }

    if (
      profileData.address !== undefined
    ) {
      payload.address = String(
        profileData.address
      ).trim();
    }

    if (
      profileData.profileImage !== undefined
    ) {
      payload.profileImage =
        profileData.profileImage || "";
    }

    const response = await authAPI.put(
      "/auth/profile",
      payload
    );

    const data = response.data;

    const owner =
      data?.owner ||
      data?.user ||
      data?.data?.owner ||
      data?.data?.user ||
      null;

    if (owner) {
      saveUser(owner);
    }

    const storedUser =
      owner || getStoredUser();

    return {
      ...data,
      success: data?.success ?? true,
      owner: storedUser,
      user: storedUser,
    };
  } catch (error) {
    console.error(
      "UPDATE PROFILE API ERROR:",
      error?.response?.data ||
        error?.message ||
        error
    );

    throw new Error(
      getErrorMessage(
        error,
        "Failed to update owner profile"
      )
    );
  }
};

// ======================================================
// CHANGE PASSWORD
// PUT /api/auth/change-password
// ======================================================

const changePassword = async (
  currentPassword,
  newPassword
) => {
  try {
    if (
      !currentPassword ||
      !newPassword
    ) {
      throw new Error(
        "Current password and new password are required"
      );
    }

    const response = await authAPI.put(
      "/auth/change-password",
      {
        currentPassword,
        newPassword,
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "CHANGE PASSWORD API ERROR:",
      error?.response?.data ||
        error?.message ||
        error
    );

    throw new Error(
      getErrorMessage(
        error,
        "Failed to change password"
      )
    );
  }
};

// ======================================================
// LOGOUT
// ======================================================

const logout = () => {
  clearToken();
  clearUser();

  return {
    success: true,
    message: "Logged out successfully",
  };
};

// ======================================================
// AUTHENTICATION STATUS
// ======================================================

const isAuthenticated = () => {
  return Boolean(getStoredToken());
};

// ======================================================
// GET API INSTANCE
// Useful if another frontend service needs the
// authenticated Axios configuration.
// ======================================================

const getAPI = () => {
  return authAPI;
};

// ======================================================
// EXPORT
// ======================================================

const authService = {
  login,
  getCurrentUser,
  updateProfile,
  changePassword,
  logout,
  isAuthenticated,

  getStoredUser,
  saveUser,
  clearUser,

  getStoredToken,
  saveToken,
  clearToken,

  getAPI,
};

export default authService;