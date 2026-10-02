import React, { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import foodService from "../services/foodService";

import "./EditFood.css";

const MEALS = [
  "Breakfast",
  "Lunch",
  "Dinner",
  "Sweets",
];

const TYPES = [
  "Veg",
  "Non-Veg",
];

const INITIAL_FORM = {
  name: "",
  tamilName: "",
  meal: "",
  type: "",
  description: "",
  image: "",
  isAvailable: true,
};

const EditFood = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] =
    useState(INITIAL_FORM);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // ==========================================
  // LOAD FOOD
  // ==========================================

  useEffect(() => {
    let mounted = true;

    const loadFood = async () => {
      if (!id) {
        setError(
          "Food ID is missing."
        );
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response =
          await foodService.getFoodById(id);

        const food =
          response?.food ||
          response?.data ||
          response;

        if (!food) {
          throw new Error(
            "Food item was not found."
          );
        }

        if (!mounted) {
          return;
        }

        setFormData({
          name: food.name || "",
          tamilName:
            food.tamilName || "",
          meal: food.meal || "",
          type: food.type || "",
          description:
            food.description || "",
          image: food.image || "",
          isAvailable:
            food.isAvailable !== false,
        });
      } catch (err) {
        console.error(
          "Load food error:",
          err
        );

        if (mounted) {
          setError(
            err?.response?.data
              ?.message ||
              err?.message ||
              "Unable to load food details."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadFood();

    return () => {
      mounted = false;
    };
  }, [id]);

  // ==========================================
  // INPUT CHANGE
  // ==========================================

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // ==========================================
  // AVAILABILITY
  // ==========================================

  const handleAvailabilityChange = (
    event
  ) => {
    setFormData((current) => ({
      ...current,
      isAvailable:
        event.target.checked,
    }));

    setError("");
    setSuccess("");
  };

  // ==========================================
  // VALIDATION
  // ==========================================

  const validateForm = () => {
    const name =
      formData.name.trim();

    const tamilName =
      formData.tamilName.trim();

    const description =
      formData.description.trim();

    const image =
      formData.image.trim();

    if (!name) {
      return "English food name is required.";
    }

    if (name.length < 2) {
      return "Food name must contain at least 2 characters.";
    }

    if (!tamilName) {
      return "Tamil food name is required.";
    }

    if (!formData.meal) {
      return "Please select a meal.";
    }

    if (!formData.type) {
      return "Please select food type.";
    }

    if (description.length > 500) {
      return "Description cannot exceed 500 characters.";
    }

    if (image) {
      try {
        const imageUrl =
          new URL(image);

        if (
          imageUrl.protocol !==
            "http:" &&
          imageUrl.protocol !==
            "https:"
        ) {
          return "Please enter a valid image URL.";
        }
      } catch {
        return "Please enter a valid image URL.";
      }
    }

    return "";
  };

  // ==========================================
  // SAVE CHANGES
  // ==========================================

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const validationError =
      validateForm();

    if (validationError) {
      setError(
        validationError
      );
      return;
    }

    if (!id) {
      setError(
        "Food ID is missing."
      );
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name: formData.name.trim(),
        tamilName:
          formData.tamilName.trim(),
        meal: formData.meal,
        type: formData.type,
        description:
          formData.description.trim(),
        image:
          formData.image.trim(),
        isAvailable:
          Boolean(
            formData.isAvailable
          ),
      };

      await foodService.updateFood(
        id,
        payload
      );

      setSuccess(
        "Food updated successfully."
      );

      setTimeout(() => {
        navigate("/food-menu");
      }, 700);
    } catch (err) {
      console.error(
        "Update food error:",
        err
      );

      setError(
        err?.response?.data
          ?.message ||
          err?.response?.data
            ?.error ||
          err?.message ||
          "Unable to update food. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // CANCEL
  // ==========================================

  const handleCancel = () => {
    if (saving) {
      return;
    }

    navigate("/food-menu");
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="edit-food-page">
        <div className="edit-food-container">

          <div className="edit-food-loading">

            <div className="edit-food-spinner"></div>

            <h2>
              Loading food details...
            </h2>

            <p>
              Please wait while we load
              the selected food.
            </p>

          </div>

        </div>
      </div>
    );
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="edit-food-page">
      <div className="edit-food-container">

        {/* ======================================
            HEADER
        ======================================= */}

        <header className="edit-food-header">

          <div className="edit-food-header-content">

            <span className="edit-food-eyebrow">
              NIVETHA CATERING SERVICE
            </span>

            <h1>
              Edit Food
            </h1>

            <p>
              Update the food details
              shown in the customer menu.
            </p>

          </div>

          <Link
            to="/food-menu"
            className="edit-food-back-button"
          >
            <span>
              ←
            </span>

            Food Menu
          </Link>

        </header>

        {/* ======================================
            ALERTS
        ======================================= */}

        {error && (
          <div
            className="edit-food-alert edit-food-error"
            role="alert"
          >
            <div className="edit-food-alert-icon">
              !
            </div>

            <div className="edit-food-alert-content">
              <strong>
                Unable to save changes
              </strong>

              <span>
                {error}
              </span>
            </div>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
              aria-label="Close error"
            >
              ×
            </button>
          </div>
        )}

        {success && (
          <div
            className="edit-food-alert edit-food-success"
            role="status"
          >
            <div className="edit-food-alert-icon">
              ✓
            </div>

            <div className="edit-food-alert-content">
              <strong>
                Success
              </strong>

              <span>
                {success}
              </span>
            </div>
          </div>
        )}

        {/* ======================================
            FORM
        ======================================= */}

        <form
          className="edit-food-form"
          onSubmit={handleSubmit}
          noValidate
        >

          {/* ====================================
              FOOD INFORMATION
          ===================================== */}

          <section className="edit-food-card">

            <div className="edit-food-card-header">

              <div className="edit-food-card-header-icon">
                🍽️
              </div>

              <div>
                <h2>
                  Food Information
                </h2>

                <p>
                  Update the basic details
                  of this food item.
                </p>
              </div>

            </div>

            <div className="edit-food-form-grid">

              {/* ENGLISH NAME */}

              <div className="edit-food-field">

                <label htmlFor="name">
                  English Food Name
                  <span>*</span>
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={
                    formData.name
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Example: Chicken Biryani"
                  maxLength={100}
                  autoComplete="off"
                  disabled={saving}
                />

                <small>
                  Customer-facing English
                  food name.
                </small>

              </div>

              {/* TAMIL NAME */}

              <div className="edit-food-field">

                <label htmlFor="tamilName">
                  Tamil Food Name
                  <span>*</span>
                </label>

                <input
                  id="tamilName"
                  name="tamilName"
                  type="text"
                  value={
                    formData.tamilName
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="உதாரணம்: சிக்கன் பிரியாணி"
                  maxLength={100}
                  autoComplete="off"
                  disabled={saving}
                />

                <small>
                  Customer-facing Tamil
                  food name.
                </small>

              </div>

              {/* MEAL */}

              <div className="edit-food-field">

                <label htmlFor="meal">
                  Meal
                  <span>*</span>
                </label>

                <select
                  id="meal"
                  name="meal"
                  value={
                    formData.meal
                  }
                  onChange={
                    handleChange
                  }
                  disabled={saving}
                >

                  <option value="">
                    Select Meal
                  </option>

                  {MEALS.map(
                    (meal) => (
                      <option
                        key={meal}
                        value={meal}
                      >
                        {meal}
                      </option>
                    )
                  )}

                </select>

                <small>
                  Select the menu category.
                </small>

              </div>

              {/* TYPE */}

              <div className="edit-food-field">

                <label htmlFor="type">
                  Food Type
                  <span>*</span>
                </label>

                <select
                  id="type"
                  name="type"
                  value={
                    formData.type
                  }
                  onChange={
                    handleChange
                  }
                  disabled={saving}
                >

                  <option value="">
                    Select Food Type
                  </option>

                  {TYPES.map(
                    (type) => (
                      <option
                        key={type}
                        value={type}
                      >
                        {type}
                      </option>
                    )
                  )}

                </select>

                <small>
                  Choose Veg or Non-Veg.
                </small>

              </div>

              {/* IMAGE */}

              <div className="edit-food-field edit-food-full-width">

                <label htmlFor="image">
                  Food Image URL
                </label>

                <input
                  id="image"
                  name="image"
                  type="url"
                  value={
                    formData.image
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="https://example.com/food-image.jpg"
                  autoComplete="off"
                  disabled={saving}
                />

                <small>
                  Optional public image URL.
                </small>

              </div>

              {/* IMAGE PREVIEW */}

              {formData.image.trim() && (
                <div className="edit-food-image-preview edit-food-full-width">

                  <span>
                    Image Preview
                  </span>

                  <div className="edit-food-preview-box">

                    <img
                      src={
                        formData.image.trim()
                      }
                      alt={
                        formData.name ||
                        "Food preview"
                      }
                      onError={(
                        event
                      ) => {
                        event.currentTarget.style.display =
                          "none";
                      }}
                    />

                  </div>

                </div>
              )}

              {/* DESCRIPTION */}

              <div className="edit-food-field edit-food-full-width">

                <label htmlFor="description">
                  Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  value={
                    formData.description
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Example: Premium chicken biryani prepared with aromatic spices..."
                  rows={5}
                  maxLength={500}
                  disabled={saving}
                />

                <div className="edit-food-character-count">
                  {
                    formData.description
                      .length
                  }
                  /500
                </div>

              </div>

            </div>

          </section>

          {/* ====================================
              AVAILABILITY
          ===================================== */}

          <section className="edit-food-card">

            <div className="edit-food-card-header">

              <div className="edit-food-card-header-icon">
                ✓
              </div>

              <div>
                <h2>
                  Food Availability
                </h2>

                <p>
                  Control whether customers
                  can select this food.
                </p>
              </div>

            </div>

            <label className="edit-food-availability">

              <input
                type="checkbox"
                checked={
                  formData.isAvailable
                }
                onChange={
                  handleAvailabilityChange
                }
                disabled={saving}
              />

              <span className="edit-food-toggle">
                <span></span>
              </span>

              <span className="edit-food-availability-text">

                <strong>
                  {formData.isAvailable
                    ? "Available"
                    : "Unavailable"}
                </strong>

                <small>
                  {formData.isAvailable
                    ? "Customers can select this food from the menu."
                    : "Customers cannot select this food until it is enabled."}
                </small>

              </span>

            </label>

          </section>

          {/* ====================================
              ACTIONS
          ===================================== */}

          <div className="edit-food-actions">

            <button
              type="button"
              className="edit-food-cancel-button"
              onClick={
                handleCancel
              }
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="edit-food-submit-button"
              disabled={saving}
            >

              {saving ? (
                <>
                  <span className="edit-food-button-spinner"></span>

                  Saving...
                </>
              ) : (
                <>
                  <span>
                    ✓
                  </span>

                  Save Changes
                </>
              )}

            </button>

          </div>

        </form>

      </div>
    </div>
  );
};

export default EditFood;