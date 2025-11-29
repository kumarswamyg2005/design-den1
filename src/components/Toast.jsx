/**
 * Toast Component
 * Displays toast notifications from Redux UI state
 */

import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectToast, hideToast } from "../store/slices/uiSlice";
import "./Toast.css";

const Toast = () => {
  const dispatch = useDispatch();
  const toast = useSelector(selectToast);

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        dispatch(hideToast());
      }, toast.duration);

      return () => clearTimeout(timer);
    }
  }, [toast.show, toast.duration, dispatch]);

  if (!toast.show) return null;

  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return <i className="fas fa-check-circle"></i>;
      case "error":
        return <i className="fas fa-times-circle"></i>;
      case "warning":
        return <i className="fas fa-exclamation-triangle"></i>;
      case "info":
      default:
        return <i className="fas fa-info-circle"></i>;
    }
  };

  return (
    <div className={`toast-container toast-${toast.type}`}>
      <div className="toast-icon">{getIcon()}</div>
      <div className="toast-message">{toast.message}</div>
      <button
        className="toast-close"
        onClick={() => dispatch(hideToast())}
        aria-label="Close"
      >
        <i className="fas fa-times"></i>
      </button>
    </div>
  );
};

export default Toast;
