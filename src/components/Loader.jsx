import React from "react";
import "./Loader.css";

const Loader = ({
  message = "Loading...",
  fullScreen = false,
  size = "medium",
}) => {
  return (
    <div
      className={`anna-loader ${
        fullScreen ? "anna-loader-fullscreen" : ""
      } anna-loader-${size}`}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div className="anna-loader-spinner">
        <span />
        <span />
        <span />
      </div>

      {message && (
        <p className="anna-loader-message">{message}</p>
      )}
    </div>
  );
};

export default Loader;