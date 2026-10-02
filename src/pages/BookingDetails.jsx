import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import bookingService from "../services/bookingService";

import "./BookingDetails.css";

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  // ==========================================
  // LOAD BOOKING
  // ==========================================

  const loadBooking = useCallback(async () => {
    if (!id) {
      setError("Booking ID is missing.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    setActionMessage("");

    try {
      const response =
        await bookingService.getBookingById(id);

      const data =
        response?.data?.booking ||
        response?.data?.data ||
        response?.booking ||
        response?.data ||
        response;

      if (!data || typeof data !== "object") {
        throw new Error("Booking not found.");
      }

      setBooking(data);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Unable to load booking details."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadBooking();
  }, [loadBooking]);

  // ==========================================
  // BOOKING DATA
  // ==========================================

  const status = String(
    booking?.status || "pending"
  ).toLowerCase();

  const customer = booking?.customer;

  const customerName =
    typeof customer === "string"
      ? customer
      : customer?.name ||
        customer?.fullName ||
        booking?.customerName ||
        "—";

  const customerPhone =
    typeof customer === "object" && customer
      ? customer?.phone ||
        customer?.mobile ||
        customer?.phoneNumber ||
        ""
      : booking?.phone ||
        booking?.mobile ||
        booking?.phoneNumber ||
        "";

  const customerEmail =
    typeof customer === "object" && customer
      ? customer?.email || ""
      : booking?.email || "";

  const functionName =
    booking?.functionType ||
    booking?.eventType ||
    booking?.function ||
    booking?.eventName ||
    "—";

  const bookingDate =
    booking?.eventDate ||
    booking?.date ||
    booking?.bookingDate ||
    "";

  const bookingTime =
    booking?.eventTime ||
    booking?.time ||
    booking?.bookingTime ||
    "—";

  const numberOfPersons =
    booking?.numberOfPersons ??
    booking?.persons ??
    booking?.guestCount ??
    0;

  const location =
    typeof booking?.location === "string"
      ? booking.location
      : booking?.location?.address ||
        booking?.location?.name ||
        booking?.venue ||
        booking?.address ||
        "—";

  const cateringType =
    booking?.cateringType ||
    booking?.cateringService ||
    "";

  const cookingService =
    booking?.cookingService ??
    booking?.services?.cooking ??
    false;

  const servingStaff =
    booking?.servingStaff ??
    booking?.services?.servingStaff ??
    false;

  const notes =
    booking?.extraRequirements ||
    booking?.notes ||
    booking?.requirements ||
    "";

  // ==========================================
  // SELECTED FOODS
  // ==========================================

  const selectedFoods = useMemo(() => {
    if (!Array.isArray(booking?.selectedFoods)) {
      return [];
    }

    return booking.selectedFoods;
  }, [booking]);

  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (value) => {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // ==========================================
  // FOOD HELPERS
  // ==========================================

  const getFoodName = (item) => {
    const food = item?.food || item?.foodId;

    if (typeof food === "string") {
      return (
        item?.foodName ||
        item?.name ||
        food
      );
    }

    return (
      item?.foodName ||
      food?.name ||
      item?.name ||
      "Food Item"
    );
  };

  const getFoodTamilName = (item) => {
    const food = item?.food || item?.foodId;

    if (
      typeof food === "object" &&
      food
    ) {
      return (
        item?.tamilName ||
        food?.tamilName ||
        ""
      );
    }

    return item?.tamilName || "";
  };

  const getFoodImage = (item) => {
    const food = item?.food || item?.foodId;

    if (
      typeof food === "object" &&
      food
    ) {
      return (
        item?.image ||
        food?.image ||
        ""
      );
    }

    return item?.image || "";
  };

  const getFoodQuantity = (item) => {
    return (
      item?.quantity ??
      item?.qty ??
      1
    );
  };

  // ==========================================
  // UPDATE BOOKING STATUS
  // ==========================================

  const updateStatus = async (nextStatus) => {
    const bookingId =
      booking?._id || booking?.id;

    if (!bookingId || actionLoading || deleteLoading) {
      return;
    }

    setActionLoading(true);
    setError("");
    setActionMessage("");

    try {
      let response;

      if (nextStatus === "accepted") {
        response =
          await bookingService.acceptBooking(
            bookingId
          );
      } else if (nextStatus === "rejected") {
        response =
          await bookingService.rejectBooking(
            bookingId
          );
      } else if (nextStatus === "completed") {
        response =
          await bookingService.completeBooking(
            bookingId
          );
      } else if (nextStatus === "cancelled") {
        response =
          await bookingService.cancelBooking(
            bookingId
          );
      } else {
        response =
          await bookingService.updateBookingStatus(
            bookingId,
            nextStatus
          );
      }

      const updated =
        response?.data?.booking ||
        response?.data?.data ||
        response?.booking ||
        response?.data;

      setBooking((current) => ({
        ...current,
        ...(updated &&
        typeof updated === "object"
          ? updated
          : {}),
        status:
          updated?.status ||
          nextStatus,
      }));

      const messages = {
        accepted:
          "Booking accepted successfully.",
        confirmed:
          "Booking confirmed successfully.",
        rejected:
          "Booking rejected successfully.",
        completed:
          "Booking marked as completed.",
        cancelled:
          "Booking cancelled successfully.",
      };

      setActionMessage(
        messages[nextStatus] ||
          `Booking ${nextStatus} successfully.`
      );
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Unable to update booking status."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================
  // DELETE BOOKING
  // ==========================================

  const deleteBooking = async () => {
    const bookingId =
      booking?._id || booking?.id;

    if (!bookingId || deleteLoading || actionLoading) {
      return;
    }

    const confirmed = window.confirm(
      `Delete Booking?\n\n${customerName}\n${functionName}\n\nThis booking will be permanently deleted from the system.\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setDeleteLoading(true);
    setError("");
    setActionMessage("");

    try {
      await bookingService.deleteBooking(
        bookingId
      );

      navigate("/bookings", {
        replace: true,
        state: {
          message:
            "Booking deleted successfully.",
        },
      });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Unable to delete booking."
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  // ==========================================
  // STATUS LABEL
  // ==========================================

  const getStatusLabel = (value) => {
    const labels = {
      pending: "Pending",
      accepted: "Accepted",
      confirmed: "Confirmed",
      rejected: "Rejected",
      completed: "Completed",
      cancelled: "Cancelled",
    };

    return labels[value] || value;
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="booking-details-page">
        <div className="booking-details-loading">
          <div className="booking-details-spinner"></div>
          <p>Loading booking details...</p>
        </div>
      </div>
    );
  }

  // ==========================================
  // ERROR WITHOUT BOOKING
  // ==========================================

  if (error && !booking) {
    return (
      <div className="booking-details-page">
        <div className="booking-details-error-page">
          <div className="booking-details-error-icon">
            !
          </div>

          <h2>Unable to Load Booking</h2>

          <p>{error}</p>

          <div className="booking-details-error-actions">
            <button
              type="button"
              onClick={loadBooking}
            >
              Try Again
            </button>

            <button
              type="button"
              className="secondary"
              onClick={() =>
                navigate("/bookings")
              }
            >
              Back to Bookings
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // BOOKING NOT FOUND
  // ==========================================

  if (!booking) {
    return (
      <div className="booking-details-page">
        <div className="booking-details-error-page">
          <div className="booking-details-error-icon">
            ?
          </div>

          <h2>Booking Not Found</h2>

          <Link to="/bookings">
            Back to Bookings
          </Link>
        </div>
      </div>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="booking-details-page">
      <div className="booking-details-container">

        {/* TOP BAR */}

        <div className="booking-details-topbar">
          <Link
            to="/bookings"
            className="booking-details-back"
          >
            <span>←</span>
            Back to Bookings
          </Link>

          <span className="booking-details-id">
            Booking ID:{" "}
            {booking?._id ||
              booking?.id ||
              "—"}
          </span>
        </div>

        {/* ERROR */}

        {error && (
          <div className="booking-details-alert error">
            <span>!</span>
            {error}
          </div>
        )}

        {/* SUCCESS */}

        {actionMessage && (
          <div className="booking-details-alert success">
            <span>✓</span>
            {actionMessage}
          </div>
        )}

        {/* HEADING */}

        <div className="booking-details-heading">
          <div>
            <span className="booking-details-eyebrow">
              BOOKING DETAILS
            </span>

            <h1>{functionName}</h1>

            <p>
              Customer catering order and event
              information
            </p>
          </div>

          <span
            className={`booking-details-status booking-details-status-${status}`}
          >
            <i></i>
            {getStatusLabel(status)}
          </span>
        </div>

        <div className="booking-details-grid">

          {/* CUSTOMER INFORMATION */}

          <section className="booking-details-card customer-card">
            <div className="booking-details-card-heading">
              <div className="booking-details-card-icon">
                👤
              </div>

              <div>
                <span>CUSTOMER</span>
                <h2>Customer Information</h2>
              </div>
            </div>

            <div className="booking-customer-profile">
              <div className="booking-customer-large-avatar">
                {customerName
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div>
                <h3>{customerName}</h3>

                {customerPhone && (
                  <a
                    href={`tel:${customerPhone}`}
                  >
                    {customerPhone}
                  </a>
                )}

                {customerEmail && (
                  <a
                    href={`mailto:${customerEmail}`}
                  >
                    {customerEmail}
                  </a>
                )}
              </div>
            </div>
          </section>

          {/* EVENT INFORMATION */}

          <section className="booking-details-card">
            <div className="booking-details-card-heading">
              <div className="booking-details-card-icon">
                📅
              </div>

              <div>
                <span>EVENT</span>
                <h2>Event Information</h2>
              </div>
            </div>

            <div className="booking-info-grid">
              <div className="booking-info-item">
                <small>Function</small>
                <strong>{functionName}</strong>
              </div>

              <div className="booking-info-item">
                <small>Date</small>
                <strong>
                  {formatDate(bookingDate)}
                </strong>
              </div>

              <div className="booking-info-item">
                <small>Time</small>
                <strong>{bookingTime}</strong>
              </div>

              <div className="booking-info-item">
                <small>Persons</small>
                <strong>
                  {numberOfPersons}
                </strong>
              </div>

              <div className="booking-info-item full">
                <small>Location</small>
                <strong>
                  📍 {location}
                </strong>
              </div>
            </div>
          </section>

          {/* CATERING SERVICE */}

          <section className="booking-details-card">
            <div className="booking-details-card-heading">
              <div className="booking-details-card-icon">
                🍽️
              </div>

              <div>
                <span>SERVICE</span>
                <h2>Catering Service</h2>
              </div>
            </div>

            <div className="booking-service-list">
              <div
                className={`booking-service-item ${
                  cookingService
                    ? "enabled"
                    : "disabled"
                }`}
              >
                <span className="booking-service-check">
                  {cookingService ? "✓" : "×"}
                </span>

                <div>
                  <strong>
                    Cooking Service
                  </strong>

                  <small>
                    {cookingService
                      ? "Requested"
                      : "Not requested"}
                  </small>
                </div>
              </div>

              <div
                className={`booking-service-item ${
                  servingStaff
                    ? "enabled"
                    : "disabled"
                }`}
              >
                <span className="booking-service-check">
                  {servingStaff ? "✓" : "×"}
                </span>

                <div>
                  <strong>
                    Serving Staff
                  </strong>

                  <small>
                    {servingStaff
                      ? "Requested"
                      : "Not requested"}
                  </small>
                </div>
              </div>

              {cateringType && (
                <div className="booking-service-item enabled">
                  <span className="booking-service-check">
                    🍽️
                  </span>

                  <div>
                    <strong>
                      Catering Type
                    </strong>

                    <small>
                      {cateringType}
                    </small>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* SELECTED FOOD */}

          <section className="booking-details-card selected-foods-card">
            <div className="booking-details-card-heading">
              <div className="booking-details-card-icon">
                🍛
              </div>

              <div>
                <span>FOOD ORDER</span>
                <h2>Selected Food Menu</h2>
              </div>

              <strong className="selected-food-count">
                {selectedFoods.length}
              </strong>
            </div>

            {selectedFoods.length === 0 ? (
              <div className="selected-foods-empty">
                <span>🍽️</span>

                <p>
                  No food items selected by
                  customer.
                </p>
              </div>
            ) : (
              <div className="selected-foods-list">
                {selectedFoods.map(
                  (item, index) => {
                    const image =
                      getFoodImage(item);

                    return (
                      <div
                        className="selected-food-item"
                        key={
                          item?._id ||
                          item?.food?._id ||
                          item?.foodId?._id ||
                          index
                        }
                      >
                        <div className="selected-food-image">
                          {image ? (
                            <img
                              src={image}
                              alt={getFoodName(
                                item
                              )}
                              onError={(
                                event
                              ) => {
                                event.currentTarget.style.display =
                                  "none";
                              }}
                            />
                          ) : (
                            <span>🍛</span>
                          )}
                        </div>

                        <div className="selected-food-info">
                          <strong>
                            {getFoodName(item)}
                          </strong>

                          {getFoodTamilName(
                            item
                          ) && (
                            <small>
                              {getFoodTamilName(
                                item
                              )}
                            </small>
                          )}
                        </div>

                        <div className="selected-food-quantity">
                          <small>Qty</small>

                          <strong>
                            ×{" "}
                            {getFoodQuantity(
                              item
                            )}
                          </strong>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </section>

          {/* EXTRA REQUIREMENTS */}

          {notes && (
            <section className="booking-details-card notes-card">
              <div className="booking-details-card-heading">
                <div className="booking-details-card-icon">
                  📝
                </div>

                <div>
                  <span>REQUIREMENTS</span>
                  <h2>Extra Requirements</h2>
                </div>
              </div>

              <div className="booking-notes">
                {notes}
              </div>
            </section>
          )}

          {/* STATUS ACTIONS */}

          <section className="booking-details-card action-card">
            <div className="booking-details-card-heading">
              <div className="booking-details-card-icon">
                ⚙️
              </div>

              <div>
                <span>BOOKING ACTION</span>
                <h2>Update Status</h2>
              </div>
            </div>

            <div className="booking-action-buttons">

              {status === "pending" && (
                <>
                  <button
                    type="button"
                    className="booking-action confirm"
                    disabled={
                      actionLoading ||
                      deleteLoading
                    }
                    onClick={() =>
                      updateStatus("accepted")
                    }
                  >
                    <span>✓</span>

                    {actionLoading
                      ? "Updating..."
                      : "Accept Booking"}
                  </button>

                  <button
                    type="button"
                    className="booking-action reject"
                    disabled={
                      actionLoading ||
                      deleteLoading
                    }
                    onClick={() =>
                      updateStatus("rejected")
                    }
                  >
                    <span>×</span>
                    Reject Booking
                  </button>
                </>
              )}

              {status === "accepted" && (
                <>
                  <button
                    type="button"
                    className="booking-action confirm"
                    disabled={
                      actionLoading ||
                      deleteLoading
                    }
                    onClick={() =>
                      updateStatus("confirmed")
                    }
                  >
                    <span>✓</span>

                    {actionLoading
                      ? "Updating..."
                      : "Confirm Booking"}
                  </button>

                  <button
                    type="button"
                    className="booking-action reject"
                    disabled={
                      actionLoading ||
                      deleteLoading
                    }
                    onClick={() =>
                      updateStatus("cancelled")
                    }
                  >
                    <span>×</span>
                    Cancel Booking
                  </button>
                </>
              )}

              {status === "confirmed" && (
                <>
                  <button
                    type="button"
                    className="booking-action complete"
                    disabled={
                      actionLoading ||
                      deleteLoading
                    }
                    onClick={() =>
                      updateStatus("completed")
                    }
                  >
                    <span>✓</span>

                    {actionLoading
                      ? "Updating..."
                      : "Mark Completed"}
                  </button>

                  <button
                    type="button"
                    className="booking-action reject"
                    disabled={
                      actionLoading ||
                      deleteLoading
                    }
                    onClick={() =>
                      updateStatus("cancelled")
                    }
                  >
                    <span>×</span>
                    Cancel Booking
                  </button>
                </>
              )}

              {status === "rejected" && (
                <button
                  type="button"
                  className="booking-action confirm"
                  disabled={
                    actionLoading ||
                    deleteLoading
                  }
                  onClick={() =>
                    updateStatus("accepted")
                  }
                >
                  <span>✓</span>

                  {actionLoading
                    ? "Updating..."
                    : "Accept Again"}
                </button>
              )}

              {status === "cancelled" && (
                <button
                  type="button"
                  className="booking-action confirm"
                  disabled={
                    actionLoading ||
                    deleteLoading
                  }
                  onClick={() =>
                    updateStatus("accepted")
                  }
                >
                  <span>✓</span>

                  {actionLoading
                    ? "Updating..."
                    : "Accept Again"}
                </button>
              )}

              {status === "completed" && (
                <div className="booking-completed-message">
                  <span>✓</span>
                  This booking has been completed.
                </div>
              )}

            </div>

            {/* PERMANENT DELETE */}

            <div className="booking-permanent-delete">
              <div className="booking-permanent-delete-info">
                <strong>Permanent Delete</strong>
                <span>
                  Permanently remove this booking
                  from the system.
                </span>
              </div>

              <button
                type="button"
                className="booking-permanent-delete-button"
                onClick={deleteBooking}
                disabled={
                  actionLoading ||
                  deleteLoading
                }
              >
                {deleteLoading ? (
                  <>
                    <span className="booking-delete-spinner" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <span aria-hidden="true">
                      🗑
                    </span>
                    Delete Booking
                  </>
                )}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;