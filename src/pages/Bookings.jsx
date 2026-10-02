import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link } from "react-router-dom";

import { useApp } from "../context/AppContext";
import bookingService from "../services/bookingService";

import "./Bookings.css";

const Bookings = () => {
  const { language } = useApp();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState(null);

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const isTamil = language === "ta";

  const text = useMemo(
    () =>
      isTamil
        ? {
            title: "முன்பதிவுகள்",
            subtitle:
              "வாடிக்கையாளர் கேட்டரிங் முன்பதிவுகளை நிர்வகிக்கவும்",

            all: "அனைத்தும்",
            pending: "நிலுவை",
            accepted: "ஏற்றுக்கொள்ளப்பட்டது",
            confirmed: "உறுதி",
            completed: "முடிந்தது",
            rejected: "நிராகரிக்கப்பட்டது",
            cancelled: "ரத்து",

            search:
              "வாடிக்கையாளர் அல்லது நிகழ்ச்சியைத் தேடுங்கள்...",

            customer: "வாடிக்கையாளர்",
            function: "நிகழ்ச்சி",
            date: "தேதி",
            time: "நேரம்",
            location: "இடம்",
            persons: "நபர்கள்",
            status: "நிலை",
            action: "செயல்",
            view: "பார்க்க",
            delete: "நீக்கு",

            noBookings: "முன்பதிவுகள் எதுவும் இல்லை",
            noResults:
              "தேடலுக்கு பொருத்தமான முன்பதிவு இல்லை",

            loading: "முன்பதிவுகள் ஏற்றப்படுகின்றன...",
            failed: "முன்பதிவுகளை ஏற்ற முடியவில்லை.",
            retry: "மீண்டும் முயற்சி",

            today: "இன்று",

            pendingLabel: "நிலுவை",
            acceptedLabel: "ஏற்றுக்கொள்ளப்பட்டது",
            confirmedLabel: "உறுதி",
            completedLabel: "முடிந்தது",
            rejectedLabel: "நிராகரிக்கப்பட்டது",
            cancelledLabel: "ரத்து",

            total: "மொத்தம்",

            deleteTitle: "முன்பதிவை நீக்கவா?",
            deleteMessage:
              "இந்த முன்பதிவு நிரந்தரமாக நீக்கப்படும். இந்த செயலை மீண்டும் மாற்ற முடியாது.",
            deleteConfirm: "நீக்கு",
            deleteCancel: "ரத்து",
            deleting: "நீக்கப்படுகிறது...",
            deleteSuccess: "முன்பதிவு வெற்றிகரமாக நீக்கப்பட்டது.",
            deleteFailed:
              "முன்பதிவை நீக்க முடியவில்லை.",
          }
        : {
            title: "Bookings",
            subtitle: "Manage customer catering bookings",

            all: "All",
            pending: "Pending",
            accepted: "Accepted",
            confirmed: "Confirmed",
            completed: "Completed",
            rejected: "Rejected",
            cancelled: "Cancelled",

            search: "Search customer or function...",

            customer: "Customer",
            function: "Function",
            date: "Date",
            time: "Time",
            location: "Location",
            persons: "Persons",
            status: "Status",
            action: "Action",
            view: "View",
            delete: "Delete",

            noBookings: "No bookings found",
            noResults: "No bookings match your search",

            loading: "Loading bookings...",
            failed: "Unable to load bookings.",
            retry: "Try Again",

            today: "Today",

            pendingLabel: "Pending",
            acceptedLabel: "Accepted",
            confirmedLabel: "Confirmed",
            completedLabel: "Completed",
            rejectedLabel: "Rejected",
            cancelledLabel: "Cancelled",

            total: "Total",

            deleteTitle: "Delete Booking?",
            deleteMessage:
              "This booking will be permanently deleted. This action cannot be undone.",
            deleteConfirm: "Delete",
            deleteCancel: "Cancel",
            deleting: "Deleting...",
            deleteSuccess: "Booking deleted successfully.",
            deleteFailed: "Unable to delete booking.",
          },
    [isTamil]
  );

  /* =====================================================
     NORMALIZE API RESPONSE
  ===================================================== */

  const normalizeBookings = useCallback((response) => {
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response?.data)) {
      return response.data;
    }

    if (Array.isArray(response?.data?.data)) {
      return response.data.data;
    }

    if (Array.isArray(response?.bookings)) {
      return response.bookings;
    }

    if (Array.isArray(response?.data?.bookings)) {
      return response.data.bookings;
    }

    return [];
  }, []);

  /* =====================================================
     LOAD BOOKINGS
  ===================================================== */

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await bookingService.getBookings();

      setBookings(normalizeBookings(response));
    } catch (err) {
      console.error("Bookings Load Error:", err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          text.failed
      );
    } finally {
      setLoading(false);
    }
  }, [normalizeBookings, text.failed]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  /* =====================================================
     DELETE BOOKING
  ===================================================== */

  const handleDeleteBooking = useCallback(
    async (booking) => {
      const bookingId = booking?._id || booking?.id;

      if (!bookingId) {
        setError(
          isTamil
            ? "முன்பதிவு ID கிடைக்கவில்லை."
            : "Booking ID is missing."
        );
        return;
      }

      const customer =
        booking?.customer?.name ||
        booking?.customerName ||
        booking?.name ||
        "Customer";

      const confirmed = window.confirm(
        `${text.deleteTitle}\n\n${customer}\n\n${text.deleteMessage}`
      );

      if (!confirmed) {
        return;
      }

      setDeleteId(String(bookingId));
      setError("");

      try {
        await bookingService.deleteBooking(bookingId);

        setBookings((currentBookings) =>
          currentBookings.filter(
            (item) =>
              String(item?._id || item?.id) !==
              String(bookingId)
          )
        );
      } catch (err) {
        console.error("Delete Booking Error:", err);

        setError(
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            text.deleteFailed
        );
      } finally {
        setDeleteId(null);
      }
    },
    [isTamil, text.deleteFailed, text.deleteMessage, text.deleteTitle]
  );

  /* =====================================================
     BOOKING HELPERS
  ===================================================== */

  const getStatus = useCallback((booking) => {
    return String(
      booking?.status || "pending"
    ).toLowerCase();
  }, []);

  const getCustomerName = useCallback((booking) => {
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
  }, []);

  const getCustomerPhone = useCallback((booking) => {
    const customer = booking?.customer;

    if (
      typeof customer === "object" &&
      customer
    ) {
      return (
        customer?.phone ||
        customer?.mobile ||
        customer?.phoneNumber ||
        ""
      );
    }

    return (
      booking?.phone ||
      booking?.mobile ||
      booking?.phoneNumber ||
      ""
    );
  }, []);

  const getFunctionName = useCallback((booking) => {
    return (
      booking?.eventType ||
      booking?.functionType ||
      booking?.function ||
      booking?.eventName ||
      "—"
    );
  }, []);

  const getDateValue = useCallback((booking) => {
    return (
      booking?.eventDate ||
      booking?.date ||
      booking?.bookingDate ||
      ""
    );
  }, []);

  const getTimeValue = useCallback((booking) => {
    return (
      booking?.eventTime ||
      booking?.time ||
      booking?.bookingTime ||
      "—"
    );
  }, []);

  const getLocation = useCallback((booking) => {
    if (typeof booking?.location === "string") {
      return booking.location;
    }

    if (
      booking?.location &&
      typeof booking.location === "object"
    ) {
      return (
        booking.location?.address ||
        booking.location?.name ||
        booking.location?.location ||
        "—"
      );
    }

    return (
      booking?.venue ||
      booking?.address ||
      "—"
    );
  }, []);

  const getPersons = useCallback((booking) => {
    return (
      booking?.numberOfPersons ??
      booking?.persons ??
      booking?.guestCount ??
      0
    );
  }, []);

  /* =====================================================
     DATE FORMAT
  ===================================================== */

  const formatDate = useCallback(
    (value) => {
      if (!value) {
        return "—";
      }

      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return value;
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
    [isTamil]
  );

  /* =====================================================
     TODAY
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
     STATUS LABEL
  ===================================================== */

  const getStatusLabel = useCallback(
    (status) => {
      const labels = {
        pending: text.pendingLabel,
        accepted: text.acceptedLabel,
        confirmed: text.confirmedLabel,
        completed: text.completedLabel,
        rejected: text.rejectedLabel,
        cancelled: text.cancelledLabel,
      };

      return labels[status] || status;
    },
    [
      text.pendingLabel,
      text.acceptedLabel,
      text.confirmedLabel,
      text.completedLabel,
      text.rejectedLabel,
      text.cancelledLabel,
    ]
  );

  /* =====================================================
     FILTER BOOKINGS
  ===================================================== */

  const filteredBookings = useMemo(() => {
    const query = search.trim().toLowerCase();

    return bookings.filter((booking) => {
      const status = getStatus(booking);

      const matchesFilter =
        filter === "all" ||
        status === filter;

      if (!matchesFilter) {
        return false;
      }

      if (!query) {
        return true;
      }

      const customer =
        getCustomerName(booking);

      const functionName =
        getFunctionName(booking);

      const location =
        getLocation(booking);

      const phone =
        getCustomerPhone(booking);

      return [
        customer,
        functionName,
        location,
        phone,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [
    bookings,
    filter,
    search,
    getStatus,
    getCustomerName,
    getFunctionName,
    getLocation,
    getCustomerPhone,
  ]);

  /* =====================================================
     BOOKING COUNTS
  ===================================================== */

  const counts = useMemo(() => {
    return {
      all: bookings.length,

      pending: bookings.filter(
        (booking) =>
          getStatus(booking) === "pending"
      ).length,

      accepted: bookings.filter(
        (booking) =>
          getStatus(booking) === "accepted"
      ).length,

      confirmed: bookings.filter(
        (booking) =>
          getStatus(booking) === "confirmed"
      ).length,

      completed: bookings.filter(
        (booking) =>
          getStatus(booking) === "completed"
      ).length,

      rejected: bookings.filter(
        (booking) =>
          getStatus(booking) === "rejected"
      ).length,

      cancelled: bookings.filter(
        (booking) =>
          getStatus(booking) === "cancelled"
      ).length,
    };
  }, [bookings, getStatus]);

  /* =====================================================
     FILTER ITEMS
  ===================================================== */

  const filterItems = useMemo(
    () => [
      {
        key: "all",
        label: text.all,
        count: counts.all,
      },
      {
        key: "pending",
        label: text.pending,
        count: counts.pending,
      },
      {
        key: "accepted",
        label: text.accepted,
        count: counts.accepted,
      },
      {
        key: "confirmed",
        label: text.confirmed,
        count: counts.confirmed,
      },
      {
        key: "completed",
        label: text.completed,
        count: counts.completed,
      },
      {
        key: "rejected",
        label: text.rejected,
        count: counts.rejected,
      },
      {
        key: "cancelled",
        label: text.cancelled,
        count: counts.cancelled,
      },
    ],
    [
      counts,
      text.all,
      text.pending,
      text.accepted,
      text.confirmed,
      text.completed,
      text.rejected,
      text.cancelled,
    ]
  );

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="bookings-page">
        <div className="bookings-loading">
          <div className="bookings-loading-spinner"></div>
          <p>{text.loading}</p>
        </div>
      </div>
    );
  }

  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <div className="bookings-page">
      <div className="bookings-container">

        {/* HEADER */}

        <div className="bookings-header">
          <div>
            <span className="bookings-eyebrow">
              BOOKING MANAGEMENT
            </span>

            <h1>{text.title}</h1>

            <p>{text.subtitle}</p>
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div className="bookings-error">
            <div>
              <strong>{text.failed}</strong>
              <span>{error}</span>
            </div>

            <button
              type="button"
              onClick={loadBookings}
            >
              {text.retry}
            </button>
          </div>
        )}

        {/* SUMMARY */}

        <div className="bookings-summary">

          <div className="bookings-summary-card">
            <span className="bookings-summary-icon">
              📋
            </span>

            <div>
              <small>{text.total}</small>
              <strong>{counts.all}</strong>
            </div>
          </div>

          <div className="bookings-summary-card pending">
            <span className="bookings-summary-icon">
              ⏳
            </span>

            <div>
              <small>{text.pending}</small>
              <strong>{counts.pending}</strong>
            </div>
          </div>

          <div className="bookings-summary-card accepted">
            <span className="bookings-summary-icon">
              ✓
            </span>

            <div>
              <small>{text.accepted}</small>
              <strong>{counts.accepted}</strong>
            </div>
          </div>

          <div className="bookings-summary-card confirmed">
            <span className="bookings-summary-icon">
              ✓
            </span>

            <div>
              <small>{text.confirmed}</small>
              <strong>{counts.confirmed}</strong>
            </div>
          </div>

          <div className="bookings-summary-card completed">
            <span className="bookings-summary-icon">
              ★
            </span>

            <div>
              <small>{text.completed}</small>
              <strong>{counts.completed}</strong>
            </div>
          </div>

        </div>

        {/* TOOLBAR */}

        <div className="bookings-toolbar">

          <div className="bookings-search">
            <span>⌕</span>

            <input
              type="search"
              placeholder={text.search}
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          <div className="bookings-filters">
            {filterItems.map((item) => (
              <button
                type="button"
                key={item.key}
                className={
                  filter === item.key
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setFilter(item.key)
                }
              >
                <span>{item.label}</span>
                <small>{item.count}</small>
              </button>
            ))}
          </div>

        </div>

        {/* BOOKINGS PANEL */}

        <section className="bookings-panel">

          <div className="bookings-panel-header">
            <div>
              <span>BOOKINGS</span>

              <h2>
                {filteredBookings.length}{" "}
                {isTamil
                  ? "முன்பதிவுகள்"
                  : "Bookings"}
              </h2>
            </div>
          </div>

          {/* EMPTY */}

          {filteredBookings.length === 0 ? (
            <div className="bookings-empty">

              <div className="bookings-empty-icon">
                📋
              </div>

              <h3>
                {search || filter !== "all"
                  ? text.noResults
                  : text.noBookings}
              </h3>

              {(search ||
                filter !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setFilter("all");
                  }}
                >
                  {text.all}
                </button>
              )}

            </div>
          ) : (
            <>
              {/* DESKTOP TABLE */}

              <div className="bookings-table-wrapper">
                <table className="bookings-table">

                  <thead>
                    <tr>
                      <th>{text.customer}</th>
                      <th>{text.function}</th>
                      <th>{text.date}</th>
                      <th>{text.time}</th>
                      <th>{text.location}</th>
                      <th>{text.persons}</th>
                      <th>{text.status}</th>
                      <th>{text.action}</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredBookings.map(
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

                        const isDeleting =
                          String(deleteId) ===
                          String(bookingId);

                        return (
                          <tr key={bookingId}>

                            <td>
                              <div className="bookings-customer">

                                <span className="bookings-avatar">
                                  {customerName
                                    .charAt(0)
                                    .toUpperCase()}
                                </span>

                                <div>
                                  <strong>
                                    {customerName}
                                  </strong>

                                  {getCustomerPhone(
                                    booking
                                  ) && (
                                    <small>
                                      {getCustomerPhone(
                                        booking
                                      )}
                                    </small>
                                  )}
                                </div>

                              </div>
                            </td>

                            <td>
                              <span className="bookings-function">
                                {getFunctionName(
                                  booking
                                )}
                              </span>
                            </td>

                            <td>
                              <div className="bookings-date">

                                {isToday(
                                  booking
                                ) && (
                                  <small>
                                    {text.today}
                                  </small>
                                )}

                                <span>
                                  {formatDate(
                                    getDateValue(
                                      booking
                                    )
                                  )}
                                </span>

                              </div>
                            </td>

                            <td>
                              <span className="bookings-time">
                                {getTimeValue(
                                  booking
                                )}
                              </span>
                            </td>

                            <td>
                              <span className="bookings-location">
                                📍{" "}
                                {getLocation(
                                  booking
                                )}
                              </span>
                            </td>

                            <td>
                              <span className="bookings-persons">
                                {getPersons(
                                  booking
                                )}
                              </span>
                            </td>

                            <td>
                              <span
                                className={`bookings-status bookings-status-${status}`}
                              >
                                <i></i>

                                {getStatusLabel(
                                  status
                                )}
                              </span>
                            </td>

                            <td>
                              <div className="bookings-actions">

                                <Link
                                  to={`/bookings/${bookingId}`}
                                  className="bookings-view-button"
                                >
                                  {text.view}
                                  <span>→</span>
                                </Link>

                                <button
                                  type="button"
                                  className="bookings-delete-button"
                                  onClick={() =>
                                    handleDeleteBooking(
                                      booking
                                    )
                                  }
                                  disabled={deleteId !== null}
                                  title={text.delete}
                                >
                                  {isDeleting ? (
                                    <>
                                      <span className="bookings-delete-spinner"></span>
                                      <span>
                                        {text.deleting}
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <span aria-hidden="true">
                                        🗑
                                      </span>
                                      <span>
                                        {text.delete}
                                      </span>
                                    </>
                                  )}
                                </button>

                              </div>
                            </td>

                          </tr>
                        );
                      }
                    )}
                  </tbody>

                </table>
              </div>

              {/* MOBILE LIST */}

              <div className="bookings-mobile-list">

                {filteredBookings.map(
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

                    const isDeleting =
                      String(deleteId) ===
                      String(bookingId);

                    return (
                      <article
                        className="booking-mobile-card"
                        key={bookingId}
                      >

                        <div className="booking-mobile-top">

                          <div className="bookings-customer">

                            <span className="bookings-avatar">
                              {customerName
                                .charAt(0)
                                .toUpperCase()}
                            </span>

                            <div>
                              <strong>
                                {customerName}
                              </strong>

                              <small>
                                {getFunctionName(
                                  booking
                                )}
                              </small>
                            </div>

                          </div>

                          <span
                            className={`bookings-status bookings-status-${status}`}
                          >
                            <i></i>

                            {getStatusLabel(
                              status
                            )}
                          </span>

                        </div>

                        <div className="booking-mobile-details">

                          <div>
                            <small>
                              {text.date}
                            </small>

                            <strong>
                              {formatDate(
                                getDateValue(
                                  booking
                                )
                              )}
                            </strong>
                          </div>

                          <div>
                            <small>
                              {text.time}
                            </small>

                            <strong>
                              {getTimeValue(
                                booking
                              )}
                            </strong>
                          </div>

                          <div>
                            <small>
                              {text.persons}
                            </small>

                            <strong>
                              {getPersons(
                                booking
                              )}
                            </strong>
                          </div>

                        </div>

                        <div className="booking-mobile-location">
                          📍{" "}
                          {getLocation(
                            booking
                          )}
                        </div>

                        <div className="booking-mobile-actions">

                          <Link
                            to={`/bookings/${bookingId}`}
                            className="booking-mobile-view"
                          >
                            {text.view}
                            <span>→</span>
                          </Link>

                          <button
                            type="button"
                            className="booking-mobile-delete"
                            onClick={() =>
                              handleDeleteBooking(
                                booking
                              )
                            }
                            disabled={deleteId !== null}
                          >
                            {isDeleting ? (
                              <>
                                <span className="bookings-delete-spinner"></span>
                                {text.deleting}
                              </>
                            ) : (
                              <>
                                <span aria-hidden="true">
                                  🗑
                                </span>
                                {text.delete}
                              </>
                            )}
                          </button>

                        </div>

                      </article>
                    );
                  }
                )}

              </div>
            </>
          )}

        </section>

      </div>
    </div>
  );
};

export default Bookings;