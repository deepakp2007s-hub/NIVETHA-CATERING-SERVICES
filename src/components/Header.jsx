import React from "react";
import { useLocation } from "react-router-dom";
import "./Header.css";

const pageTitles = {
  "/dashboard": {
    title: "Dashboard",
    subtitle: "Welcome back, Anna",
  },
  "/bookings": {
    title: "Bookings",
    subtitle: "Manage customer catering bookings",
  },
  "/food-menu": {
    title: "Food Menu",
    subtitle: "Manage your catering food items",
  },
  "/catering": {
    title: "Catering",
    subtitle: "Manage catering services",
  },
  "/notifications": {
    title: "Notifications",
    subtitle: "Stay updated with your catering business",
  },
  "/customers": {
    title: "Customers",
    subtitle: "Manage customer information",
  },
  "/reports": {
    title: "Reports",
    subtitle: "View catering business reports",
  },
  "/profile": {
    title: "Profile",
    subtitle: "Manage your owner profile",
  },
  "/settings": {
    title: "Settings",
    subtitle: "Manage application settings",
  },
};

const Header = ({
  title,
  subtitle,
  showDate = true,
  children,
  onMenuClick,
}) => {
  const location = useLocation();

  const currentPage = pageTitles[location.pathname];

  const displayTitle =
    title ||
    currentPage?.title ||
    "Nivetha Catering Service";

  const displaySubtitle =
    subtitle ||
    currentPage?.subtitle ||
    "Owner Management Panel";

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <header className="anna-header">
      <div className="anna-header-main">

        {/* MOBILE MENU BUTTON */}
        <button
          type="button"
          className="anna-menu-button"
          onClick={onMenuClick}
          aria-label="Open sidebar"
          title="Open menu"
        >
          ☰
        </button>

        {/* PAGE TITLE */}
        <div className="anna-header-title">
          <h1>{displayTitle}</h1>
          <p>{displaySubtitle}</p>
        </div>

        {/* RIGHT SIDE */}
        <div className="anna-header-right">
          {showDate && (
            <div className="anna-header-date">
              <span className="anna-header-date-icon">
                📅
              </span>

              <div>
                <small>Today</small>
                <strong>{today}</strong>
              </div>
            </div>
          )}

          {children}
        </div>

      </div>
    </header>
  );
};

export default Header;