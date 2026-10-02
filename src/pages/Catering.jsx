import React, { useEffect, useMemo, useState } from "react";
import bookingService from "../services/bookingService";
import "./Catering.css";

const Catering = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("upcoming");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    loadBookings();
  }, []);

  const normalizeBookings = (response) => {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.bookings)) return response.bookings;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.data?.bookings)) {
      return response.data.bookings;
    }
    return [];
  };

  const loadBookings = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await bookingService.getBookings();
      setBookings(normalizeBookings(response));
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load catering bookings."
      );
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const getId = (booking) => booking._id || booking.id;

  const getCustomerName = (booking) =>
    booking.customer?.name ||
    booking.customer?.fullName ||
    booking.customerName ||
    booking.name ||
    "Customer";

  const getFunction = (booking) =>
    booking.functionType ||
    booking.eventType ||
    booking.function ||
    "Catering Function";

  const getLocation = (booking) =>
    booking.location ||
    booking.venue ||
    booking.address ||
    "Location not provided";

  const getPersons = (booking) =>
    booking.numberOfPersons ||
    booking.persons ||
    booking.guestCount ||
    0;

  const getStatus = (booking) =>
    String(booking.status || "pending").toLowerCase();

  const getDate = (booking) => booking.date || booking.eventDate;

  const formatDate = (value) => {
    if (!value) return "Date not set";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return String(value);

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const isUpcoming = (booking) => {
    const date = getDate(booking);

    if (!date) return false;

    const bookingDate = new Date(date);
    const today = new Date();

    bookingDate.setHours(23, 59, 59, 999);
    today.setHours(0, 0, 0, 0);

    return bookingDate >= today;
  };

  const filteredBookings = useMemo(() => {
    const query = search.trim().toLowerCase();

    return bookings
      .filter((booking) => {
        const status = getStatus(booking);

        const matchesFilter =
          filter === "all" ||
          (filter === "upcoming" && isUpcoming(booking)) ||
          (filter === "pending" && status === "pending") ||
          (filter === "confirmed" && status === "confirmed") ||
          (filter === "completed" && status === "completed");

        const text = [
          getCustomerName(booking),
          getFunction(booking),
          getLocation(booking),
          booking.customer?.phone,
          booking.phone,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return matchesFilter && (!query || text.includes(query));
      })
      .sort((a, b) => {
        const first = new Date(getDate(a) || 0).getTime();
        const second = new Date(getDate(b) || 0).getTime();

        return first - second;
      });
  }, [bookings, filter, search]);

  const stats = {
    total: bookings.length,
    upcoming: bookings.filter(isUpcoming).length,
    pending: bookings.filter((item) => getStatus(item) === "pending").length,
    confirmed: bookings.filter(
      (item) => getStatus(item) === "confirmed"
    ).length,
  };

  const handleStatus = async (booking, status) => {
    const id = getId(booking);

    if (!id) return;

    setUpdatingId(id);
    setError("");

    try {
      const response = await bookingService.updateBookingStatus(id, status);

      const updated =
        response?.booking ||
        response?.data?.booking ||
        response?.data ||
        null;

      if (updated) {
        setBookings((current) =>
          current.map((item) => (getId(item) === id ? updated : item))
        );
      } else {
        await loadBookings();
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to update booking status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="catering-page">
      <div className="catering-page-header">
        <div>
          <span className="catering-eyebrow">SERVICE OPERATIONS</span>
          <h1>Catering</h1>
          <p>Manage upcoming catering functions and customer orders.</p>
        </div>

      </div>

      {error && <div className="catering-alert">{error}</div>}

      <div className="catering-stats">
        <div className="catering-stat">
          <span>Total Functions</span>
          <strong>{stats.total}</strong>
        </div>

        <div className="catering-stat">
          <span>Upcoming</span>
          <strong>{stats.upcoming}</strong>
        </div>

        <div className="catering-stat">
          <span>Pending</span>
          <strong>{stats.pending}</strong>
        </div>

        <div className="catering-stat">
          <span>Confirmed</span>
          <strong>{stats.confirmed}</strong>
        </div>
      </div>

      <div className="catering-toolbar">
        <div className="catering-search">
          <span>⌕</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search customer, function or location..."
          />
        </div>

        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        >
          <option value="upcoming">Upcoming</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="all">All Functions</option>
        </select>
      </div>

      {loading ? (
        <div className="catering-state">
          <div className="catering-spinner" />
          <p>Loading catering functions...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="catering-empty">
          <div>🍽️</div>
          <h2>No catering functions found</h2>
          <p>
            {search
              ? "Try changing your search or filter."
              : "Customer bookings will appear here."}
          </p>
        </div>
      ) : (
        <div className="catering-list">
          {filteredBookings.map((booking) => {
            const id = getId(booking);
            const status = getStatus(booking);

            const selectedFoods =
              booking.selectedFoods ||
              booking.foods ||
              booking.foodItems ||
              [];

            return (
              <article className="catering-card" key={id || Math.random()}>
                <div className="catering-card-main">
                  <div className="catering-date-box">
                    <strong>
                      {getDate(booking)
                        ? new Date(getDate(booking)).getDate()
                        : "--"}
                    </strong>
                    <span>
                      {getDate(booking)
                        ? new Date(getDate(booking)).toLocaleDateString(
                            "en-IN",
                            { month: "short" }
                          )
                        : "DATE"}
                    </span>
                  </div>

                  <div className="catering-card-info">
                    <div className="catering-card-title-row">
                      <div>
                        <span className="catering-function-label">
                          {getFunction(booking)}
                        </span>
                        <h2>{getCustomerName(booking)}</h2>
                      </div>

                      <span className={`catering-status ${status}`}>
                        {status}
                      </span>
                    </div>

                    <div className="catering-details-row">
                      <span>📅 {formatDate(getDate(booking))}</span>
                      <span>
                        👥 {Number(getPersons(booking)).toLocaleString("en-IN")}{" "}
                        persons
                      </span>
                      <span>📍 {getLocation(booking)}</span>
                    </div>

                    {booking.time && (
                      <div className="catering-time">
                        🕐 {booking.time}
                      </div>
                    )}

                    <div className="catering-food-section">
                      <div className="catering-food-heading">
                        Selected Food
                        <span>{selectedFoods.length}</span>
                      </div>

                      {selectedFoods.length === 0 ? (
                        <p className="catering-no-food">
                          No food items selected.
                        </p>
                      ) : (
                        <div className="catering-food-list">
                          {selectedFoods.slice(0, 6).map((food, index) => {
                            const foodName =
                              food.food?.name ||
                              food.name ||
                              food.foodName ||
                              `Food Item ${index + 1}`;

                            const quantity =
                              food.quantity ||
                              food.qty ||
                              food.count ||
                              1;

                            return (
                              <span
                                className="catering-food-chip"
                                key={food._id || food.foodId || index}
                              >
                                {foodName}
                                <b>×{quantity}</b>
                              </span>
                            );
                          })}

                          {selectedFoods.length > 6 && (
                            <span className="catering-food-more">
                              +{selectedFoods.length - 6} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="catering-card-actions">
                  <a
                    href={id ? `/bookings/${id}` : "#"}
                    className="catering-view-button"
                  >
                    View Booking
                  </a>

                  {status === "pending" && (
                    <>
                      <button
                        type="button"
                        className="catering-confirm-button"
                        disabled={updatingId === id}
                        onClick={() => handleStatus(booking, "confirmed")}
                      >
                        Confirm
                      </button>

                      <button
                        type="button"
                        className="catering-reject-button"
                        disabled={updatingId === id}
                        onClick={() => handleStatus(booking, "rejected")}
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {status === "confirmed" && (
                    <button
                      type="button"
                      className="catering-complete-button"
                      disabled={updatingId === id}
                      onClick={() => handleStatus(booking, "completed")}
                    >
                      Mark Completed
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Catering;