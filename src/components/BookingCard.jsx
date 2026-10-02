import React from "react";
import { useNavigate } from "react-router-dom";
import "./BookingCard.css";

const statusConfig = {
  pending: {
    label: "Pending",
    className: "pending",
  },
  accepted: {
    label: "Accepted",
    className: "accepted",
  },
  confirmed: {
    label: "Confirmed",
    className: "confirmed",
  },
  rejected: {
    label: "Rejected",
    className: "rejected",
  },
  completed: {
    label: "Completed",
    className: "completed",
  },
  cancelled: {
    label: "Cancelled",
    className: "cancelled",
  },
};

const BookingCard = ({
  booking,
  onAccept,
  onReject,
  onStatusChange,
  onDelete,
  showActions = true,
}) => {
  const navigate = useNavigate();

  if (!booking) return null;

  const status = String(booking.status || "pending").toLowerCase();
  const statusInfo = statusConfig[status] || statusConfig.pending;

  const bookingId = booking._id || booking.id;

  const customerName =
    booking.customerName ||
    booking.customer?.name ||
    "Customer";

  const phone =
    booking.phone ||
    booking.customer?.phone ||
    "Not available";

  const functionType =
    booking.functionType ||
    booking.eventType ||
    "Function";

  const location =
    booking.location ||
    "Location not provided";

  const persons =
    booking.numberOfPersons ||
    booking.persons ||
    0;

  const eventTime =
    booking.eventTime ||
    booking.time ||
    "Time not provided";

  const selectedFoods = Array.isArray(booking.selectedFoods)
    ? booking.selectedFoods
    : [];

  const extraRequirements =
    booking.extraRequirements ||
    booking.notes ||
    "";

  const formatDate = (dateValue) => {
    if (!dateValue) return "Date not available";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return String(dateValue);
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleView = () => {
    if (bookingId) {
      navigate(`/booking/${bookingId}`);
    }
  };

  const handleAccept = () => {
    if (onAccept) {
      onAccept(booking);
    }
  };

  const handleReject = () => {
    if (onReject) {
      onReject(booking);
    }
  };

  const handleStatusChange = (event) => {
    const nextStatus = event.target.value;

    if (onStatusChange) {
      onStatusChange(booking, nextStatus);
    }
  };

  const handleDelete = () => {
    if (!onDelete || !bookingId) return;

    const confirmed = window.confirm(
      `Are you sure you want to permanently delete this booking?\n\nCustomer: ${customerName}\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    onDelete(booking);
  };

  return (
    <article className="booking-card">
      {/* =====================================================
          TOP SECTION
      ====================================================== */}
      <div className="booking-card-top">
        <div className="booking-customer">
          <div className="booking-avatar">
            {customerName.charAt(0).toUpperCase()}
          </div>

          <div className="booking-customer-info">
            <h3>{customerName}</h3>
            <p>{phone}</p>
          </div>
        </div>

        <span
          className={`booking-status ${statusInfo.className}`}
        >
          {statusInfo.label}
        </span>
      </div>

      {/* =====================================================
          MAIN BOOKING INFORMATION
      ====================================================== */}
      <div className="booking-main">
        <div className="booking-info-grid">
          <div className="booking-info-item">
            <span className="booking-info-icon">🎉</span>

            <div>
              <small>Function</small>
              <strong>{functionType}</strong>
            </div>
          </div>

          <div className="booking-info-item">
            <span className="booking-info-icon">📅</span>

            <div>
              <small>Date</small>
              <strong>
                {formatDate(booking.eventDate)}
              </strong>
            </div>
          </div>

          <div className="booking-info-item">
            <span className="booking-info-icon">⏰</span>

            <div>
              <small>Time</small>
              <strong>{eventTime}</strong>
            </div>
          </div>

          <div className="booking-info-item">
            <span className="booking-info-icon">👥</span>

            <div>
              <small>Persons</small>
              <strong>{persons}</strong>
            </div>
          </div>

          <div className="booking-info-item booking-location">
            <span className="booking-info-icon">📍</span>

            <div>
              <small>Location</small>
              <strong>{location}</strong>
            </div>
          </div>

          {booking.cateringType && (
            <div className="booking-info-item">
              <span className="booking-info-icon">🍽️</span>

              <div>
                <small>Catering</small>
                <strong>{booking.cateringType}</strong>
              </div>
            </div>
          )}
        </div>

        {/* ===================================================
            SELECTED FOOD
        ==================================================== */}
        <div className="booking-food-section">
          <div className="booking-section-heading">
            <h4>Selected Food</h4>

            <span>
              {selectedFoods.length}{" "}
              {selectedFoods.length === 1
                ? "item"
                : "items"}
            </span>
          </div>

          {selectedFoods.length > 0 ? (
            <div className="booking-food-list">
              {selectedFoods.map((food, index) => (
                <div
                  className="booking-food-item"
                  key={
                    food.foodId ||
                    food.food?._id ||
                    food._id ||
                    index
                  }
                >
                  <div>
                    <strong>
                      {food.name ||
                        food.tamilName ||
                        "Food Item"}
                    </strong>

                    {food.tamilName && food.name && (
                      <small>{food.tamilName}</small>
                    )}
                  </div>

                  <span>
                    × {food.quantity || 1}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="booking-no-food">
              No food items selected
            </div>
          )}
        </div>

        {/* ===================================================
            EXTRA REQUIREMENTS
        ==================================================== */}
        {extraRequirements && (
          <div className="booking-notes">
            <strong>Extra Requirements</strong>
            <p>{extraRequirements}</p>
          </div>
        )}
      </div>

      {/* =====================================================
          ACTIONS
      ====================================================== */}
      {showActions && (
        <div className="booking-card-actions">
          <button
            type="button"
            className="booking-view-button"
            onClick={handleView}
          >
            <span>View Details</span>
            <span aria-hidden="true">→</span>
          </button>

          {status === "pending" && (
            <>
              <button
                type="button"
                className="booking-reject-button"
                onClick={handleReject}
              >
                Reject
              </button>

              <button
                type="button"
                className="booking-accept-button"
                onClick={handleAccept}
              >
                Accept
              </button>
            </>
          )}

          {status === "accepted" && onStatusChange && (
            <select
              className="booking-status-select"
              value={status}
              onChange={handleStatusChange}
              aria-label="Booking status"
            >
              <option value="accepted">
                Accepted
              </option>
              <option value="confirmed">
                Confirmed
              </option>
              <option value="completed">
                Completed
              </option>
              <option value="cancelled">
                Cancelled
              </option>
            </select>
          )}

          {status === "confirmed" && onStatusChange && (
            <select
              className="booking-status-select"
              value={status}
              onChange={handleStatusChange}
              aria-label="Booking status"
            >
              <option value="confirmed">
                Confirmed
              </option>
              <option value="completed">
                Completed
              </option>
              <option value="cancelled">
                Cancelled
              </option>
            </select>
          )}

          {onDelete && (
            <button
              type="button"
              className="booking-delete-button"
              onClick={handleDelete}
              disabled={!bookingId}
            >
              <span
                className="booking-delete-icon"
                aria-hidden="true"
              >
                🗑
              </span>

              <span>Delete</span>
            </button>
          )}
        </div>
      )}
    </article>
  );
};

export default BookingCard;