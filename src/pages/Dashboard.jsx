// ANNA-APP/frontend/src/pages/Dashboard.jsx

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link } from "react-router-dom";

import { useApp } from "../context/AppContext";
import bookingService from "../services/bookingService";
import foodService from "../services/foodService";
import customerService from "../services/customerService";

import "./Dashboard.css";

/* =====================================================
   NIVETHA ANNA APP
   DASHBOARD / MAIN PAGE
===================================================== */

const Dashboard = () => {
  const { language } = useApp();

  /* ===================================================
     DASHBOARD DATA
  =================================================== */

  const [bookings, setBookings] = useState([]);
  const [foods, setFoods] = useState([]);
  const [customers, setCustomers] = useState([]);

  /* ===================================================
     UI STATE
  =================================================== */

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [partialErrors, setPartialErrors] = useState([]);

  const isTamil = language === "ta";

  /* =====================================================
     DASHBOARD TEXT
  ===================================================== */

  const text = useMemo(
    () =>
      isTamil
        ? {
            title: "டாஷ்போர்டு",
            subtitle:
              "நிவேதா கேட்டரிங் சர்வீஸ் நிர்வாக மையம்",

            bookings: "மொத்த முன்பதிவுகள்",
            customers: "வாடிக்கையாளர்கள்",
            foods: "உணவு வகைகள்",
            pending: "நிலுவை முன்பதிவுகள்",

            today: "இன்றைய நிகழ்ச்சிகள்",
            upcoming: "வரவிருக்கும் நிகழ்ச்சிகள்",
            availableFoods: "கிடைக்கும் உணவு வகைகள்",

            recentBookings: "சமீபத்திய முன்பதிவுகள்",
            viewAll: "அனைத்தையும் பார்க்க",

            noBookings: "முன்பதிவுகள் இல்லை",
            noFoods: "உணவு வகைகள் இல்லை",

            loading: "தரவு ஏற்றப்படுகிறது...",
            failed: "டாஷ்போர்டு தரவை ஏற்ற முடியவில்லை.",
            retry: "மீண்டும் முயற்சி",

            partial:
              "சில தரவுகளை ஏற்ற முடியவில்லை. கீழே கிடைக்கும் தரவு காட்டப்படுகிறது.",

            customer: "வாடிக்கையாளர்",
            function: "நிகழ்ச்சி",
            date: "தேதி",
            persons: "நபர்கள்",
            status: "நிலை",

            pendingStatus: "நிலுவை",
            acceptedStatus: "ஏற்றுக்கொள்ளப்பட்டது",
            confirmedStatus: "உறுதி",
            rejectedStatus: "நிராகரிக்கப்பட்டது",
            completedStatus: "முடிந்தது",
            cancelledStatus: "ரத்து",

            todayLabel: "இன்று",
            active: "செயலில்",

            meal: "Meal",
            type: "Type",

            quickActions: "விரைவு செயல்கள்",
            newFood: "புதிய உணவு சேர்க்க",
            viewBookings: "முன்பதிவுகளைப் பார்க்க",
            customersAction: "வாடிக்கையாளர்களைப் பார்க்க",
            menuAction: "உணவு மெனுவைப் பார்க்க",

            bookingsLoad: "முன்பதிவுகள்",
            foodsLoad: "உணவு மெனு",
            customersLoad: "வாடிக்கையாளர்கள்",
          }
        : {
            title: "Dashboard",
            subtitle:
              "Nivetha Catering Service Management Center",

            bookings: "Total Bookings",
            customers: "Customers",
            foods: "Food Items",
            pending: "Pending Bookings",

            today: "Today's Events",
            upcoming: "Upcoming Events",
            availableFoods: "Available Foods",

            recentBookings: "Recent Bookings",
            viewAll: "View All",

            noBookings: "No bookings found",
            noFoods: "No food items found",

            loading: "Loading dashboard data...",
            failed: "Unable to load dashboard data.",
            retry: "Try Again",

            partial:
              "Some dashboard data could not be loaded. Available data is shown below.",

            customer: "Customer",
            function: "Function",
            date: "Date",
            persons: "Persons",
            status: "Status",

            pendingStatus: "Pending",
            acceptedStatus: "Accepted",
            confirmedStatus: "Confirmed",
            rejectedStatus: "Rejected",
            completedStatus: "Completed",
            cancelledStatus: "Cancelled",

            todayLabel: "Today",
            active: "Active",

            meal: "Meal",
            type: "Type",

            quickActions: "Quick Actions",
            newFood: "Add New Food",
            viewBookings: "View Bookings",
            customersAction: "View Customers",
            menuAction: "View Food Menu",

            bookingsLoad: "Bookings",
            foodsLoad: "Food Menu",
            customersLoad: "Customers",
          },
    [isTamil]
  );

  /* =====================================================
     NORMALIZE API LIST
  ===================================================== */

  const normalizeList = useCallback((response, key) => {
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response?.data)) {
      return response.data;
    }

    if (Array.isArray(response?.data?.data)) {
      return response.data.data;
    }

    if (key && Array.isArray(response?.[key])) {
      return response[key];
    }

    return [];
  }, []);

  /* =====================================================
     API ERROR MESSAGE
  ===================================================== */

  const getErrorMessage = useCallback((result, fallback) => {
    return (
      result?.reason?.response?.data?.message ||
      result?.reason?.message ||
      fallback
    );
  }, []);

  /* =====================================================
     LOAD DASHBOARD
  ===================================================== */

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");
    setPartialErrors([]);

    try {
      const results = await Promise.allSettled([
        bookingService.getBookings(),
        foodService.getFoods(),
        customerService.getCustomers(),
      ]);

      const [
        bookingResponse,
        foodResponse,
        customerResponse,
      ] = results;

      const failedRequests = [];

      /* BOOKINGS */

      if (bookingResponse.status === "fulfilled") {
        setBookings(
          normalizeList(
            bookingResponse.value,
            "bookings"
          )
        );
      } else {
        failedRequests.push(
          `${text.bookingsLoad}: ${getErrorMessage(
            bookingResponse,
            text.failed
          )}`
        );
      }

      /* FOODS */

      if (foodResponse.status === "fulfilled") {
        setFoods(
          normalizeList(
            foodResponse.value,
            "foods"
          )
        );
      } else {
        failedRequests.push(
          `${text.foodsLoad}: ${getErrorMessage(
            foodResponse,
            text.failed
          )}`
        );
      }

      /* CUSTOMERS */

      if (customerResponse.status === "fulfilled") {
        setCustomers(
          normalizeList(
            customerResponse.value,
            "customers"
          )
        );
      } else {
        failedRequests.push(
          `${text.customersLoad}: ${getErrorMessage(
            customerResponse,
            text.failed
          )}`
        );
      }

      /* ERROR HANDLING */

      if (failedRequests.length === 3) {
        setError(text.failed);
      } else if (failedRequests.length > 0) {
        setPartialErrors(failedRequests);
      }
    } catch (loadError) {
      console.error("Dashboard Load Error:", loadError);

      setError(
        loadError?.message || text.failed
      );
    } finally {
      setLoading(false);
    }
  }, [
    getErrorMessage,
    normalizeList,
    text.bookingsLoad,
    text.customersLoad,
    text.failed,
    text.foodsLoad,
  ]);

  /* =====================================================
     LOAD DASHBOARD WHEN PAGE OPENS

     IMPORTANT:
     No refreshKey / manual refresh architecture.
  ===================================================== */

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  /* =====================================================
     BOOKING DATE HELPERS
  ===================================================== */

  const getDateValue = useCallback(
    (booking) =>
      booking?.eventDate ||
      booking?.date ||
      booking?.bookingDate ||
      "",
    []
  );

  const getBookingDate = useCallback(
    (booking) => {
      const value = getDateValue(booking);

      if (!value) {
        return "-";
      }

      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return String(value);
      }

      return date.toLocaleDateString(
        isTamil ? "ta-IN" : "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );
    },
    [getDateValue, isTamil]
  );

  /* =====================================================
     CHECK TODAY'S BOOKING
  ===================================================== */

  const isToday = useCallback(
    (booking) => {
      const value = getDateValue(booking);

      if (!value) {
        return false;
      }

      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return false;
      }

      const today = new Date();

      return (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
      );
    },
    [getDateValue]
  );

  /* =====================================================
     CHECK UPCOMING BOOKING
  ===================================================== */

  const isFuture = useCallback(
    (booking) => {
      const value = getDateValue(booking);

      if (!value) {
        return false;
      }

      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return false;
      }

      const today = new Date();

      today.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);

      return date >= today;
    },
    [getDateValue]
  );

  /* =====================================================
     BOOKING STATUS
  ===================================================== */

  const getStatus = useCallback(
    (booking) =>
      String(
        booking?.status || "pending"
      ).toLowerCase(),
    []
  );

  const getStatusLabel = useCallback(
    (status) => {
      const labels = {
        pending: text.pendingStatus,
        accepted: text.acceptedStatus,
        confirmed: text.confirmedStatus,
        rejected: text.rejectedStatus,
        completed: text.completedStatus,
        cancelled: text.cancelledStatus,
      };

      return labels[status] || status;
    },
    [
      text.cancelledStatus,
      text.completedStatus,
      text.confirmedStatus,
      text.pendingStatus,
      text.acceptedStatus,
      text.rejectedStatus,
    ]
  );

  /* =====================================================
     CUSTOMER NAME
  ===================================================== */

  const getCustomerName = useCallback(
    (booking) => {
      const customer = booking?.customer;

      if (typeof customer === "string") {
        return customer;
      }

      return (
        customer?.name ||
        customer?.fullName ||
        booking?.customerName ||
        booking?.name ||
        "—"
      );
    },
    []
  );

  /* =====================================================
     FUNCTION NAME
  ===================================================== */

  const getFunctionName = useCallback(
    (booking) =>
      booking?.eventType ||
      booking?.functionType ||
      booking?.function ||
      booking?.eventName ||
      "—",
    []
  );

  /* =====================================================
     PERSON COUNT
  ===================================================== */

  const getPersons = useCallback(
    (booking) =>
      booking?.numberOfPersons ??
      booking?.persons ??
      booking?.guestCount ??
      0,
    []
  );

  /* =====================================================
     FOOD HELPERS
  ===================================================== */

  const getFoodName = useCallback(
    (food) =>
      food?.name ||
      food?.foodName ||
      "Food Item",
    []
  );

  const getTamilFoodName = useCallback(
    (food) =>
      food?.tamilName ||
      food?.nameTamil ||
      "",
    []
  );

  const getFoodMeal = useCallback(
    (food) =>
      food?.meal ||
      food?.category ||
      "Other",
    []
  );

  const getFoodType = useCallback(
    (food) =>
      food?.type ||
      food?.foodType ||
      "",
    []
  );

  const isFoodAvailable = useCallback(
    (food) =>
      food?.isAvailable !== false &&
      food?.available !== false &&
      food?.status !== "inactive",
    []
  );

  /* =====================================================
     DASHBOARD CALCULATIONS
  ===================================================== */

  const pendingBookings = useMemo(
    () =>
      bookings.filter(
        (booking) =>
          getStatus(booking) === "pending"
      ),
    [bookings, getStatus]
  );

  const todayBookings = useMemo(
    () => bookings.filter(isToday),
    [bookings, isToday]
  );

  const upcomingBookings = useMemo(
    () => bookings.filter(isFuture),
    [bookings, isFuture]
  );

  const availableFoodsCount = useMemo(
    () =>
      foods.filter(isFoodAvailable).length,
    [foods, isFoodAvailable]
  );

  /* =====================================================
     RECENT BOOKINGS
  ===================================================== */

  const recentBookings = useMemo(() => {
    return [...bookings]
      .sort((a, b) => {
        const aDate = new Date(
          a?.createdAt ||
            getDateValue(a) ||
            0
        ).getTime();

        const bDate = new Date(
          b?.createdAt ||
            getDateValue(b) ||
            0
        ).getTime();

        return bDate - aDate;
      })
      .slice(0, 5);
  }, [bookings, getDateValue]);

  /* =====================================================
     STAT CARDS
  ===================================================== */

  const statCards = useMemo(
    () => [
      {
        title: text.bookings,
        value: bookings.length,
        icon: "📋",
        className: "dashboard-stat-bookings",
        link: "/bookings",
      },
      {
        title: text.customers,
        value: customers.length,
        icon: "👥",
        className: "dashboard-stat-customers",
        link: "/customers",
      },
      {
        title: text.foods,
        value: foods.length,
        icon: "🍛",
        className: "dashboard-stat-foods",
        link: "/food-menu",
      },
      {
        title: text.pending,
        value: pendingBookings.length,
        icon: "⏳",
        className: "dashboard-stat-pending",
        link: "/bookings",
      },
    ],
    [
      bookings.length,
      customers.length,
      foods.length,
      pendingBookings.length,
      text.bookings,
      text.customers,
      text.foods,
      text.pending,
    ]
  );

  /* =====================================================
     LOADING SCREEN
  ===================================================== */

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">
          <div className="dashboard-loading-spinner" />

          <p>{text.loading}</p>
        </div>
      </div>
    );
  }

  /* =====================================================
     MAIN DASHBOARD UI
  ===================================================== */

  return (
    <div className="dashboard-page">
      <div className="dashboard-page-container">

        {/* DASHBOARD HEADER */}

        <header className="dashboard-header">
          <div>
            <span className="dashboard-eyebrow">
              NIVETHA CATERING SERVICE
            </span>

            <h1>{text.title}</h1>

            <p>{text.subtitle}</p>
          </div>
        </header>

        {/* COMPLETE API ERROR */}

        {error && (
          <div className="dashboard-error">
            <div>
              <strong>{text.failed}</strong>

              <span>{error}</span>
            </div>

            <button
              type="button"
              onClick={loadDashboard}
            >
              {text.retry}
            </button>
          </div>
        )}

        {/* PARTIAL API ERROR */}

        {partialErrors.length > 0 && !error && (
          <div className="dashboard-warning">
            <div>
              <strong>{text.partial}</strong>

              <ul>
                {partialErrors.map(
                  (message, index) => (
                    <li
                      key={`${message}-${index}`}
                    >
                      {message}
                    </li>
                  )
                )}
              </ul>
            </div>

            <button
              type="button"
              onClick={loadDashboard}
            >
              {text.retry}
            </button>
          </div>
        )}

        {/* STATISTICS */}

        <div className="dashboard-stats-grid">
          {statCards.map((stat) => (
            <Link
              to={stat.link}
              className={`dashboard-stat-card ${stat.className}`}
              key={stat.title}
            >
              <div className="dashboard-stat-icon">
                {stat.icon}
              </div>

              <div className="dashboard-stat-content">
                <span>{stat.title}</span>

                <strong>{stat.value}</strong>
              </div>

              <div className="dashboard-stat-arrow">
                →
              </div>
            </Link>
          ))}
        </div>

        {/* EVENT SUMMARY */}

        <div className="dashboard-event-summary">

          <div className="dashboard-summary-card">
            <div className="dashboard-summary-icon">
              📅
            </div>

            <div>
              <span>{text.today}</span>

              <strong>
                {todayBookings.length}
              </strong>
            </div>
          </div>

          <div className="dashboard-summary-card">
            <div className="dashboard-summary-icon">
              🗓️
            </div>

            <div>
              <span>{text.upcoming}</span>

              <strong>
                {upcomingBookings.length}
              </strong>
            </div>
          </div>

          <div className="dashboard-summary-card">
            <div className="dashboard-summary-icon">
              🍽️
            </div>

            <div>
              <span>{text.availableFoods}</span>

              <strong>
                {availableFoodsCount}
              </strong>
            </div>
          </div>

        </div>

        {/* MAIN DASHBOARD GRID */}

        <div className="dashboard-main-grid">

          {/* RECENT BOOKINGS */}

          <section className="dashboard-panel dashboard-bookings-panel">

            <div className="dashboard-panel-header">
              <div>
                <span className="dashboard-panel-label">
                  BOOKING MANAGEMENT
                </span>

                <h2>
                  {text.recentBookings}
                </h2>
              </div>

              <Link
                to="/bookings"
                className="dashboard-view-all"
              >
                {text.viewAll} →
              </Link>
            </div>

            {recentBookings.length === 0 ? (
              <div className="dashboard-empty">
                <div className="dashboard-empty-icon">
                  📋
                </div>

                <p>{text.noBookings}</p>
              </div>
            ) : (
              <div className="dashboard-table-wrapper">

                <table className="dashboard-table">

                  <thead>
                    <tr>
                      <th>{text.customer}</th>
                      <th>{text.function}</th>
                      <th>{text.date}</th>
                      <th>{text.persons}</th>
                      <th>{text.status}</th>
                    </tr>
                  </thead>

                  <tbody>
                    {recentBookings.map(
                      (booking, index) => {
                        const bookingId =
                          booking?._id ||
                          booking?.id ||
                          index;

                        const status =
                          getStatus(booking);

                        const customerName =
                          getCustomerName(
                            booking
                          );

                        return (
                          <tr
                            key={bookingId}
                          >

                            {/* CUSTOMER */}

                            <td>
                              <Link
                                to={`/bookings/${bookingId}`}
                                className="dashboard-customer-link"
                              >
                                <span className="dashboard-avatar">
                                  {customerName
                                    .charAt(0)
                                    .toUpperCase()}
                                </span>

                                <span>
                                  {customerName}
                                </span>
                              </Link>
                            </td>

                            {/* FUNCTION */}

                            <td>
                              {getFunctionName(
                                booking
                              )}
                            </td>

                            {/* DATE */}

                            <td>
                              <div className="dashboard-date">

                                {isToday(
                                  booking
                                ) && (
                                  <small>
                                    {
                                      text.todayLabel
                                    }
                                  </small>
                                )}

                                {getBookingDate(
                                  booking
                                )}

                              </div>
                            </td>

                            {/* PERSONS */}

                            <td>
                              {getPersons(
                                booking
                              )}
                            </td>

                            {/* STATUS */}

                            <td>
                              <span
                                className={`dashboard-status dashboard-status-${status}`}
                              >
                                <i />

                                {getStatusLabel(
                                  status
                                )}
                              </span>
                            </td>

                          </tr>
                        );
                      }
                    )}
                  </tbody>

                </table>

              </div>
            )}

          </section>

          {/* QUICK ACTIONS */}

          <section className="dashboard-panel dashboard-actions-panel">

            <div className="dashboard-panel-header">
              <div>
                <span className="dashboard-panel-label">
                  MANAGEMENT
                </span>

                <h2>
                  {text.quickActions}
                </h2>
              </div>
            </div>

            <div className="dashboard-actions">

              {/* ADD FOOD */}

              <Link
                to="/food-menu/add"
                className="dashboard-action-card"
              >
                <span className="dashboard-action-icon">
                  🍽️
                </span>

                <span>
                  <strong>
                    {text.newFood}
                  </strong>

                  <small>+</small>
                </span>
              </Link>

              {/* BOOKINGS */}

              <Link
                to="/bookings"
                className="dashboard-action-card"
              >
                <span className="dashboard-action-icon">
                  📋
                </span>

                <span>
                  <strong>
                    {text.viewBookings}
                  </strong>

                  <small>→</small>
                </span>
              </Link>

              {/* CUSTOMERS */}

              <Link
                to="/customers"
                className="dashboard-action-card"
              >
                <span className="dashboard-action-icon">
                  👥
                </span>

                <span>
                  <strong>
                    {text.customersAction}
                  </strong>

                  <small>→</small>
                </span>
              </Link>

              {/* FOOD MENU */}

              <Link
                to="/food-menu"
                className="dashboard-action-card"
              >
                <span className="dashboard-action-icon">
                  📖
                </span>

                <span>
                  <strong>
                    {text.menuAction}
                  </strong>

                  <small>→</small>
                </span>
              </Link>

            </div>

          </section>

        </div>

        {/* FOOD MENU */}

        <section className="dashboard-panel dashboard-food-panel">

          <div className="dashboard-panel-header">

            <div>
              <span className="dashboard-panel-label">
                FOOD MENU
              </span>

              <h2>
                {text.availableFoods}
              </h2>
            </div>

            <Link
              to="/food-menu"
              className="dashboard-view-all"
            >
              {text.viewAll} →
            </Link>

          </div>

          {foods.length === 0 ? (
            <div className="dashboard-empty">

              <div className="dashboard-empty-icon">
                🍛
              </div>

              <p>{text.noFoods}</p>

            </div>
          ) : (
            <div className="dashboard-food-grid">

              {foods
                .filter(isFoodAvailable)
                .slice(0, 6)
                .map((food, index) => {
                  const foodId =
                    food?._id ||
                    food?.id ||
                    index;

                  const foodName =
                    getFoodName(food);

                  const tamilName =
                    getTamilFoodName(food);

                  const meal =
                    getFoodMeal(food);

                  const type =
                    getFoodType(food);

                  return (
                    <Link
                      to={`/food-menu/edit/${foodId}`}
                      className="dashboard-food-card"
                      key={foodId}
                    >

                      {/* FOOD IMAGE */}

                      <div className="dashboard-food-image">

                        {food?.image ? (
                          <img
                            src={food.image}
                            alt={foodName}
                            onError={(event) => {
                              event.currentTarget.style.display =
                                "none";
                            }}
                          />
                        ) : (
                          <span>🍛</span>
                        )}

                      </div>

                      {/* FOOD INFORMATION */}

                      <div className="dashboard-food-info">

                        <div className="dashboard-food-badges">

                          <span className="dashboard-food-meal">
                            {meal}
                          </span>

                          {type && (
                            <span
                              className={`dashboard-food-type ${
                                String(type).toLowerCase() ===
                                "veg"
                                  ? "veg"
                                  : "non-veg"
                              }`}
                            >
                              {type}
                            </span>
                          )}

                        </div>

                        <h3>{foodName}</h3>

                        {tamilName && (
                          <p>{tamilName}</p>
                        )}

                        <span className="dashboard-food-status is-active">
                          {text.active}
                        </span>

                      </div>

                    </Link>
                  );
                })}

            </div>
          )}

        </section>

      </div>
    </div>
  );
};

export default Dashboard;