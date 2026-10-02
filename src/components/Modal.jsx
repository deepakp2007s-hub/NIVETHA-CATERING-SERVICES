import React, { useEffect } from "react";
import "./Modal.css";

const Modal = ({
  isOpen = false,
  onClose,
  title = "",
  children,
  footer,
  size = "medium",
  closeOnOverlay = true,
  showClose = true,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && onClose) {
        onClose();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (event) => {
    if (
      closeOnOverlay &&
      event.target === event.currentTarget &&
      onClose
    ) {
      onClose();
    }
  };

  return (
    <div
      className="anna-modal-overlay"
      onMouseDown={handleOverlayClick}
      role="presentation"
    >
      <div
        className={`anna-modal anna-modal-${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "anna-modal-title" : undefined}
      >
        <div className="anna-modal-header">
          <div className="anna-modal-title-wrapper">
            {title && (
              <h2 id="anna-modal-title">{title}</h2>
            )}
          </div>

          {showClose && (
            <button
              type="button"
              className="anna-modal-close"
              onClick={onClose}
              aria-label="Close modal"
            >
              ×
            </button>
          )}
        </div>

        <div className="anna-modal-body">
          {children}
        </div>

        {footer && (
          <div className="anna-modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;