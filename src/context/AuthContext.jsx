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
    console.error("FAILED TO READ STORED ANNA USER:", error);
    return null;
  }
};

/* =========================================================
   GET STORED TOKEN
========================================================= */

const getStoredToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY) || null;
  } catch (error) {
    console.error("FAILED TO READ STORED ANNA TOKEN:", error);
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
    console.error("FAILED TO SAVE ANNA USER:", error);
  }
};

/* =========================================================
   SAVE TOKEN
========================================================= */

const saveStoredToken = (newToken) => {
  if (!newToken) {
    return null;
  }

  try {
    const cleanToken = String(newToken).trim();

    localStorage.setItem(
      TOKEN_KEY,
      cleanToken
    );

    return cleanToken;
  } catch (error) {
    console.error("FAILED TO SAVE ANNA TOKEN:", error);
    return null;
  }
};

/* =========================================================
   AUTH PROVIDER
========================================================= */

export const AuthProvider = ({ children }) => {
  /* -------------------------------------------------------
     USER
  ------------------------------------------------------- */

  const [user, setUser] = useState(() => {
    return getStoredUser();
  });

  /* -------------------------------------------------------
     TOKEN
  ------------------------------------------------------- */

  const [token, setToken] = useState(() => {
    return getStoredToken();
  });

  /* -------------------------------------------------------
     LOADING
  ------------------------------------------------------- */

  const [loading, setLoading] = useState(false);

  /* -------------------------------------------------------
     AUTHENTICATION
  ------------------------------------------------------- */

  /*
   * User alone is NOT enough.
   *
   * Both user + token are required.
   */

  const isAuthenticated = Boolean(
    user && token
  );

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

      let finalToken = null;
      let finalUser = null;

      /* ---------------------------------------------------
         login(token, user)
      --------------------------------------------------- */

      if (
        typeof authTokenOrUserData === "string" &&
        authTokenOrUserData.trim()
      ) {
        finalToken =
          authTokenOrUserData.trim();

        finalUser = userData;
      }

      /* ---------------------------------------------------
         login(user)
      --------------------------------------------------- */

      else if (
        authTokenOrUserData &&
        typeof authTokenOrUserData === "object"
      ) {
        finalUser =
          authTokenOrUserData;
      }

      /* ---------------------------------------------------
         USER VALIDATION
      --------------------------------------------------- */

      if (!finalUser) {
        console.error(
          "AUTH LOGIN FAILED: USER DATA IS MISSING"
        );

        return false;
      }

      /* ---------------------------------------------------
         TOKEN FALLBACK
      --------------------------------------------------- */

      /*
       * If token wasn't passed directly,
       * check localStorage.
       */

      if (!finalToken) {
        finalToken =
          getStoredToken();
      }

      /* ---------------------------------------------------
         TOKEN VALIDATION
      --------------------------------------------------- */

      if (!finalToken) {
        console.error(
          "AUTH LOGIN FAILED: AUTHENTICATION TOKEN IS MISSING"
        );

        return false;
      }

      /* ---------------------------------------------------
         SAVE USER
      --------------------------------------------------- */

      saveStoredUser(finalUser);

      /* ---------------------------------------------------
         SAVE TOKEN
      --------------------------------------------------- */

      const savedToken =
        saveStoredToken(finalToken);

      if (!savedToken) {
        console.error(
          "AUTH LOGIN FAILED: TOKEN COULD NOT BE SAVED"
        );

        return false;
      }

      /* ---------------------------------------------------
         UPDATE REACT STATE
      --------------------------------------------------- */

      setUser(finalUser);
      setToken(savedToken);

      return true;
    },
    []
  );

  /* =======================================================
     LOGOUT
  ======================================================= */

  const logout = useCallback(() => {
    /*
     * Remove authentication token.
     */

    try {
      localStorage.removeItem(
        TOKEN_KEY
      );
    } catch (error) {
      console.error(
        "FAILED TO REMOVE ANNA TOKEN:",
        error
      );
    }

    /*
     * Clear current session.
     */

    setToken(null);
    setUser(null);

    /*
     * IMPORTANT:
     *
     * USER_KEY is NOT removed.
     *
     * Saved profile information remains
     * available in localStorage.
     */

    return true;
  }, []);

  /* =======================================================
     UPDATE USER
  ======================================================= */

  const updateUser = useCallback(
    (userData) => {
      if (!userData) {
        return;
      }

      saveStoredUser(userData);

      setUser(userData);
    },
    []
  );

  /* =======================================================
     UPDATE USER FIELDS
  ======================================================= */

  const updateUserFields = useCallback(
    (fields) => {
      setUser((currentUser) => {
        const storedUser =
          getStoredUser();

        const updatedUser = {
          ...(currentUser ||
            storedUser ||
            {}),
          ...(fields || {}),
        };

        saveStoredUser(
          updatedUser
        );

        return updatedUser;
      });
    },
    []
  );

  /* =======================================================
     UPDATE TOKEN
  ======================================================= */

  const updateToken = useCallback(
    (newToken) => {
      if (!newToken) {
        try {
          localStorage.removeItem(
            TOKEN_KEY
          );
        } catch (error) {
          console.error(
            "FAILED TO REMOVE ANNA TOKEN:",
            error
          );
        }

        setToken(null);

        return null;
      }

      const savedToken =
        saveStoredToken(
          newToken
        );

      setToken(savedToken);

      return savedToken;
    },
    []
  );

  /* =======================================================
     CLEAR AUTH
  ======================================================= */

  const clearAuth = useCallback(() => {
    /*
     * Clear login session only.
     *
     * Keep saved user/profile.
     */

    try {
      localStorage.removeItem(
        TOKEN_KEY
      );
    } catch (error) {
      console.error(
        "FAILED TO CLEAR ANNA AUTH:",
        error
      );
    }

    setToken(null);
    setUser(null);
  }, []);

  /* =======================================================
     RESTORE AUTH ON APP START
  ======================================================= */

  useEffect(() => {
    const storedUser =
      getStoredUser();

    const storedToken =
      getStoredToken();

    setUser(storedUser);
    setToken(storedToken);
  }, []);

  /* =======================================================
     STORAGE SYNC
  ======================================================= */

  useEffect(() => {
    const handleStorageChange = (
      event
    ) => {
      if (
        event.key === USER_KEY
      ) {
        setUser(
          getStoredUser()
        );
      }

      if (
        event.key === TOKEN_KEY
      ) {
        setToken(
          getStoredToken()
        );
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
      token,
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
      token,
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

  /* =======================================================
     PROVIDER
  ======================================================= */

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
};

/* =========================================================
   USE AUTH
========================================================= */

export const useAuth = () => {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};

export default AuthContext;