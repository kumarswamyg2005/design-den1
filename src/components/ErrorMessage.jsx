/**
 * ErrorMessage Component
 * Reusable error display component with retry functionality
 */

import React from "react";
import "./ErrorMessage.css";

const ErrorMessage = ({
  error,
  onRetry,
  title = "Error",
  fullPage = false,
}) => {
  if (!error) return null;

  const errorMessage =
    typeof error === "string" ? error : error.message || "An error occurred";

  return (
    <div
      className={`error-message-container ${fullPage ? "full-page" : "inline"}`}
    >
      <div className="error-message-card">
        <div className="error-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h3 className="error-title">{title}</h3>
        <p className="error-text">{errorMessage}</p>
        {onRetry && (
          <button className="btn-retry" onClick={onRetry}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 2v6h-6M3 22v-6h6M21 12c0-4.97-4.03-9-9-9-2.5 0-4.77 1.02-6.4 2.67M3 12c0 4.97 4.03 9 9 9 2.5 0 4.77-1.02 6.4-2.67"></path>
            </svg>
            Retry
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
