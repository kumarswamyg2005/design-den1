/**
 * LoadingSpinner Component
 * Reusable loading spinner that uses Redux UI state
 */

import React from "react";
import { useSelector } from "react-redux";
import { selectGlobalLoading } from "../store/slices/uiSlice";
import "./LoadingSpinner.css";

const LoadingSpinner = ({
  size = "medium",
  message = "Loading...",
  local = false,
}) => {
  const globalLoading = useSelector(selectGlobalLoading);

  // If local prop is true, show only this spinner, otherwise check global state
  const shouldShow = local || globalLoading;

  if (!shouldShow) return null;

  const sizeClass = `spinner-${size}`;

  return (
    <div className={`loading-spinner-container ${local ? "local" : "global"}`}>
      <div className={`loading-spinner ${sizeClass}`}>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
      </div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
