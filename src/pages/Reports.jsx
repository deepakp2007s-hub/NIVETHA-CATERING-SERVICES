import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import reportService from "../services/reportService";
import "./Reports.css";

const normalizeResponse = (response) => {
  if (!response) {
    return {};
  }

  if (
    response.data &&
    typeof response.data === "object"
  ) {
    return response.data;
  }

  return response;
};

const getReportObject = (response) => {
  const normalized =
    normalizeResponse(response);

  return (
    normalized.report ||
    normalized.data ||
    normalized
  );
};

const getArray = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  return [];
};

const getStatusLabel = (status) => {
  if (!status) {
    return "Unknown";
  }

  return String(status)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
};

const getStatusClass = (status) => {
  const value = String(
    status || ""
  ).toLowerCase();

  if (value === "pending") {
    return "pending";
  }

  if (
    value === "accepted" ||
    value === "confirmed"
  ) {
    return "accepted";
  }

  if (value === "completed") {
    return "completed";
  }

  if (value === "cancelled") {
    return "cancelled";
  }

  if (value === "rejected") {
    return "rejected";
  }

  return "default";
};

const getCustomerName = (booking) => {
  return (
    booking?.customer?.name ||
    booking?.customerName ||
    "Unknown Customer"
  );
};

const getCustomerPhone = (booking) => {
  return (
    booking?.customer?.phone ||
    booking?.phone ||
    "-"
  );
};

const getFoodName = (food) => {
  return (
    food?.food?.name ||
    food?.name ||
    "Food Item"
  );
};

const formatDate = (date) => {
  if (!date) {
    return "-";
  }

  const parsedDate =
    new Date(date);

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    return "-";
  }

  return parsedDate.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

