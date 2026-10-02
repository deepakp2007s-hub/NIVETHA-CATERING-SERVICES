import React from "react";
import { Link, NavLink } from "react-router-dom";
import "./Navbar.css";

const Navbar = ({ onMenuClick }) => {
  const navItems = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: "⌂",
    },
    {
      path: "/bookings",
      label: "Bookings",
      icon: "📋",
    },
    {
      path: "/food-menu",
      label: "Food Menu",
      icon: "🍛",
    },
    {
      path: "/notifications",
      label: "Notifications",
      icon: "🔔",
    },
  ];

  return (
    <header className="anna-navbar">
      <div className="anna-navbar-inner">

        {/* THREE BAR */}
        <button
          type="button"
          className="anna-menu-button"
          onClick={onMenuClick}
          aria-label="Open sidebar"
          title="Open menu"
        >
          ☰
        </button>

        {/* BRAND */}
        <Link to="/dashboard" className="anna-brand">
          <div className="anna-brand-logo">N</div>

          <div className="anna-brand-text">
            <h1>Nivetha</h1>
            <span>Catering Service</span>
          </div>
        </Link>

        {/* NAVIGATION */}
        <nav className="anna-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `anna-nav-link ${isActive ? "active" : ""}`
              }
            >
              <span className="anna-nav-icon">
                {item.icon}
              </span>

              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* PROFILE */}
        <div className="anna-navbar-actions">
          <Link
            to="/profile"
            className="anna-profile-button"
            aria-label="Owner profile"
          >
            <span className="anna-profile-avatar">N</span>
            <span className="anna-profile-name">
              Nivetha
            </span>
          </Link>
        </div>

      </div>
    </header>
  );
};

export default Navbar;