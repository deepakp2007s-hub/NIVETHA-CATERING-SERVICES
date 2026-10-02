import axios from "axios";

/* =====================================================
   API CONFIGURATION
===================================================== */

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

/* =====================================================
   STORAGE KEYS
===================================================== */

const USER_KEY = "nivetha_anna_user";
const TOKEN_KEY = "nivetha_anna_token";

/* =====================================================
   AXIOS REQUEST INTERCEPTOR
===================================================== */

authAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* =====================================================
   AXIOS RESPONSE INTERCEPTOR
===================================================== */

authAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error?.response?.status === 401 ||
      error?.response?.status === 403
    ) {
      localStorage.removeItem(TOKEN_KEY);
    }

    return Promise.reject(error);
  }
);

/* =====================================================
   LOCAL STORAGE
===================================================== */

const getStoredUser = () => {
  try {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error("GET STORED USER ERROR:", error);
    return null;
  }
};

const saveUser = (user) => {
  if (!user) return;

  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error("SAVE USER ERROR:", error);
  }
};

const clearUser = () => {
  localStorage.removeItem(USER_KEY);
};

const getStoredToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY) || null;
  } catch (error) {
    console.error("GET STORED TOKEN ERROR:", error);
    return null;
  }
};

const saveToken = (token) => {
  if (!token) {
    clearToken();
    return null;
  }

  const cleanToken = String(token).trim();

  localStorage.setItem(TOKEN_KEY, cleanToken);

  return cleanToken;
};

const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

/* =====================================================
   LOGIN
   POST /api/auth/login
===================================================== */

const login = async (loginData = {}) => {
  try {
    const phone = String(loginData.phone || "").trim();
    const password = String(loginData.password || "");

    const response = await authAPI.post("/auth/login", {
      phone,
      password,
    });

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
      error?.response?.data || error?.message || error
    );

    throw error;
  }
};

/* =====================================================
   GET CURRENT OWNER
   GET /api/auth/profile
===================================================== */

const getCurrentUser = async () => {
  try {
    const response = await authAPI.get("/auth/profile");

    const data = response.data;

    const owner =
      data?.owner ||
      data?.user ||
      data?.data?.owner ||
      data?.data?.user ||
      null;

    if (owner) {
      saveUser(owner);

      return {
        ...data,
        success: data?.success ?? true,
        owner,
        user: owner,
      };
    }

    return null;
  } catch (error) {
    console.error(
      "GET CURRENT USER API ERROR:",
      error?.response?.data || error?.message || error
    );

    throw error;
  }
};

/* =====================================================
   UPDATE PROFILE
   PUT /api/auth/profile
===================================================== */

const updateProfile = async (profileData = {}) => {
  try {
    const payload = {
      name: String(profileData.name || "").trim(),
      phone: String(profileData.phone || "").trim(),
      email: String(profileData.email || "").trim(),
      address: String(profileData.address || "").trim(),
      profileImage: profileData.profileImage || "",
    };

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

    return {
      ...data,
      success: data?.success ?? true,
      owner: owner || getStoredUser(),
      user: owner || getStoredUser(),
    };
  } catch (error) {
    console.error(
      "UPDATE PROFILE API ERROR:",
      error?.response?.data || error?.message || error
    );

    throw error;
  }
};

/* =====================================================
   CHANGE PASSWORD
   PUT /api/auth/change-password
===================================================== */

const changePassword = async (
  currentPassword,
  newPassword
) => {
  try {
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
      error?.response?.data || error?.message || error
    );

    throw error;
  }
};

/* =====================================================
   LOGOUT
   Backend has no logout route.
   JWT is stateless, so clear local token.
===================================================== */

const logout = () => {
  clearToken();

  return {
    success: true,
    message: "Logged out successfully",
  };
};

/* =====================================================
   AUTH STATUS
===================================================== */

const isAuthenticated = () => {
  return Boolean(getStoredToken());
};

/* =====================================================
   EXPORT
===================================================== */

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
};

export default authService;