const Reports = () => {
  const [summary, setSummary] =
    useState({});

  const [bookingReport, setBookingReport] =
    useState({});

  const [customerReport, setCustomerReport] =
    useState({});

  const [foodReport, setFoodReport] =
    useState({});

  const [cateringReport, setCateringReport] =
    useState({});

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [refreshing, setRefreshing] =
    useState(false);

  const loadReports = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const results =
          await Promise.allSettled([
            reportService.getSummaryReport(),

            reportService.getBookingReport(),

            reportService.getFoodReport(),

            reportService.getCustomerReport(),

            reportService.getCateringReport(),
          ]);

        const [
          summaryResult,
          bookingResult,
          foodResult,
          customerResult,
          cateringResult,
        ] = results;

        let failedReports = 0;

        if (
          summaryResult.status ===
          "fulfilled"
        ) {
          setSummary(
            getReportObject(
              summaryResult.value
            )
          );
        } else {
          failedReports += 1;
        }

        if (
          bookingResult.status ===
          "fulfilled"
        ) {
          setBookingReport(
            getReportObject(
              bookingResult.value
            )
          );
        } else {
          failedReports += 1;
        }

        if (
          foodResult.status ===
          "fulfilled"
        ) {
          setFoodReport(
            getReportObject(
              foodResult.value
            )
          );
        } else {
          failedReports += 1;
        }

        if (
          customerResult.status ===
          "fulfilled"
        ) {
          setCustomerReport(
            getReportObject(
              customerResult.value
            )
          );
        } else {
          failedReports += 1;
        }

        if (
          cateringResult.status ===
          "fulfilled"
        ) {
          setCateringReport(
            getReportObject(
              cateringResult.value
            )
          );
        } else {
          failedReports += 1;
        }

        if (
          failedReports ===
          results.length
        ) {
          throw new Error(
            "Unable to load reports"
          );
        }

        if (failedReports > 0) {
          setError(
            "Some report sections could not be loaded. Please refresh and try again."
          );
        }
      } catch (err) {
        console.error(
          "Reports loading error:",
          err
        );

        setError(
          err?.message ||
            "Failed to load reports"
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const bookingItems = useMemo(
    () =>
      getArray(
        bookingReport?.bookings
      ),
    [bookingReport]
  );

  const foodItems = useMemo(
    () =>
      getArray(
        foodReport?.foods
      ),
    [foodReport]
  );

  const customerItems = useMemo(
    () =>
      getArray(
        customerReport?.customers
      ),
    [customerReport]
  );

  const cateringItems = useMemo(
    () =>
      getArray(
        cateringReport?.bookings
      ),
    [cateringReport]
  );

  const stats = [
    {
      title: "Total Bookings",
      value:
        summary?.totalBookings ??
        bookingReport?.totalBookings ??
        0,
      icon: "📋",
      className: "blue",
    },

    {
      title: "Pending",
      value:
        summary?.pendingBookings ??
        bookingReport?.pendingBookings ??
        0,
      icon: "⏳",
      className: "orange",
    },

    {
      title: "Accepted",
      value:
        summary?.acceptedBookings ??
        bookingReport?.acceptedBookings ??
        0,
      icon: "✓",
      className: "purple",
    },

    {
      title: "Completed",
      value:
        summary?.completedBookings ??
        bookingReport?.completedBookings ??
        0,
      icon: "✓",
      className: "green",
    },

    {
      title: "Cancelled",
      value:
        summary?.cancelledBookings ??
        bookingReport?.cancelledBookings ??
        0,
      icon: "×",
      className: "red",
    },

    {
      title: "Customers",
      value:
        summary?.totalCustomers ??
        customerReport?.totalCustomers ??
        0,
      icon: "👥",
      className: "teal",
    },

    {
      title: "Food Items",
      value:
        summary?.totalFoods ??
        foodReport?.totalFoods ??
        0,
      icon: "🍽",
      className: "pink",
    },

    {
      title: "Total Persons",
      value:
        summary?.totalPersons ??
        cateringReport?.totalPersons ??
        0,
      icon: "👤",
      className: "indigo",
    },
  ];

  if (loading) {
    return (
      <div className="reports-page">
        <div className="reports-loading">
          <div className="reports-spinner" />
          <p>
            Loading reports...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-page">
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="reports-page-header">
        <div>
          <span className="reports-eyebrow">
            BUSINESS ANALYTICS
          </span>

          <h1>
            Reports
          </h1>

          <p>
            View booking, customer, food
            and catering business reports.
          </p>
        </div>

      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="reports-error">
          <div>
            <strong>
              Report Warning
            </strong>

            <p>
              {error}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              loadReports(true)
            }
          >
            Retry
          </button>
        </div>
      )}

      {/* =====================================================
          SUMMARY
      ===================================================== */}

      <section className="reports-section">
        <div className="reports-section-header">
          <div>
            <h2>
              Business Summary
            </h2>

            <p>
              Current catering business
              overview
            </p>
          </div>
        </div>

        <div className="reports-stat-grid">
          {stats.map((stat) => (
            <div
              className={`reports-stat-card ${stat.className}`}
              key={stat.title}
            >
              <div className="reports-stat-icon">
                {stat.icon}
              </div>

              <div className="reports-stat-content">
                <span>
                  {stat.title}
                </span>

                <strong>
                  {stat.value}
                </strong>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =====================================================
          BOOKING OVERVIEW
      ===================================================== */}

      <section className="reports-section">
        <div className="reports-section-header">
          <div>
            <h2>
              Booking Overview
            </h2>

            <p>
              Recent customer bookings
            </p>
          </div>

          <div className="reports-section-count">
            {bookingItems.length} records
          </div>
        </div>

        <div className="reports-table-wrapper">
          {bookingItems.length === 0 ? (
            <div className="reports-empty">
              <div>📋</div>
              <h3>
                No booking records
              </h3>
              <p>
                Booking report data will
                appear here.
              </p>
            </div>
          ) : (
            <table className="reports-table">
              <thead>
                <tr>
                  <th>
                    Customer
                  </th>

                  <th>
                    Function
                  </th>

                  <th>
                    Date
                  </th>

                  <th>
                    Persons
                  </th>

                  <th>
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {bookingItems
                  .slice(0, 10)
                  .map(
                    (booking) => (
                      <tr
                        key={
                          booking._id ||
                          booking.id
                        }
                      >
                        <td>
                          <div className="reports-customer-cell">
                            <strong>
                              {getCustomerName(
                                booking
                              )}
                            </strong>

                            <span>
                              {getCustomerPhone(
                                booking
                              )}
                            </span>
                          </div>
                        </td>

                        <td>
                          {booking.eventType ||
                            booking.functionType ||
                            "-"}
                        </td>

                        <td>
                          {formatDate(
                            booking.eventDate ||
                              booking.date
                          )}
                        </td>

                        <td>
                          {Number(
                            booking.numberOfPersons ||
                              0
                          )}
                        </td>

                        <td>
                          <span
                            className={`reports-status ${getStatusClass(
                              booking.status
                            )}`}
                          >
                            {getStatusLabel(
                              booking.status
                            )}
                          </span>
                        </td>
                      </tr>
                    )
                  )}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* =====================================================
          CATERING OVERVIEW
      ===================================================== */}

      <section className="reports-section">
        <div className="reports-section-header">
          <div>
            <h2>
              Catering Overview
            </h2>

            <p>
              Cooking and serving service
              summary
            </p>
          </div>
        </div>

        <div className="reports-mini-grid">
          <div className="reports-mini-card">
            <span>
              Catering Bookings
            </span>

            <strong>
              {cateringReport?.totalBookings ??
                0}
            </strong>
          </div>

          <div className="reports-mini-card">
            <span>
              Total Persons
            </span>

            <strong>
              {cateringReport?.totalPersons ??
                0}
            </strong>
          </div>

          <div className="reports-mini-card">
            <span>
              Cooking Service
            </span>

            <strong>
              {cateringReport?.cookingServiceBookings ??
                0}
            </strong>
          </div>

          <div className="reports-mini-card">
            <span>
              Serving Staff
            </span>

            <strong>
              {cateringReport?.servingStaffBookings ??
                0}
            </strong>
          </div>
        </div>

        {cateringItems.length > 0 && (
          <div className="reports-catering-list">
            {cateringItems
              .slice(0, 8)
              .map((booking) => (
                <div
                  className="reports-catering-item"
                  key={
                    booking._id ||
                    booking.id
                  }
                >
                  <div>
                    <strong>
                      {getCustomerName(
                        booking
                      )}
                    </strong>

                    <span>
                      {booking.location ||
                        "Location not specified"}
                    </span>
                  </div>

                  <div>
                    <strong>
                      {Number(
                        booking.numberOfPersons ||
                          0
                      )}{" "}
                      persons
                    </strong>

                    <span>
                      {booking.cookingService
                        ? "Cooking Service"
                        : "No Cooking Service"}
                    </span>
                  </div>

                  <div>
                    <span
                      className={`reports-status ${getStatusClass(
                        booking.status
                      )}`}
                    >
                      {getStatusLabel(
                        booking.status
                      )}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        )}
      </section>

      {/* =====================================================
          FOOD OVERVIEW
      ===================================================== */}

      <section className="reports-section">
        <div className="reports-section-header">
          <div>
            <h2>
              Food Overview
            </h2>

            <p>
              Current food menu report
            </p>
          </div>

          <div className="reports-section-count">
            {foodItems.length} records
          </div>
        </div>

        <div className="reports-food-grid">
          {foodItems.length === 0 ? (
            <div className="reports-empty">
              <div>🍽</div>
              <h3>
                No food records
              </h3>
              <p>
                Food report data will
                appear here.
              </p>
            </div>
          ) : (
            foodItems
              .slice(0, 12)
              .map((food) => (
                <div
                  className="reports-food-card"
                  key={
                    food._id ||
                    food.id
                  }
                >
                  <div className="reports-food-icon">
                    🍽
                  </div>

                  <div>
                    <strong>
                      {getFoodName(
                        food
                      )}
                    </strong>

                    <span>
                      {food.tamilName ||
                        food.category ||
                        "Food Item"}
                    </span>
                  </div>

                  <span
                    className={
                      food.isAvailable
                        ? "reports-availability available"
                        : "reports-availability unavailable"
                    }
                  >
                    {food.isAvailable
                      ? "Available"
                      : "Unavailable"}
                  </span>
                </div>
              ))
          )}
        </div>
      </section>

      {/* =====================================================
          CUSTOMER OVERVIEW
      ===================================================== */}

      <section className="reports-section">
        <div className="reports-section-header">
          <div>
            <h2>
              Customer Overview
            </h2>

            <p>
              Registered customer summary
            </p>
          </div>

          <div className="reports-section-count">
            {customerItems.length} records
          </div>
        </div>

        <div className="reports-customer-grid">
          {customerItems.length === 0 ? (
            <div className="reports-empty">
              <div>👥</div>
              <h3>
                No customer records
              </h3>
              <p>
                Customer report data will
                appear here.
              </p>
            </div>
          ) : (
            customerItems
              .slice(0, 12)
              .map((customer) => (
                <div
                  className="reports-customer-card"
                  key={
                    customer._id ||
                    customer.id
                  }
                >
                  <div className="reports-customer-avatar">
                    {String(
                      customer.name ||
                        "C"
                    )
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="reports-customer-info">
                    <strong>
                      {customer.name ||
                        "Unknown Customer"}
                    </strong>

                    <span>
                      {customer.phone ||
                        customer.mobile ||
                        "-"}
                    </span>

                    <span>
                      {customer.email ||
                        "No email"}
                    </span>
                  </div>
                </div>
              ))
          )}
        </div>
      </section>
    </div>
  );
};

export default Reports;