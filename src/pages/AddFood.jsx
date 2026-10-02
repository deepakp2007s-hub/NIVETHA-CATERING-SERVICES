import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import foodService from "../services/foodService";

import "./AddFood.css";

const CATEGORIES = [
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
  category: "",
  type: "",
  description: "",
  image: "",
  isAvailable: true,
};

const AddFood = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleAvailabilityChange = (event) => {
    setFormData((current) => ({
      ...current,
      isAvailable: event.target.checked,
    }));

    setError("");
    setSuccess("");
  };

  const validateForm = () => {
    const name = formData.name.trim();
    const tamilName = formData.tamilName.trim();
    const description = formData.description.trim();
    const image = formData.image.trim();

    if (!name) {
      return "English food name is required.";
    }

    if (name.length < 2) {
      return "Food name must contain at least 2 characters.";
    }

    if (!tamilName) {
      return "Tamil food name is required.";
    }

    if (!formData.category) {
      return "Please select a category.";
    }

    if (!formData.type) {
      return "Please select food type.";
    }

    if (description.length > 500) {
      return "Description cannot exceed 500 characters.";
    }

    if (image) {
      try {
        const imageUrl = new URL(image);

        if (
          imageUrl.protocol !== "http:" &&
          imageUrl.protocol !== "https:"
        ) {
          return "Please enter a valid image URL.";
        }
      } catch {
        return "Please enter a valid image URL.";
      }
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
        tamilName: formData.tamilName.trim(),
        category: formData.category,
        type: formData.type,
        description: formData.description.trim(),
        image: formData.image.trim(),
        isAvailable: Boolean(formData.isAvailable),
        displayOrder: 0,
      };

      await foodService.createFood(payload);

      setSuccess("Food added successfully.");

      setFormData({
        ...INITIAL_FORM,
      });

      setTimeout(() => {
        navigate("/food-menu");
      }, 700);
    } catch (err) {
      console.error("Add food error:", err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Unable to add food. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      ...INITIAL_FORM,
    });

    setError("");
    setSuccess("");
  };

  const handleCancel = () => {
    if (loading) {
      return;
    }

    navigate("/food-menu");
  };

  return (
    <div className="add-food-page">
      <div className="add-food-container">

        <header className="add-food-header">
          <div className="add-food-header-content">
            <span className="add-food-eyebrow">
              NIVETHA CATERING SERVICE
            </span>

            <h1>Add Food</h1>

            <p>
              Add a new food item to the customer menu.
            </p>
          </div>

          <Link
            to="/food-menu"
            className="add-food-back-button"
          >
            <span>←</span>
            Food Menu
          </Link>
        </header>

        {error && (
          <div
            className="add-food-alert add-food-error"
            role="alert"
          >
            <div className="add-food-alert-icon">
              !
            </div>

            <div className="add-food-alert-content">
              <strong>
                Unable to save food
              </strong>

              <span>{error}</span>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Close error"
            >
              ×
            </button>
          </div>
        )}

        {success && (
          <div
            className="add-food-alert add-food-success"
            role="status"
          >
            <div className="add-food-alert-icon">
              ✓
            </div>

            <div className="add-food-alert-content">
              <strong>Success</strong>

              <span>{success}</span>
            </div>
          </div>
        )}

        <form
          className="add-food-form"
          onSubmit={handleSubmit}
          noValidate
        >
          <section className="add-food-card">
            <div className="add-food-card-header">
              <div className="add-food-card-header-icon">
                🍽️
              </div>

              <div>
                <h2>Food Information</h2>

                <p>
                  Enter the basic details of the food item.
                </p>
              </div>
            </div>

            <div className="add-food-form-grid">

              <div className="add-food-field">
                <label htmlFor="name">
                  English Food Name
                  <span>*</span>
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Example: Chicken Biryani"
                  maxLength={100}
                  autoComplete="off"
                  disabled={loading}
                />

                <small>
                  Enter the customer-facing English food name.
                </small>
              </div>

              <div className="add-food-field">
                <label htmlFor="tamilName">
                  Tamil Food Name
                  <span>*</span>
                </label>

                <input
                  id="tamilName"
                  name="tamilName"
                  type="text"
                  value={formData.tamilName}
                  onChange={handleChange}
                  placeholder="உதாரணம்: சிக்கன் பிரியாணி"
                  maxLength={100}
                  autoComplete="off"
                  disabled={loading}
                />

                <small>
                  Enter the Tamil name shown to customers.
                </small>
              </div>

              <div className="add-food-field">
                <label htmlFor="category">
                  Category
                  <span>*</span>
                </label>

                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="">
                    Select Category
                  </option>

                  {CATEGORIES.map((item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  ))}
                </select>

                <small>
                  Select the food menu category.
                </small>
              </div>

              <div className="add-food-field">
                <label htmlFor="type">
                  Food Type
                  <span>*</span>
                </label>

                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="">
                    Select Food Type
                  </option>

                  {TYPES.map((item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  ))}
                </select>

                <small>
                  Choose Veg or Non-Veg.
                </small>
              </div>

              <div className="add-food-field add-food-full-width">
                <label htmlFor="image">
                  Food Image URL
                </label>

                <input
                  id="image"
                  name="image"
                  type="url"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="https://example.com/food-image.jpg"
                  autoComplete="off"
                  disabled={loading}
                />

                <small>
                  Optional. Paste a public image URL for the food.
                </small>
              </div>

              <div className="add-food-field add-food-full-width">
                <label htmlFor="description">
                  Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Example: Premium chicken biryani prepared with aromatic spices..."
                  rows={5}
                  maxLength={500}
                  disabled={loading}
                />

                <div className="add-food-character-count">
                  {formData.description.length}/500
                </div>
              </div>

            </div>
          </section>

          <section className="add-food-card">
            <div className="add-food-card-header">
              <div className="add-food-card-header-icon">
                ✓
              </div>

              <div>
                <h2>Food Availability</h2>

                <p>
                  Control whether customers can select this food.
                </p>
              </div>
            </div>

            <label className="add-food-availability">
              <input
                type="checkbox"
                checked={formData.isAvailable}
                onChange={handleAvailabilityChange}
                disabled={loading}
              />

              <span className="add-food-toggle">
                <span></span>
              </span>

              <span className="add-food-availability-text">
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

          <div className="add-food-actions">
            <button
              type="button"
              className="add-food-reset-button"
              onClick={handleReset}
              disabled={loading}
            >
              Reset
            </button>

            <button
              type="button"
              className="add-food-cancel-button"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="add-food-submit-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="add-food-button-spinner"></span>
                  Saving...
                </>
              ) : (
                <>
                  <span>+</span>
                  Add Food
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFood;