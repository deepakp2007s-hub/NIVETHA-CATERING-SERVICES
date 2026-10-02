import React from "react";
import { useNavigate } from "react-router-dom";
import "./FoodCard.css";

const FoodCard = ({
  food,
  onEdit,
  onDelete,
  onToggleAvailability,
  showActions = true,
}) => {
  const navigate = useNavigate();

  if (!food) return null;

  const foodId = food._id || food.id;

  const name = food.name || "Food Item";
  const tamilName = food.tamilName || "";
  const description = food.description || "Delicious catering special";

  const image =
    food.image ||
    food.imageUrl ||
    "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80";

  const available =
    food.isAvailable !== undefined
      ? food.isAvailable
      : food.available !== undefined
        ? food.available
        : food.status !== "inactive";

  const category = food.category || "Other";

  const handleEdit = () => {
    if (onEdit) {
      onEdit(food);
      return;
    }

    if (foodId) {
      navigate(`/food-menu/edit/${foodId}`);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(food);
    }
  };

  const handleToggle = () => {
    if (onToggleAvailability) {
      onToggleAvailability(food);
    }
  };

  return (
    <article className={`food-card ${!available ? "food-card-disabled" : ""}`}>
      <div className="food-card-image-wrapper">
        <img
          src={image}
          alt={name}
          className="food-card-image"
          loading="lazy"
          onError={(event) => {
            event.currentTarget.src =
              "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80";
          }}
        />

        <span className="food-card-category">{category}</span>

        <span
          className={`food-card-availability ${
            available ? "available" : "unavailable"
          }`}
        >
          {available ? "Available" : "Unavailable"}
        </span>
      </div>

      <div className="food-card-content">
        <div className="food-card-title-row">
          <div className="food-card-title">
            <h3>{name}</h3>

            {tamilName && <span>{tamilName}</span>}
          </div>
        </div>

        <p className="food-card-description">{description}</p>

        {showActions && (
          <div className="food-card-actions">
            <button
              type="button"
              className="food-card-toggle"
              onClick={handleToggle}
              title={available ? "Disable food" : "Enable food"}
            >
              <span
                className={`food-toggle-dot ${
                  available ? "active" : ""
                }`}
              />
              {available ? "Disable" : "Enable"}
            </button>

            <button
              type="button"
              className="food-card-edit"
              onClick={handleEdit}
            >
              Edit
            </button>

            <button
              type="button"
              className="food-card-delete"
              onClick={handleDelete}
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </article>
  );
};

export default FoodCard;