// ANNA-APP/frontend/src/pages/Login.jsx

import React, { useState } from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";

import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { login } = useAuth();

  const [formData, setFormData] = useState({
    phone: "",
    password: "",
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const from =
    location.state?.from?.pathname ||
    "/dashboard";

  /* =====================================================
     INPUT CHANGE
  ===================================================== */

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    if (name === "phone") {
      const digitsOnly = value
        .replace(/\D/g, "")
        .slice(0, 10);

      setFormData((current) => ({
        ...current,
        phone: digitsOnly,
      }));
    } else {
      setFormData((current) => ({
        ...current,
        [name]: value,
      }));
    }

    if (error) {
      setError("");
    }
  };

  /* =====================================================
     LOGIN
  ===================================================== */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    const phone = formData.phone
      .replace(/\D/g, "")
      .slice(0, 10);

    const password =
      formData.password;

    /* -----------------------------------------------
       VALIDATION
    ----------------------------------------------- */

    if (!phone) {
      setError(
        "Phone number is required."
      );
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      setError(
        "Please enter a valid 10-digit phone number."
      );
      return;
    }

    if (!password) {
      setError(
        "Password is required."
      );
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    /* -----------------------------------------------
       API LOGIN
    ----------------------------------------------- */

    setLoading(true);
    setError("");

    try {
      await login({
        phone,
        password,
      });

      navigate(from, {
        replace: true,
      });
    } catch (err) {
      console.error(
        "LOGIN PAGE ERROR:",
        err
      );

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Login failed. Please check your phone number and password.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="login-page">

      <div className="login-decoration decoration-one"></div>

      <div className="login-decoration decoration-two"></div>

      <div className="login-decoration decoration-three"></div>

      <div className="login-container">

        {/* ===========================================
            BRAND
        =========================================== */}

        <div className="login-brand">

          <div className="brand-logo">
            <span>நி</span>
          </div>

          <div className="brand-text">

            <h1>
              NIVETHA
            </h1>

            <p>
              CATERING SERVICE
            </p>

          </div>

        </div>

        {/* ===========================================
            LOGIN CARD
        =========================================== */}

        <div className="login-card">

          <div className="login-header">

            <div className="login-icon">
              🔐
            </div>

            <h2>
              Welcome Back
            </h2>

            <p>
              Anna Owner App-க்கு
              Login செய்யுங்கள்
            </p>

          </div>

          {/* =========================================
              ERROR
          ========================================= */}

          {error && (
            <div className="login-alert login-alert-error">

              <span className="alert-icon">
                ⚠️
              </span>

              <span>
                {error}
              </span>

            </div>
          )}

          {/* =========================================
              FORM
          ========================================= */}

          <form
            onSubmit={handleSubmit}
            noValidate
          >

            {/* =======================================
                PHONE
            ======================================= */}

            <div className="form-group">

              <label htmlFor="phone">
                Phone Number
              </label>

              <div className="input-wrapper">

                <span className="input-icon">
                  📱
                </span>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter 10-digit phone number"
                  autoComplete="tel"
                  maxLength={10}
                  disabled={loading}
                />

              </div>

            </div>

            {/* =======================================
                PASSWORD
            ======================================= */}

            <div className="form-group">

              <label htmlFor="password">
                Password
              </label>

              <div className="input-wrapper">

                <span className="input-icon">
                  🔑
                </span>

                <input
                  id="password"
                  name="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  disabled={loading}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (current) =>
                        !current
                    )
                  }
                  disabled={loading}
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword
                    ? "🙈"
                    : "👁️"}
                </button>

              </div>

            </div>

            {/* =======================================
                LOGIN BUTTON
            ======================================= */}

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >

              {loading ? (
                <>
                  <span className="login-spinner"></span>

                  <span>
                    Logging in...
                  </span>
                </>
              ) : (
                <>
                  <span>
                    Login
                  </span>

                  <span className="button-arrow">
                    →
                  </span>
                </>
              )}

            </button>

          </form>

          {/* =========================================
              SECURITY
          ========================================= */}

          <div className="login-security">

            <span>
              🔒
            </span>

            <span>
              Secure Owner Access
            </span>

          </div>

        </div>

        {/* ===========================================
            FOOTER
        =========================================== */}

        <div className="login-footer">

          <p>
            © 2026 Nivetha Catering Service
          </p>

          <span>
            Anna Owner App
          </span>

        </div>

      </div>

    </div>
  );
};

export default Login;