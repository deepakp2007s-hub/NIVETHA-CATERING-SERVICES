// ANNA-APP/frontend/src/App.jsx

import React, { useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { useAuth } from "./context/AuthContext.jsx";

import Sidebar from "./components/Sidebar.jsx";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";

import Splash from "./pages/Splash.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Bookings from "./pages/Bookings.jsx";
import BookingDetails from "./pages/BookingDetails.jsx";
import Customers from "./pages/Customers.jsx";
import CustomerDetails from "./pages/CustomerDetails.jsx";
import FoodMenu from "./pages/FoodMenu.jsx";
import AddFood from "./pages/AddFood.jsx";
import EditFood from "./pages/EditFood.jsx";
import Notifications from "./pages/Notifications.jsx";
import Reports from "./pages/Reports.jsx";
import Profile from "./pages/Profile.jsx";
import Settings from "./pages/Settings.jsx";
import Catering from "./pages/Catering.jsx";

import "./App.css";

/* =========================================================
   PROTECTED ROUTE
========================================================= */

const ProtectedRoute = ({ children }) => {
  const {
    isAuthenticated,
    loading,
  } = useAuth();

  if (loading) {
    return (
      <div className="app-loading-screen">
        <div className="app-loading-spinner" />
        <p>Loading NIVETHA...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return children;
};

/* =========================================================
   OWNER LAYOUT
========================================================= */

const OwnerLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] =
    useState(false);

  const openSidebar = () => {
    setIsSidebarOpen(true);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="app-layout">

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
      />

      <div className="app-main">

        <Header
          onMenuClick={openSidebar}
        />

        <main className="app-content">
          {children}
        </main>

        <Footer />

      </div>

    </div>
  );
};

/* =========================================================
   PROTECTED OWNER PAGE
========================================================= */

const OwnerPage = ({ children }) => {
  return (
    <ProtectedRoute>
      <OwnerLayout>
        {children}
      </OwnerLayout>
    </ProtectedRoute>
  );
};

/* =========================================================
   APP
========================================================= */

const App = () => {
  return (
    <BrowserRouter>

      <Routes>

        {/* =================================================
            ROOT
        ================================================= */}

        <Route
          path="/"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

        {/* =================================================
            SPLASH
        ================================================= */}

        <Route
          path="/splash"
          element={<Splash />}
        />

        {/* =================================================
            LOGIN
        ================================================= */}

        <Route
          path="/login"
          element={<Login />}
        />

        {/* =================================================
            DASHBOARD
        ================================================= */}

        <Route
          path="/dashboard"
          element={
            <OwnerPage>
              <Dashboard />
            </OwnerPage>
          }
        />

        {/* =================================================
            BOOKINGS
        ================================================= */}

        <Route
          path="/bookings"
          element={
            <OwnerPage>
              <Bookings />
            </OwnerPage>
          }
        />

        <Route
          path="/bookings/:id"
          element={
            <OwnerPage>
              <BookingDetails />
            </OwnerPage>
          }
        />

        {/* =================================================
            CUSTOMERS
        ================================================= */}

        <Route
          path="/customers"
          element={
            <OwnerPage>
              <Customers />
            </OwnerPage>
          }
        />

        <Route
          path="/customers/:id"
          element={
            <OwnerPage>
              <CustomerDetails />
            </OwnerPage>
          }
        />

        {/* =================================================
            FOOD MENU
        ================================================= */}

        <Route
          path="/food-menu"
          element={
            <OwnerPage>
              <FoodMenu />
            </OwnerPage>
          }
        />

        <Route
          path="/food-menu/add"
          element={
            <OwnerPage>
              <AddFood />
            </OwnerPage>
          }
        />

        <Route
          path="/food-menu/edit/:id"
          element={
            <OwnerPage>
              <EditFood />
            </OwnerPage>
          }
        />

        {/* =================================================
            CATERING
        ================================================= */}

        <Route
          path="/catering"
          element={
            <OwnerPage>
              <Catering />
            </OwnerPage>
          }
        />

        {/* =================================================
            NOTIFICATIONS
        ================================================= */}

        <Route
          path="/notifications"
          element={
            <OwnerPage>
              <Notifications />
            </OwnerPage>
          }
        />

        {/* =================================================
            REPORTS
        ================================================= */}

        <Route
          path="/reports"
          element={
            <OwnerPage>
              <Reports />
            </OwnerPage>
          }
        />

        {/* =================================================
            PROFILE
        ================================================= */}

        <Route
          path="/profile"
          element={
            <OwnerPage>
              <Profile />
            </OwnerPage>
          }
        />

        {/* =================================================
            SETTINGS
        ================================================= */}

        <Route
          path="/settings"
          element={
            <OwnerPage>
              <Settings />
            </OwnerPage>
          }
        />

        {/* =================================================
            INVALID ROUTE
        ================================================= */}

        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>
  );
};

export default App;