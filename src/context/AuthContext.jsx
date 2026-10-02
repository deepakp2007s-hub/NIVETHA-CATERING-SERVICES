
// ANNA-APP/frontend/src/context/AuthContext.jsx

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const AuthContext = createContext(null);

const USER_KEY = "nivetha_anna_user";
const TOKEN_KEY = "nivetha_anna_token";

/* =========================================================
   GET STORED USER
========================================================= */

const getStoredUser = () => {
  try {
    const storedUser = localStorage.getItem(USER_KEY);

    if (!storedUser) {
      return null;
    }

    return JSON.parse(storedUser);
  } catch (error) {
    console.error(
      "Failed to read stored Anna user:",
      error
    );

    return null;
  }
};

/* =========================================================
   SAVE USER
========================================================= */

const saveStoredUser = (userData) => {
  if (!userData) {
    return;
  }

  try {
    localStorage.setItem(
      USER_KEY,
      JSON.stringify(userData)
    );
  } catch (error) {
    console.error(
      "Failed to save Anna user:",
      error
    );
  }
};

/* =========================================================
   AUTH PROVIDER
========================================================= */

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    return getStoredUser();
  });

  const [loading, setLoading] = useState(false);

  /*
   * User data remains stored after logout.
   *
   * This allows:
   * Login
   *   ↓
   * Profile saved
   *   ↓
   * Logout
   *   ↓
   * Login again
   *   ↓
   * Profile details still available
   */

  const isAuthenticated = Boolean(user);

  /* =======================================================
     LOGIN
  ======================================================= */

  const login = useCallback(
    (authTokenOrUserData, userData = null) => {
      /*
       * Supports:
       *
       * login(token, user)
       * login(user)
       */

      const finalUser =
        userData ||
        (authTokenOrUserData &&
        typeof authTokenOrUserData === "object"
          ? authTokenOrUserData
          : null);

      if (!finalUser) {
        return false;
      }

      /*
       * Save user/profile permanently in localStorage.
       */
      saveStoredUser(finalUser);

      /*
       * If backend/login provides a token,
       * keep it separately.
       */
      if (
        typeof authTokenOrUserData === "string" &&
        authTokenOrUserData.trim()
      ) {
        localStorage.setItem(
          TOKEN_KEY,
          authTokenOrUserData
        );
      }

      setUser(finalUser);

      return true;
    },
    []
  );

  /* =======================================================
     LOGOUT
  ======================================================= */

  const logout = useCallback(() => {
    /*
     * IMPORTANT:
     *
     * Do NOT remove USER_KEY here.
     *
     * Profile information must remain available
     * after logout and next login.
     */

    localStorage.removeItem(TOKEN_KEY);

    /*
     * Keep the saved user/profile in localStorage.
     *
     * Context user becomes null only for the
     * current logged-out session.
     */
    setUser(null);

    return true;
  }, []);

  /* =======================================================
     UPDATE USER
  ======================================================= */

  const updateUser = useCallback((userData) => {
    if (!userData) {
      return;
    }

    saveStoredUser(userData);

    setUser(userData);
  }, []);

  /* =======================================================
     UPDATE USER FIELDS
  ======================================================= */

  const updateUserFields = useCallback((fields) => {
    setUser((currentUser) => {
      const updatedUser = {
        ...(currentUser || getStoredUser() || {}),
        ...(fields || {}),
      };

      saveStoredUser(updatedUser);

      return updatedUser;
    });
  }, []);

  /* =======================================================
     UPDATE TOKEN
  ======================================================= */

  const updateToken = useCallback((newToken) => {
    if (!newToken) {
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }

    localStorage.setItem(
      TOKEN_KEY,
      newToken
    );

    return newToken;
  }, []);

  /* =======================================================
     CLEAR AUTH
  ======================================================= */

  const clearAuth = useCallback(() => {
    /*
     * Clear login/session only.
     *
     * USER_KEY is intentionally preserved
     * because it contains saved profile data.
     */
    localStorage.removeItem(TOKEN_KEY);

    setUser(null);
  }, []);

  /* =======================================================
     STORAGE SYNC
  ======================================================= */

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === USER_KEY) {
        setUser(getStoredUser());
      }
    };

    window.addEventListener(
      "storage",
      handleStorageChange
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange
      );
    };
  }, []);

  /* =======================================================
     CONTEXT VALUE
  ======================================================= */

  const value = useMemo(
    () => ({
      token:
        localStorage.getItem(TOKEN_KEY) || null,

      user,
      loading,
      isAuthenticated,

      setLoading,

      login,
      logout,

      updateUser,
      updateUserFields,

      updateToken,
      clearAuth,
    }),
    [
      user,
      loading,
      isAuthenticated,
      login,
      logout,
      updateUser,
      updateUserFields,
      updateToken,
      clearAuth,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/* =========================================================
   USE AUTH
========================================================= */

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};

export default AuthContext;
