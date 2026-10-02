// ANNA-APP/frontend/src/pages/Settings.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import authService from "../services/authService";
import "./Settings.css";

/*
=====================================================
NIVETHA CATERING SERVICE
ANNA OWNER APP — SETTINGS
=====================================================

SETTINGS
   ↓
AppContext
   ↓
Language / App Preferences
   ↓
LocalStorage

OR

Settings
   ↓
Change Password
   ↓
authService.changePassword()
   ↓
Axios
   ↓
Anna Backend : 5001
   ↓
/api/auth/change-password
   ↓
MongoDB

OR

Settings
   ↓
Sign Out
   ↓
authService.logout()
   ↓
Clear Owner User
   ↓
AuthContext.logout()
   ↓
/login

Direct-access compatible.
No JWT dependency.
=====================================================
*/

const Settings = () => {
  const navigate = useNavigate();

  const {
    language,
    changeLanguage,
    toggleLanguage,
  } = useApp();

  const { logout } = useAuth();

  // ==========================================
  // LOCAL SETTINGS
  // ==========================================

  const [notifications, setNotifications] =
    useState(() => {
      try {
        return (
          localStorage.getItem(
            "nivetha_notifications"
          ) !== "false"
        );
      } catch {
        return true;
      }
    });

  const [sound, setSound] = useState(() => {
    try {
      return (
        localStorage.getItem(
          "nivetha_notification_sound"
        ) !== "false"
      );
    } catch {
      return true;
    }
  });

  // ==========================================
  // PASSWORD STATE
  // ==========================================

  const [oldPassword, setOldPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [passwordLoading, setPasswordLoading] =
    useState(false);

  const [passwordError, setPasswordError] =
    useState("");

  const [passwordSuccess, setPasswordSuccess] =
    useState("");

  // ==========================================
  // LOGOUT STATE
  // ==========================================

  const [logoutLoading, setLogoutLoading] =
    useState(false);

  // ==========================================
  // NOTIFICATIONS
  // ==========================================

  const handleNotifications = (value) => {
    setNotifications(value);

    try {
      localStorage.setItem(
        "nivetha_notifications",
        String(value)
      );
    } catch (error) {
      console.error(
        "Unable to save notification preference:",
        error
      );
    }
  };

  // ==========================================
  // NOTIFICATION SOUND
  // ==========================================

  const handleSound = (value) => {
    setSound(value);

    try {
      localStorage.setItem(
        "nivetha_notification_sound",
        String(value)
      );
    } catch (error) {
      console.error(
        "Unable to save sound preference:",
        error
      );
    }
  };

  // ==========================================
  // LANGUAGE
  // ==========================================

  const handleLanguage = (value) => {
    changeLanguage(value);
  };

  // ==========================================
  // CHANGE PASSWORD
  // ==========================================

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    setPasswordError("");
    setPasswordSuccess("");

    const currentPassword =
      oldPassword.trim();

    const nextPassword =
      newPassword.trim();

    const confirmationPassword =
      confirmPassword.trim();

    // ------------------------------------------
    // VALIDATION
    // ------------------------------------------

    if (
      !currentPassword ||
      !nextPassword ||
      !confirmationPassword
    ) {
      setPasswordError(
        "Please fill all password fields."
      );
      return;
    }

    if (nextPassword.length < 6) {
      setPasswordError(
        "New password must contain at least 6 characters."
      );
      return;
    }

    if (nextPassword === currentPassword) {
      setPasswordError(
        "New password must be different from the current password."
      );
      return;
    }

    if (
      nextPassword !==
      confirmationPassword
    ) {
      setPasswordError(
        "New password and confirmation do not match."
      );
      return;
    }

    try {
      setPasswordLoading(true);

      /*
      --------------------------------------------
      CHANGE PASSWORD
      --------------------------------------------

      Settings
          ↓
      authService.changePassword()
          ↓
      PUT /api/auth/change-password
          ↓
      Anna Backend : 5001
          ↓
      MongoDB
      --------------------------------------------
      */

      await authService.changePassword(
        currentPassword,
        nextPassword
      );

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setPasswordSuccess(
        "Password changed successfully."
      );
    } catch (error) {
      console.error(
        "CHANGE PASSWORD ERROR:",
        error?.response?.data || error
      );

      setPasswordError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to change password."
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = async () => {
    if (logoutLoading) {
      return;
    }

    try {
      setLogoutLoading(true);

      /*
      --------------------------------------------
      AUTH SERVICE LOGOUT
      --------------------------------------------

      Direct-access version:
      - No JWT required
      - Clears stored owner user
      - Calls backend logout endpoint
      --------------------------------------------
      */

      try {
        await authService.logout();
      } catch (serviceError) {
        /*
         * Even if backend logout fails,
         * continue clearing frontend session.
         */
        console.error(
          "AUTH SERVICE LOGOUT ERROR:",
          serviceError?.response?.data ||
            serviceError
        );
      }

      /*
      --------------------------------------------
      AUTH CONTEXT LOGOUT
      --------------------------------------------
      */

      try {
        await logout();
      } catch (contextError) {
        console.error(
          "AUTH CONTEXT LOGOUT ERROR:",
          contextError
        );
      }

      /*
      --------------------------------------------
      LOGIN PAGE
      --------------------------------------------
      */

      navigate("/login", {
        replace: true,
      });
    } finally {
      setLogoutLoading(false);
    }
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="settings-page">

      {/* ======================================
          PAGE HEADER
      ====================================== */}

      <div className="settings-page-header">
        <div>
          <span className="settings-eyebrow">
            OWNER CONTROL
          </span>

          <h1>Settings</h1>

          <p>
            Manage your app preferences and
            account security.
          </p>
        </div>
      </div>

      <div className="settings-layout">

        {/* ====================================
            LANGUAGE
        ==================================== */}

        <section className="settings-card">

          <div className="settings-card-header">
            <div
              className="settings-icon"
              aria-hidden="true"
            >
              🌐
            </div>

            <div>
              <h2>Language</h2>

              <p>
                Choose your preferred application
                language.
              </p>
            </div>
          </div>

          <div className="language-options">

            {/* TAMIL */}

            <button
              type="button"
              className={`language-option ${
                language === "ta"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                handleLanguage("ta")
              }
              aria-pressed={
                language === "ta"
              }
            >
              <span>தமிழ்</span>

              <small>Tamil</small>

              {language === "ta" && (
                <strong aria-hidden="true">
                  ✓
                </strong>
              )}
            </button>

            {/* ENGLISH */}

            <button
              type="button"
              className={`language-option ${
                language === "en"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                handleLanguage("en")
              }
              aria-pressed={
                language === "en"
              }
            >
              <span>English</span>

              <small>English</small>

              {language === "en" && (
                <strong aria-hidden="true">
                  ✓
                </strong>
              )}
            </button>

          </div>

          <button
            type="button"
            className="settings-secondary-button"
            onClick={toggleLanguage}
          >
            Switch Language
          </button>

        </section>

        {/* ====================================
            NOTIFICATIONS
        ==================================== */}

        <section className="settings-card">

          <div className="settings-card-header">
            <div
              className="settings-icon"
              aria-hidden="true"
            >
              🔔
            </div>

            <div>
              <h2>Notifications</h2>

              <p>
                Control notifications shown by
                the owner app.
              </p>
            </div>
          </div>

          {/* BOOKING NOTIFICATIONS */}

          <div className="settings-toggle-row">

            <div>
              <strong>
                Booking Notifications
              </strong>

              <span>
                Receive updates when customers
                create bookings.
              </span>
            </div>

            <button
              type="button"
              className={`settings-toggle ${
                notifications
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                handleNotifications(
                  !notifications
                )
              }
              aria-label="Toggle booking notifications"
              aria-pressed={notifications}
            >
              <span />
            </button>

          </div>

          {/* NOTIFICATION SOUND */}

          <div className="settings-toggle-row">

            <div>
              <strong>
                Notification Sound
              </strong>

              <span>
                Play sound for new app
                notifications.
              </span>
            </div>

            <button
              type="button"
              className={`settings-toggle ${
                sound ? "active" : ""
              }`}
              onClick={() =>
                handleSound(!sound)
              }
              aria-label="Toggle notification sound"
              aria-pressed={sound}
            >
              <span />
            </button>

          </div>

        </section>

        {/* ====================================
            CHANGE PASSWORD
        ==================================== */}

        <section className="settings-card settings-password-card">

          <div className="settings-card-header">

            <div
              className="settings-icon"
              aria-hidden="true"
            >
              🔐
            </div>

            <div>
              <h2>Change Password</h2>

              <p>
                Update your owner account
                password.
              </p>
            </div>

          </div>

          {/* ERROR */}

          {passwordError && (
            <div
              className="settings-alert settings-alert-error"
              role="alert"
            >
              {passwordError}
            </div>
          )}

          {/* SUCCESS */}

          {passwordSuccess && (
            <div
              className="settings-alert settings-alert-success"
              role="status"
            >
              {passwordSuccess}
            </div>
          )}

          <form
            className="settings-password-form"
            onSubmit={handlePasswordSubmit}
          >

            {/* CURRENT PASSWORD */}

            <div className="settings-field">

              <label htmlFor="oldPassword">
                Current Password
              </label>

              <input
                id="oldPassword"
                type="password"
                value={oldPassword}
                onChange={(event) => {
                  setOldPassword(
                    event.target.value
                  );

                  setPasswordError("");
                  setPasswordSuccess("");
                }}
                placeholder="Enter current password"
                autoComplete="current-password"
                required
              />

            </div>

            {/* NEW PASSWORD */}

            <div className="settings-field">

              <label htmlFor="newPassword">
                New Password
              </label>

              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(event) => {
                  setNewPassword(
                    event.target.value
                  );

                  setPasswordError("");
                  setPasswordSuccess("");
                }}
                placeholder="Enter new password"
                autoComplete="new-password"
                minLength={6}
                required
              />

            </div>

            {/* CONFIRM PASSWORD */}

            <div className="settings-field">

              <label htmlFor="confirmPassword">
                Confirm Password
              </label>

              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(
                    event.target.value
                  );

                  setPasswordError("");
                  setPasswordSuccess("");
                }}
                placeholder="Confirm new password"
                autoComplete="new-password"
                minLength={6}
                required
              />

            </div>

            {/* UPDATE BUTTON */}

            <button
              type="submit"
              className="settings-primary-button"
              disabled={passwordLoading}
            >
              {passwordLoading
                ? "Updating..."
                : "Update Password"}
            </button>

          </form>

        </section>

        {/* ====================================
            ACCOUNT SESSION
        ==================================== */}

        <section className="settings-card settings-danger-card">

          <div className="settings-card-header">

            <div
              className="settings-icon settings-danger-icon"
              aria-hidden="true"
            >
              🚪
            </div>

            <div>
              <h2>Account Session</h2>

              <p>
                Sign out from the current owner
                account.
              </p>
            </div>

          </div>

          <button
            type="button"
            className="settings-logout-button"
            onClick={handleLogout}
            disabled={logoutLoading}
          >
            {logoutLoading
              ? "Signing out..."
              : "Sign Out"}
          </button>

        </section>

      </div>
    </div>
  );
};

export default Settings;