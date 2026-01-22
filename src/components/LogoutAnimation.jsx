import { useEffect, useState, useRef } from "react";
import "./LogoutAnimation.css";

const LogoutAnimation = ({ isVisible, onComplete, userName = "User" }) => {
  const [phase, setPhase] = useState(0);
  const wasVisibleRef = useRef(false);

  useEffect(() => {
    console.log("LogoutAnimation: isVisible =", isVisible);

    if (isVisible && !wasVisibleRef.current) {
      console.log("LogoutAnimation: Starting animation");
      wasVisibleRef.current = true;
      setPhase(0);

      // Smooth animation sequence
      const timer1 = setTimeout(() => setPhase(1), 50);
      const timer2 = setTimeout(() => setPhase(2), 400);
      const timer3 = setTimeout(() => setPhase(3), 800);
      const timer4 = setTimeout(() => setPhase(4), 1200);
      const timer5 = setTimeout(() => {
        console.log("LogoutAnimation: Animation complete, calling onComplete");
        if (onComplete) onComplete();
      }, 2800);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(timer4);
        clearTimeout(timer5);
      };
    } else if (!isVisible && wasVisibleRef.current) {
      wasVisibleRef.current = false;
      const resetTimer = setTimeout(() => setPhase(0), 100);
      return () => clearTimeout(resetTimer);
    }
    return undefined;
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div className={`logout-overlay ${phase >= 1 ? "active" : ""}`}>
      {/* Floating particles background */}
      <div className="logout-particles">
        {[...Array(12)].map((_, i) => (
          <div key={i} className={`particle particle-${i + 1}`} />
        ))}
      </div>

      <div className={`logout-card ${phase >= 1 ? "show" : ""}`}>
        {/* Glowing background effect */}
        <div className="card-glow" />

        {/* Success Icon */}
        <div className={`logout-icon-wrapper ${phase >= 2 ? "animate" : ""}`}>
          <div className="icon-bg" />
          <div className="icon-ring" />
          <div className="icon-ring ring-2" />

          <div className={`success-icon ${phase >= 3 ? "show" : ""}`}>
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M5 13l4 4L19 7"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="check-path"
              />
            </svg>
          </div>
        </div>

        {/* Message */}
        <div className={`logout-message ${phase >= 3 ? "show" : ""}`}>
          <h2>Goodbye!</h2>
          <p>
            See you soon, <span className="user-name">{userName}</span>
          </p>
        </div>

        {/* Animated wave divider */}
        <div className={`wave-divider ${phase >= 4 ? "show" : ""}`}>
          <svg viewBox="0 0 200 20" preserveAspectRatio="none">
            <path
              d="M0,10 C30,5 70,15 100,10 C130,5 170,15 200,10"
              stroke="url(#waveGradient)"
              strokeWidth="2"
              fill="none"
              className="wave-path"
            />
            <defs>
              <linearGradient
                id="waveGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Progress indicator */}
        <div className={`logout-progress ${phase >= 4 ? "animate" : ""}`}>
          <div className="progress-track">
            <div className="progress-fill" />
            <div className="progress-glow" />
          </div>
          <span className="progress-text">Signing out...</span>
        </div>
      </div>
    </div>
  );
};

export default LogoutAnimation;
