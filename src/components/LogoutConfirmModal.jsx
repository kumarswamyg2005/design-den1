import { useState } from "react";
import "./LogoutConfirmModal.css";

const LogoutConfirmModal = ({
  isOpen,
  onConfirm,
  onCancel,
  userName = "User",
}) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleConfirm = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onConfirm();
    }, 300);
  };

  const handleCancel = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onCancel();
    }, 300);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`logout-confirm-overlay ${isOpen ? "active" : ""} ${
        isClosing ? "closing" : ""
      }`}
      onClick={handleOverlayClick}
    >
      <div
        className={`logout-confirm-modal ${isOpen ? "active" : ""} ${
          isClosing ? "closing" : ""
        }`}
      >
        {/* Animated Icon */}
        <div className="logout-confirm-icon">
          <div className="logout-icon-circle">
            <svg viewBox="0 0 24 24" className="logout-icon-svg">
              <path
                className="logout-icon-path"
                d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polyline
                className="logout-icon-arrow"
                points="16 17 21 12 16 7"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <line
                className="logout-icon-line"
                x1="21"
                y1="12"
                x2="9"
                y2="12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          {/* Decorative rings */}
          <div className="logout-confirm-ring logout-confirm-ring-1"></div>
          <div className="logout-confirm-ring logout-confirm-ring-2"></div>
        </div>

        {/* Content */}
        <div className="logout-confirm-content">
          <h3 className="logout-confirm-title">Leaving so soon?</h3>
          <p className="logout-confirm-message">
            Hey <span className="logout-confirm-username">{userName}</span>, are
            you sure you want to logout?
          </p>
        </div>

        {/* Buttons */}
        <div className="logout-confirm-buttons">
          <button
            className="logout-confirm-btn logout-confirm-btn-cancel"
            onClick={handleCancel}
          >
            <i className="fas fa-arrow-left"></i>
            Stay
          </button>
          <button
            className="logout-confirm-btn logout-confirm-btn-confirm"
            onClick={handleConfirm}
          >
            <i className="fas fa-sign-out-alt"></i>
            Logout
          </button>
        </div>

        {/* Close button */}
        <button className="logout-confirm-close" onClick={handleCancel}>
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path
              d="M18 6L6 18M6 6l12 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default LogoutConfirmModal;
