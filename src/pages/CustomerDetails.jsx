import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import customerService from "../services/customerService";
import bookingService from "../services/bookingService";
import "./CustomerDetails.css";

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const normalizeList = (response, key) => {
    if (Array.isArray(response)) return response;

    if (Array.isArray(response?.data)) {
      return response.data;
    }

    if (Array.isArray(response?.data?.data)) {
      return response.data.data;
    }

    if (key && Array.isArray(response?.[key])) {
      return response[key];
    }

    if (
      key &&
      Array.isArray(response?.data?.[key])
    ) {
      return response.data[key];
    }

    return [];
  };

  const loadCustomer = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError("");

    try {
      const customerResponse =
        await customerService.getCustomerById(id);

      const customerData =
        customerResponse?.data?.customer ||
        customerResponse?.data?.data ||
        customerResponse?.customer ||
        customerResponse?.data ||
        customerResponse;

      setCustomer(customerData);

      try {
        const bookingsResponse =
          await bookingService.getBookings();

        const allBookings = normalizeList(
          bookingsResponse,
          "bookings"
        );

        const filtered = allBookings.filter(
          (booking) => {
            const bookingCustomer =
              booking?.customer;

            const customerId =
              typeof bookingCustomer === "object"
                ? bookingCustomer?._id ||
                  bookingCustomer?.id
                : bookingCustomer;

            return (
              String(customerId || "") ===
                String(id) ||
              String(
                booking?.customerId || ""
              ) === String(id)
            );
          }
        );

        setBookings(filtered);
      } catch {
        setBookings(
          Array.isArray(customerData?.bookings)
            ? customerData.bookings
            : []
        );
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Unable to load customer details."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadCustomer();
  }, [loadCustomer]);

  const getName = () =>
    customer?.name ||
    customer?.fullName ||
    customer?.customerName ||
    "Customer";

  const getPhone = () =>
    customer?.phone ||
    customer?.mobile ||
    customer?.phoneNumber ||
    "—";

  const getEmail = () =>
    customer?.email || "—";

  const getAddress = () =>
    customer?.address ||
    customer?.location ||
    "—";

  const getFunction = (booking) =>
    booking?.functionType ||
    booking?.function ||
    booking?.eventType ||
    booking?.eventName ||
    "—";

  const getDate = (booking) =>
    booking?.date ||
    booking?.eventDate ||
    booking?.bookingDate ||
    "";

  const getPersons = (booking) =>
    booking?.numberOfPersons ??
    booking?.persons ??
    booking?.guestCount ??
    0;

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="customer-details-page">
        <div className="customer-details-loading">
          <div className="customer-details-spinner"></div>
          <p>Loading customer...</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="customer-details-page">
        <div className="customer-details-error">
          <div className="customer-details-error-icon">
            !
          </div>

          <h2>Customer Not Found</h2>

          <p>
            {error ||
              "The requested customer could not be found."}
          </p>

          <div>
            <button
              type="button"
              onClick={loadCustomer}
            >
              Try Again
            </button>

            <button
              type="button"
              className="secondary"
              onClick={() => navigate("/customers")}
            >
              Back to Customers
            </button>
          </div>
        </div>
      </div>
    );
  }

  const name = getName();

  return (
    <div className="customer-details-page">
      <div className="customer-details-container">
        <div className="customer-details-topbar">
          <Link
            to="/customers"
            className="customer-details-back"
          >
            <span>←</span>
            Back to Customers
          </Link>

          <span className="customer-details-id">
            Customer ID: {customer?._id || customer?.id || id}
          </span>
        </div>

        {error && (
          <div className="customer-details-alert">
            {error}
          </div>
        )}

        <section className="customer-profile-banner">
          <div className="customer-large-avatar">
            {name.charAt(0).toUpperCase()}
          </div>

          <div className="customer-profile-main">
            <span>CUSTOMER PROFILE</span>
            <h1>{name}</h1>

            <div className="customer-contact-row">
              {getPhone() !== "—" && (
                <a href={`tel:${getPhone()}`}>
                  📞 {getPhone()}
                </a>
              )}

              {getEmail() !== "—" && (
                <a href={`mailto:${getEmail()}`}>
                  ✉️ {getEmail()}
                </a>
              )}
            </div>
          </div>
        </section>

        <div className="customer-details-grid">
          <section className="customer-info-card">
            <div className="customer-card-heading">
              <div className="customer-card-icon">
                👤
              </div>

              <div>
                <span>PROFILE</span>
                <h2>Customer Information</h2>
              </div>
            </div>

            <div className="customer-info-list">
              <div>
                <small>Full Name</small>
                <strong>{name}</strong>
              </div>

              <div>
                <small>Phone Number</small>
                <strong>{getPhone()}</strong>
              </div>

              <div>
                <small>Email</small>
                <strong>{getEmail()}</strong>
              </div>

              <div>
                <small>Address</small>
                <strong>{getAddress()}</strong>
              </div>
            </div>
          </section>

          <section className="customer-stat-card">
            <div className="customer-card-heading">
              <div className="customer-card-icon">
                📊
              </div>

              <div>
                <span>SUMMARY</span>
                <h2>Booking Summary</h2>
              </div>
            </div>

            <div className="customer-stat-grid">
              <div>
                <strong>{bookings.length}</strong>
                <small>Total Bookings</small>
              </div>

              <div>
                <strong>
                  {
                    bookings.filter(
                      (booking) =>
                        String(
                          booking?.status || ""
                        ).toLowerCase() ===
                        "confirmed"
                    ).length
                  }
                </strong>
                <small>Confirmed</small>
              </div>

              <div>
                <strong>
                  {
                    bookings.filter(
                      (booking) =>
                        String(
                          booking?.status || ""
                        ).toLowerCase() ===
                        "completed"
                    ).length
                  }
                </strong>
                <small>Completed</small>
              </div>

              <div>
                <strong>
                  {bookings.reduce(
                    (total, booking) =>
                      total + Number(getPersons(booking) || 0),
                    0
                  )}
                </strong>
                <small>Total Persons</small>
              </div>
            </div>
          </section>

          <section className="customer-bookings-card">
            <div className="customer-card-heading">
              <div className="customer-card-icon">
                📅
              </div>

              <div>
                <span>HISTORY</span>
                <h2>Customer Bookings</h2>
              </div>
            </div>

            {bookings.length === 0 ? (
              <div className="customer-bookings-empty">
                <span>📋</span>
                <p>No bookings found for this customer.</p>
              </div>
            ) : (
              <div className="customer-bookings-list">
                {bookings.map(
                  (booking, index) => {
                    const bookingId =
                      booking?._id ||
                      booking?.id ||
                      index;

                    const status = String(
                      booking?.status ||
                        "pending"
                    ).toLowerCase();

                    return (
                      <div
                        className="customer-booking-row"
                        key={bookingId}
                      >
                        <div className="customer-booking-date">
                          <strong>
                            {formatDate(
                              getDate(booking)
                            )}
                          </strong>

                          <small>
                            {booking?.time ||
                              booking?.eventTime ||
                              "—"}
                          </small>
                        </div>

                        <div className="customer-booking-info">
                          <strong>
                            {getFunction(booking)}
                          </strong>

                          <small>
                            {getPersons(booking)} persons
                          </small>
                        </div>

                        <span
                          className={`customer-booking-status status-${status}`}
                        >
                          <i></i>
                          {status}
                        </span>

                        <Link
                          to={`/bookings/${bookingId}`}
                          className="customer-booking-view"
                        >
                          View
                          <span>→</span>
                        </Link>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetails;