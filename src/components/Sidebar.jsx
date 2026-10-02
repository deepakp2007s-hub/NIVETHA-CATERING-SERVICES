import React from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = ({ isOpen = true, onClose }) => {
  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: "⌂" },
    { path: "/bookings", label: "Bookings", icon: "▣" },
    { path: "/customers", label: "Customers", icon: "♙" },
    { path: "/food-menu", label: "Food Menu", icon: "🍛" },
    { path: "/catering", label: "Catering", icon: "♨" },
    { path: "/notifications", label: "Notifications", icon: "♢" },
    { path: "/reports", label: "Reports", icon: "▥" },
  ];

  const accountItems = [
    { path: "/profile", label: "Profile", icon: "●" },
    { path: "/settings", label: "Settings", icon: "⚙" },
  ];

  const handleNavigation = () => {
    onClose?.();
  };

  const renderMenu = (items) =>
    items.map((item) => (
      <NavLink
        key={item.path}
        to={item.path}
        onClick={handleNavigation}
        className={({ isActive }) =>
          `anna-sidebar-link ${isActive ? "active" : ""}`
        }
      >
        <span className="anna-sidebar-link-icon" aria-hidden="true">
          {item.icon}
        </span>

        <span className="anna-sidebar-link-label">
          {item.label}
        </span>
      </NavLink>
    ));

  return (
    <>
      {isOpen && onClose && (
        <button
          type="button"
          className="anna-sidebar-overlay"
          onClick={onClose}
          aria-label="Close navigation menu"
        />
      )}

      <aside
        className={`anna-sidebar ${
          isOpen ? "anna-sidebar-open" : ""
        }`}
        aria-label="Owner navigation"
      >
        {/* BRAND */}
        <div className="anna-sidebar-brand">
          <NavLink
            to="/dashboard"
            className="anna-sidebar-brand-link"
            onClick={handleNavigation}
          >
            <div className="anna-sidebar-logo">N</div>

            <div className="anna-sidebar-brand-text">
              <strong>Nivetha</strong>
              <span>Catering Service</span>
            </div>
          </NavLink>
        </div>

        {/* MENU */}
        <div className="anna-sidebar-scroll">
          <section className="anna-sidebar-section">
            <span className="anna-sidebar-section-title">
              MAIN MENU
            </span>

            <nav className="anna-sidebar-nav">
              {renderMenu(menuItems)}
            </nav>
          </section>

          <section className="anna-sidebar-section anna-sidebar-account">
            <span className="anna-sidebar-section-title">
              ACCOUNT
            </span>

            <nav className="anna-sidebar-nav">
              {renderMenu(accountItems)}
            </nav>
          </section>
        </div>

        {/* OWNER */}
        <div className="anna-sidebar-owner">
          <div className="anna-sidebar-owner-avatar">
            N
          </div>

          <div className="anna-sidebar-owner-info">
            <strong>NIVETHA</strong>
            <span>Owner</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;