import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link } from "react-router-dom";

import foodService from "../services/foodService";

import "./FoodMenu.css";

const MEALS = [
  "all",
  "Breakfast",
  "Lunch",
  "Dinner",
  "Sweets",
];

const TYPES = [
  "all",
  "Veg",
  "Non-Veg",
];

const FoodMenu = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [meal, setMeal] = useState("all");
  const [type, setType] = useState("all");
  const [availability, setAvailability] =
    useState("all");

  // =====================================================
  // NORMALIZE FOODS
  // =====================================================

  const normalizeFoods = (response) => {
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response?.data)) {
      return response.data;
    }

    if (Array.isArray(response?.data?.data)) {
      return response.data.data;
    }

    if (Array.isArray(response?.foods)) {
      return response.foods;
    }

    if (Array.isArray(response?.data?.foods)) {
      return response.data.foods;
    }

    return [];
  };

  // =====================================================
  // LOAD FOODS
  // =====================================================

  const loadFoods = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response =
        await foodService.getFoods();

      setFoods(normalizeFoods(response));
    } catch (err) {
      console.error(
        "Load foods error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Unable to load food menu."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFoods();
  }, [loadFoods]);

  // =====================================================
  // FOOD HELPERS
  // =====================================================

  const getFoodName = (food) =>
    food?.name ||
    food?.foodName ||
    "Unnamed Food";

  const getTamilName = (food) =>
    food?.tamilName ||
    food?.nameTamil ||
    "";

  const getMeal = (food) =>
    String(
      food?.meal ||
        food?.category ||
        "Other"
    ).trim();

  const getType = (food) =>
    String(
      food?.type ||
        food?.foodType ||
        ""
    ).trim();

  const getImage = (food) =>
    food?.image ||
    food?.imageUrl ||
    food?.photo ||
    "";

  const isAvailable = (food) => {
    if (
      typeof food?.isAvailable ===
      "boolean"
    ) {
      return food.isAvailable;
    }

    if (
      typeof food?.available ===
      "boolean"
    ) {
      return food.available;
    }

    if (
      typeof food?.status === "string"
    ) {
      return (
        food.status.toLowerCase() ===
        "active"
      );
    }

    return true;
  };

  // =====================================================
  // FILTERED FOODS
  // =====================================================

  const filteredFoods = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return foods.filter((food) => {
      const foodName =
        getFoodName(food);

      const tamilName =
        getTamilName(food);

      const foodMeal =
        getMeal(food);

      const foodType =
        getType(food);

      const description =
        food?.description || "";

      const matchesSearch =
        !query ||
        [
          foodName,
          tamilName,
          foodMeal,
          foodType,
          description,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);

      const matchesMeal =
        meal === "all" ||
        foodMeal.toLowerCase() ===
          meal.toLowerCase();

      const matchesType =
        type === "all" ||
        foodType.toLowerCase() ===
          type.toLowerCase();

      const available =
        isAvailable(food);

      const matchesAvailability =
        availability === "all" ||
        (availability ===
          "available" &&
          available) ||
        (availability ===
          "unavailable" &&
          !available);

      return (
        matchesSearch &&
        matchesMeal &&
        matchesType &&
        matchesAvailability
      );
    });
  }, [
    foods,
    search,
    meal,
    type,
    availability,
  ]);

  // =====================================================
  // TOGGLE AVAILABILITY
  // =====================================================

  const handleAvailability = async (
    food
  ) => {
    const id =
      food?._id || food?.id;

    if (!id) {
      setError(
        "Food ID is missing."
      );
      return;
    }

    setActionLoading(id);
    setError("");

    try {
      /*
       * CURRENT API:
       * PATCH /api/foods/:id/toggle
       *
       * foodService:
       * toggleFoodAvailability(foodId)
       */
      const response =
        await foodService.toggleFoodAvailability(
          id
        );

      /*
       * Try to read the updated food
       * from the API response.
       */
      const updatedFood =
        response?.food ||
        response?.data?.food ||
        (
          response?.data &&
          typeof response.data ===
            "object" &&
          !Array.isArray(
            response.data
          )
            ? response.data
            : null
        );

      const currentAvailable =
        isAvailable(food);

      const nextValue =
        typeof updatedFood?.isAvailable ===
        "boolean"
          ? updatedFood.isAvailable
          : !currentAvailable;

      setFoods((current) =>
        current.map((item) => {
          const itemId =
            item?._id || item?.id;

          if (
            String(itemId) !==
            String(id)
          ) {
            return item;
          }

          return {
            ...item,
            ...(updatedFood || {}),
            isAvailable:
              nextValue,
            available:
              nextValue,
            status: nextValue
              ? "active"
              : "inactive",
          };
        })
      );
    } catch (err) {
      console.error(
        "Toggle food availability error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Unable to update food availability."
      );
    } finally {
      setActionLoading("");
    }
  };

  // =====================================================
  // DELETE FOOD
  // =====================================================

  const handleDelete = async (
    food
  ) => {
    const id =
      food?._id || food?.id;

    if (!id) {
      setError(
        "Food ID is missing."
      );
      return;
    }

    const confirmed =
      window.confirm(
        `Delete "${getFoodName(
          food
        )}" from the menu?`
      );

    if (!confirmed) {
      return;
    }

    setActionLoading(id);
    setError("");

    try {
      await foodService.deleteFood(
        id
      );

      setFoods((current) =>
        current.filter((item) => {
          const itemId =
            item?._id || item?.id;

          return (
            String(itemId) !==
            String(id)
          );
        })
      );
    } catch (err) {
      console.error(
        "Delete food error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Unable to delete food."
      );
    } finally {
      setActionLoading("");
    }
  };

  // =====================================================
  // STATS
  // =====================================================

  const totalAvailable =
    foods.filter(isAvailable).length;

  const totalUnavailable =
    foods.length -
    totalAvailable;

  // =====================================================
  // CLEAR FILTERS
  // =====================================================

  const clearFilters = () => {
    setSearch("");
    setMeal("all");
    setType("all");
    setAvailability("all");
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="food-menu-page">
      <div className="food-menu-container">

        {/* HEADER */}

        <div className="food-menu-header">
          <div>
            <span className="food-menu-eyebrow">
              NIVETHA CATERING SERVICE
            </span>

            <h1>
              Food Menu
            </h1>

            <p>
              Manage Breakfast, Lunch,
              Dinner and Sweet food
              items available to
              customers.
            </p>
          </div>

          <Link
            to="/food-menu/add"
            className="food-menu-add-button"
          >
            <span>+</span>
            Add Food
          </Link>
        </div>

        {/* STATS */}

        <div className="food-menu-stats">

          <div className="food-menu-stat">
            <div className="food-menu-stat-icon">
              🍽️
            </div>

            <div>
              <small>
                Total Foods
              </small>

              <strong>
                {foods.length}
              </strong>
            </div>
          </div>

          <div className="food-menu-stat">
            <div className="food-menu-stat-icon">
              ✓
            </div>

            <div>
              <small>
                Available
              </small>

              <strong>
                {totalAvailable}
              </strong>
            </div>
          </div>

          <div className="food-menu-stat">
            <div className="food-menu-stat-icon">
              ×
            </div>

            <div>
              <small>
                Unavailable
              </small>

              <strong>
                {totalUnavailable}
              </strong>
            </div>
          </div>

        </div>

        {/* TOOLBAR */}

        <div className="food-menu-toolbar">

          <div className="food-menu-search">
            <span>⌕</span>

            <input
              type="search"
              placeholder="Search food name..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />

            {search && (
              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          <div className="food-menu-filters">

            {/* MEAL */}

            <select
              value={meal}
              onChange={(event) =>
                setMeal(
                  event.target.value
                )
              }
            >
              {MEALS.map((item) => (
                <option
                  value={item}
                  key={item}
                >
                  {item === "all"
                    ? "All Meals"
                    : item}
                </option>
              ))}
            </select>

            {/* TYPE */}

            <select
              value={type}
              onChange={(event) =>
                setType(
                  event.target.value
                )
              }
            >
              {TYPES.map((item) => (
                <option
                  value={item}
                  key={item}
                >
                  {item === "all"
                    ? "Veg & Non-Veg"
                    : item}
                </option>
              ))}
            </select>

            {/* AVAILABILITY */}

            <select
              value={availability}
              onChange={(event) =>
                setAvailability(
                  event.target.value
                )
              }
            >
              <option value="all">
                All Status
              </option>

              <option value="available">
                Available
              </option>

              <option value="unavailable">
                Unavailable
              </option>
            </select>

          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div className="food-menu-error">
            <span>{error}</span>

            <button
              type="button"
              onClick={loadFoods}
            >
              Try Again
            </button>
          </div>
        )}

        {/* LOADING */}

        {loading ? (
          <div className="food-menu-loading">
            <div className="food-menu-spinner"></div>

            <p>
              Loading food menu...
            </p>
          </div>
        ) : filteredFoods.length ===
          0 ? (
          <div className="food-menu-empty">

            <div className="food-menu-empty-icon">
              🍽️
            </div>

            <h2>
              {foods.length === 0
                ? "No food items yet"
                : "No matching foods"}
            </h2>

            <p>
              {foods.length === 0
                ? "Add your first food item to start building the customer menu."
                : "Try changing the search or filters."}
            </p>

            {foods.length === 0 ? (
              <Link
                to="/food-menu/add"
                className="food-menu-empty-button"
              >
                Add First Food
              </Link>
            ) : (
              <button
                type="button"
                className="food-menu-empty-button"
                onClick={
                  clearFilters
                }
              >
                Clear Filters
              </button>
            )}

          </div>
        ) : (
          <>
            {/* RESULT BAR */}

            <div className="food-menu-result-bar">
              <span>
                Showing{" "}
                <strong>
                  {filteredFoods.length}
                </strong>{" "}
                food items
              </span>

              <button
                type="button"
                onClick={
                  loadFoods
                }
              >
                ↻ Refresh
              </button>
            </div>

            {/* FOOD GRID */}

            <div className="food-menu-grid">

              {filteredFoods.map(
                (food, index) => {
                  const id =
                    food?._id ||
                    food?.id ||
                    index;

                  const available =
                    isAvailable(
                      food
                    );

                  const image =
                    getImage(food);

                  const name =
                    getFoodName(
                      food
                    );

                  const tamilName =
                    getTamilName(
                      food
                    );

                  const foodMeal =
                    getMeal(food);

                  const foodType =
                    getType(food);

                  return (
                    <article
                      className={`food-menu-card ${
                        !available
                          ? "food-unavailable"
                          : ""
                      }`}
                      key={id}
                    >

                      {/* IMAGE */}

                      <div className="food-menu-image">

                        {image ? (
                          <img
                            src={image}
                            alt={name}
                            onError={(
                              event
                            ) => {
                              event.currentTarget.style.display =
                                "none";

                              if (
                                event
                                  .currentTarget
                                  .nextElementSibling
                              ) {
                                event
                                  .currentTarget
                                  .nextElementSibling.style.display =
                                  "flex";
                              }
                            }}
                          />
                        ) : null}

                        <div
                          className="food-menu-image-placeholder"
                          style={{
                            display: image
                              ? "none"
                              : "flex",
                          }}
                        >
                          🍛
                        </div>

                        <span
                          className={`food-status ${
                            available
                              ? "available"
                              : "unavailable"
                          }`}
                        >
                          {available
                            ? "Available"
                            : "Unavailable"}
                        </span>

                      </div>

                      {/* BODY */}

                      <div className="food-menu-card-body">

                        <div className="food-menu-card-top">

                          <span className="food-category">
                            {foodMeal}
                          </span>

                          {foodType && (
                            <span
                              className={`food-type ${
                                foodType
                                  .toLowerCase()
                                  .includes(
                                    "non"
                                  )
                                  ? "non-veg"
                                  : "veg"
                              }`}
                            >
                              {foodType}
                            </span>
                          )}

                        </div>

                        <h2>
                          {name}
                        </h2>

                        {tamilName && (
                          <h3>
                            {tamilName}
                          </h3>
                        )}

                        {food?.description && (
                          <p className="food-description">
                            {
                              food.description
                            }
                          </p>
                        )}

                        {/* ACTIONS */}

                        <div className="food-menu-card-actions">

                          <Link
                            to={`/food-menu/edit/${id}`}
                            className="food-edit-button"
                          >
                            Edit
                          </Link>

                          <button
                            type="button"
                            className={`food-toggle-button ${
                              available
                                ? "disable"
                                : "enable"
                            }`}
                            disabled={
                              actionLoading ===
                              id
                            }
                            onClick={() =>
                              handleAvailability(
                                food
                              )
                            }
                          >
                            {actionLoading ===
                            id
                              ? "..."
                              : available
                              ? "Disable"
                              : "Enable"}
                          </button>

                          <button
                            type="button"
                            className="food-delete-button"
                            disabled={
                              actionLoading ===
                              id
                            }
                            onClick={() =>
                              handleDelete(
                                food
                              )
                            }
                          >
                            Delete
                          </button>

                        </div>
                      </div>
                    </article>
                  );
                }
              )}

            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default FoodMenu;