import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link } from "react-router-dom";

import customerService from "../services/customerService";

import "./Customers.css";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState(null);

  const normalizeCustomers = useCallback((response) => {
    if (Array.isArray(response)) return response;

    if (Array.isArray(response?.data)) {
      return response.data;
    }

    if (Array.isArray(response?.data?.data)) {
      return response.data.data;
    }

    if (Array.isArray(response?.customers)) {
      return response.customers;
    }

    if (Array.isArray(response?.data?.customers)) {
      return response.data.customers;
    }

    return [];
  }, []);

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await customerService.getCustomers();

      setCustomers(normalizeCustomers(response));
    } catch (err) {
      console.error("Load Customers Error:", err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Unable to load customers."
      );
    } finally {
      setLoading(false);
    }
  }, [normalizeCustomers]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const getName = (customer) =>
    customer?.name ||
    customer?.fullName ||
    customer?.customerName ||
    "Unknown Customer";

  const getPhone = (customer) =>
    customer?.phone ||
    customer?.mobile ||
    customer?.phoneNumber ||
    "—";

  const getEmail = (customer) =>
    customer?.email || "—";

  const getLocation = (customer) =>
    customer?.address ||
    customer?.location ||
    customer?.city ||
    "—";

  const getBookings = (customer) =>
    customer?.bookingCount ??
    customer?.totalBookings ??
    customer?.bookings?.length ??
    0;

  const getCustomerId = (customer, index) =>
    customer?._id ||
    customer?.id ||
    customer?.customerId ||
    index;

  const handleDeleteCustomer = useCallback(
    async (customer, index) => {
      const customerId = getCustomerId(customer, index);

      if (
        customerId === undefined ||
        customerId === null ||
        customerId === ""
      ) {
        setError("Customer ID is missing.");
        return;
      }

      const customerName = getName(customer);

      const confirmed = window.confirm(
        `Delete Customer?\n\n${customerName}\n\nThis customer will be permanently deleted. This action cannot be undone.`
      );

      if (!confirmed) {
        return;
      }

      setDeleteId(String(customerId));
      setError("");

      try {
        await customerService.deleteCustomer(customerId);

        setCustomers((currentCustomers) =>
          currentCustomers.filter(
            (item, itemIndex) =>
              String(getCustomerId(item, itemIndex)) !==
              String(customerId)
          )
        );
      } catch (err) {
        console.error("Delete Customer Error:", err);

        setError(
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            "Unable to delete customer."
        );
      } finally {
        setDeleteId(null);
      }
    },
    []
  );

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return customers;
    }

    return customers.filter((customer) => {
      const searchableText = [
        getName(customer),
        getPhone(customer),
        getEmail(customer),
        getLocation(customer),
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [customers, search]);

  const totalBookings = useMemo(() => {
    return customers.reduce(
      (total, customer) =>
        total + Number(getBookings(customer) || 0),
      0
    );
  }, [customers]);

  return (
    <div className="customers-page">
      <div className="customers-container">

        {/* ================================
            PAGE HEADER
        ================================= */}

        <div className="customers-header">
          <div className="customers-header-content">
            <span className="customers-eyebrow">
              CUSTOMER MANAGEMENT
            </span>

            <h1>Customers</h1>

            <p>
              View and manage your catering customers.
            </p>
          </div>
        </div>

        {/* ================================
            SUMMARY CARDS
        ================================= */}

        <div className="customers-summary">

          <div className="customers-summary-card">
            <div className="customers-summary-icon">
              👥
            </div>

            <div>
              <small>Total Customers</small>

              <strong>
                {customers.length}
              </strong>
            </div>
          </div>

          <div className="customers-summary-card">
            <div className="customers-summary-icon">
              📋
            </div>

            <div>
              <small>Total Bookings</small>

              <strong>
                {totalBookings}
              </strong>
            </div>
          </div>

          <div className="customers-summary-card">
            <div className="customers-summary-icon">
              🔎
            </div>

            <div>
              <small>Showing</small>

              <strong>
                {filteredCustomers.length}
              </strong>
            </div>
          </div>

        </div>

        {/* ================================
            SEARCH
        ================================= */}

        <div className="customers-toolbar">
          <div className="customers-search">

            <span
              className="customers-search-icon"
              aria-hidden="true"
            >
              ⌕
            </span>

            <input
              type="search"
              placeholder="Search customer, phone, email..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              aria-label="Search customers"
            />

            {search && (
              <button
                type="button"
                className="customers-search-clear"
                onClick={() => setSearch("")}
                aria-label="Clear customer search"
              >
                ×
              </button>
            )}

          </div>
        </div>

        {/* ================================
            ERROR
        ================================= */}

        {error && (
          <div
            className="customers-error"
            role="alert"
          >
            <div className="customers-error-content">

              <span className="customers-error-icon">
                !
              </span>

              <div>
                <strong>
                  Customer operation failed
                </strong>

                <span>{error}</span>
              </div>

            </div>

            <button
              type="button"
              onClick={loadCustomers}
            >
              Try Again
            </button>

          </div>
        )}

        {/* ================================
            LOADING
        ================================= */}

        {loading ? (
          <div className="customers-loading">

            <div
              className="customers-spinner"
              aria-hidden="true"
            />

            <h3>Loading customers...</h3>

            <p>
              Please wait while customer information
              is loading.
            </p>

          </div>
        ) : filteredCustomers.length === 0 ? (

          /* ================================
             EMPTY STATE
          ================================= */

          <div className="customers-empty">

            <div className="customers-empty-icon">
              👥
            </div>

            <h2>
              {search
                ? "No customers found"
                : "No customers yet"}
            </h2>

            <p>
              {search
                ? "Try a different search."
                : "Customer information will appear here after bookings are created."}
            </p>

            {search && (
              <button
                type="button"
                className="customers-clear-search"
                onClick={() => setSearch("")}
              >
                Clear Search
              </button>
            )}

          </div>

        ) : (

          /* ================================
             CUSTOMER LIST
          ================================= */

          <section className="customers-panel">

            <div className="customers-panel-heading">

              <div>
                <span>CUSTOMER LIST</span>

                <h2>
                  {filteredCustomers.length}{" "}
                  {filteredCustomers.length === 1
                    ? "Customer"
                    : "Customers"}
                </h2>
              </div>

              {search && (
                <span className="customers-filter-info">
                  Search: "{search}"
                </span>
              )}

            </div>

            {/* ==============================
                DESKTOP TABLE
            ================================= */}

            <div className="customers-table-wrapper">

              <table className="customers-table">

                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Location</th>
                    <th>Bookings</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>

                  {filteredCustomers.map(
                    (customer, index) => {

                      const customerId =
                        getCustomerId(
                          customer,
                          index
                        );

                      const name =
                        getName(customer);

                      const isDeleting =
                        deleteId !== null &&
                        String(deleteId) ===
                          String(customerId);

                      return (
                        <tr
                          key={customerId}
                        >

                          <td>
                            <div className="customer-profile">

                              <span className="customer-avatar">
                                {name
                                  .charAt(0)
                                  .toUpperCase()}
                              </span>

                              <div className="customer-profile-text">

                                <strong>
                                  {name}
                                </strong>

                                {customer?.customerId && (
                                  <small>
                                    ID:{" "}
                                    {
                                      customer.customerId
                                    }
                                  </small>
                                )}

                              </div>

                            </div>
                          </td>

                          <td>
                            <span className="customer-phone">
                              {getPhone(
                                customer
                              )}
                            </span>
                          </td>

                          <td>
                            <span className="customer-email">
                              {getEmail(
                                customer
                              )}
                            </span>
                          </td>

                          <td>
                            <span className="customer-location">

                              <span aria-hidden="true">
                                📍
                              </span>

                              {getLocation(
                                customer
                              )}

                            </span>
                          </td>

                          <td>
                            <span className="customer-booking-count">
                              {getBookings(
                                customer
                              )}
                            </span>
                          </td>

                          <td>

                            <div className="customers-actions">

                              <Link
                                to={`/customers/${customerId}`}
                                className="customer-view-button"
                              >
                                <span>View</span>

                                <span aria-hidden="true">
                                  →
                                </span>
                              </Link>

                              <button
                                type="button"
                                className="customer-delete-button"
                                onClick={() =>
                                  handleDeleteCustomer(
                                    customer,
                                    index
                                  )
                                }
                                disabled={
                                  deleteId !== null
                                }
                                title="Delete Customer"
                              >
                                {isDeleting ? (
                                  <>
                                    <span className="customer-delete-spinner" />
                                    <span>
                                      Deleting...
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <span aria-hidden="true">
                                      🗑
                                    </span>

                                    <span>
                                      Delete
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

            {/* ==============================
                MOBILE CARDS
            ================================= */}

            <div className="customers-mobile-list">

              {filteredCustomers.map(
                (customer, index) => {

                  const customerId =
                    getCustomerId(
                      customer,
                      index
                    );

                  const name =
                    getName(customer);

                  const isDeleting =
                    deleteId !== null &&
                    String(deleteId) ===
                      String(customerId);

                  return (
                    <article
                      className="customer-mobile-card"
                      key={customerId}
                    >

                      <div className="customer-mobile-top">

                        <div className="customer-profile">

                          <span className="customer-avatar">
                            {name
                              .charAt(0)
                              .toUpperCase()}
                          </span>

                          <div className="customer-profile-text">

                            <strong>
                              {name}
                            </strong>

                            <small>
                              {getPhone(
                                customer
                              )}
                            </small>

                          </div>

                        </div>

                        <div className="customer-mobile-count-box">

                          <small>
                            Bookings
                          </small>

                          <span className="customer-mobile-count">
                            {getBookings(
                              customer
                            )}
                          </span>

                        </div>

                      </div>

                      <div className="customer-mobile-info">

                        <div>
                          <small>Email</small>

                          <strong>
                            {getEmail(
                              customer
                            )}
                          </strong>
                        </div>

                        <div>
                          <small>Location</small>

                          <strong>
                            {getLocation(
                              customer
                            )}
                          </strong>
                        </div>

                      </div>

                      <div className="customer-mobile-actions">

                        <Link
                          to={`/customers/${customerId}`}
                          className="customer-mobile-view"
                        >
                          <span>
                            View Customer
                          </span>

                          <span aria-hidden="true">
                            →
                          </span>
                        </Link>

                        <button
                          type="button"
                          className="customer-mobile-delete"
                          onClick={() =>
                            handleDeleteCustomer(
                              customer,
                              index
                            )
                          }
                          disabled={
                            deleteId !== null
                          }
                        >
                          {isDeleting ? (
                            <>
                              <span className="customer-delete-spinner" />

                              <span>
                                Deleting...
                              </span>
                            </>
                          ) : (
                            <>
                              <span aria-hidden="true">
                                🗑
                              </span>

                              <span>
                                Delete
                              </span>
                            </>
                          )}
                        </button>

                      </div>

                    </article>
                  );
                }
              )}

            </div>

          </section>
        )}
      </div>
    </div>
  );
};

export default Customers;