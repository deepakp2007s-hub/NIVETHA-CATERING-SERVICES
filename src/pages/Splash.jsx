import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import "./Splash.css";

/*
=====================================================
NIVETHA CATERING SERVICE
ANNA OWNER APP — SPLASH PAGE WORKFLOW
=====================================================

APP START
   ↓
Splash.jsx
   ↓
Show NIVETHA branding
   ↓
Wait 2.5 seconds
   ↓
Navigate to /login
   ↓
Login.jsx
   ↓
Owner authentication
   ↓
Successful login
   ↓
/dashboard
   ↓
Anna Owner Dashboard
=====================================================
*/

const Splash = () => {
  const navigate = useNavigate();

  /*
  -----------------------------------------------------
  SPLASH NAVIGATION
  -----------------------------------------------------
  App opens
      ↓
  Splash screen displayed
      ↓
  2.5 seconds
      ↓
  Login page
  -----------------------------------------------------
  */

  useEffect(() => {
    const timer = window.setTimeout(() => {
      navigate("/login", {
        replace: true,
      });
    }, 2500);

    return () => {
      window.clearTimeout(timer);
    };
  }, [navigate]);

  return (
    <main
      className="splash-page"
      aria-label="Nivetha Catering Service Anna Owner App"
    >
      <div className="splash-background">
        {/* Decorative background elements */}
        <div
          className="splash-circle splash-circle-one"
          aria-hidden="true"
        />

        <div
          className="splash-circle splash-circle-two"
          aria-hidden="true"
        />

        <div
          className="splash-circle splash-circle-three"
          aria-hidden="true"
        />

        {/* Main splash content */}
        <section
          className="splash-card"
          aria-labelledby="splash-title"
        >
          {/* Logo */}
          <div
            className="splash-logo"
            aria-label="Nivetha Catering Service logo"
          >
            <span className="splash-logo-icon">
              N
            </span>
          </div>

          {/* Tamil greeting */}
          <p className="splash-welcome">
            வணக்கம்
          </p>

          {/* Brand name */}
          <h1
            id="splash-title"
            className="splash-title"
          >
            நிவேதா
          </h1>

          {/* Business name */}
          <h2 className="splash-subtitle">
            NIVETHA CATERING SERVICE
          </h2>

          {/* Decorative divider */}
          <div
            className="splash-divider"
            aria-hidden="true"
          >
            <span />
            <i>✦</i>
            <span />
          </div>

          {/* Brand description */}
          <p className="splash-description">
            Delicious Food • Beautiful Moments
          </p>

          {/* Loading animation */}
          <div
            className="splash-loader"
            aria-label="Loading"
            role="status"
          >
            <span />
            <span />
            <span />
          </div>

          <p className="splash-loading">
            Loading...
          </p>
        </section>

        {/* App identification */}
        <footer className="splash-footer">
          <span>
            ANNA OWNER APP
          </span>
        </footer>
      </div>
    </main>
  );
};

export default Splash;