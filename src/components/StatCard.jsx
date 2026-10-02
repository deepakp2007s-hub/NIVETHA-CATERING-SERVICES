import React from "react";
import "./StatCard.css";

const StatCard = ({
  title,
  value,
  subtitle,
  icon = "📊",
  variant = "primary",
  trend,
  onClick,
}) => {
  return (
    <div
      className={`anna-stat-card anna-stat-card-${variant} ${
        onClick ? "anna-stat-card-clickable" : ""
      }`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(event) => {
        if (onClick && (event.key === "Enter" || event.key === " ")) {
          onClick();
        }
      }}
    >
      <div className="anna-stat-card-top">
        <div className="anna-stat-icon">{icon}</div>

        {trend && (
          <span
            className={`anna-stat-trend ${
              trend.type === "down" ? "down" : "up"
            }`}
          >
            {trend.type === "down" ? "↓" : "↑"} {trend.value}
          </span>
        )}
      </div>

      <div className="anna-stat-content">
        <span className="anna-stat-title">{title}</span>

        <strong className="anna-stat-value">{value}</strong>

        {subtitle && (
          <span className="anna-stat-subtitle">{subtitle}</span>
        )}
      </div>
    </div>
  );
};

export default StatCard;