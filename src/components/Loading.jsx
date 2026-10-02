import React from "react";
import "./Loading.css";

const Loading = ({ message = "Loading..." }) => {
  return (
    <div
      className="anna-loading"
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div className="anna-loading-spinner" aria-hidden="true" />

      {message && (
        <p className="anna-loading-message">
          {message}
        </p>
      )}
    </div>
  );
};

export default Loading;