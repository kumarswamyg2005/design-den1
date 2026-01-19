import { useEffect, useState } from "react";
import "./LogoutAnimation.css";

// Pre-generate static particles to avoid impure function calls during render
const STATIC_PARTICLES = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  x: (i * 7) % 100,
  y: (i * 13) % 100,
  size: 5 + (i % 10),
  color: ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"][
    i % 6
  ],
  delay: (i % 5) * 0.1,
  duration: 1 + (i % 10) * 0.1,
}));

const LogoutAnimation = ({ isVisible, onComplete, userName = "User" }) => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (isVisible) {
      // Animation phases
      const timer1 = setTimeout(() => setPhase(1), 100);
      const timer2 = setTimeout(() => setPhase(2), 800);
      const timer3 = setTimeout(() => setPhase(3), 1600);
      const timer4 = setTimeout(() => {
        if (onComplete) onComplete();
      }, 3000);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(timer4);
      };
    }
    return undefined;
  }, [isVisible, onComplete]);

  // Reset phase when not visible
  useEffect(() => {
    if (!isVisible) {
      const resetTimer = setTimeout(() => setPhase(0), 100);
      return () => clearTimeout(resetTimer);
    }
    return undefined;
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className={`logout-animation-overlay ${phase >= 1 ? "active" : ""}`}>
      {/* Animated background particles */}
      <div className="logout-particles">
        {STATIC_PARTICLES.map((particle) => (
          <div
            key={particle.id}
            className="logout-particle"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className={`logout-content ${phase >= 1 ? "show" : ""}`}>
        {/* Animated checkmark circle */}
        <div className={`logout-success-icon ${phase >= 2 ? "animate" : ""}`}>
          <div className="logout-circle">
            <svg viewBox="0 0 52 52" className="logout-checkmark-svg">
              <circle
                className="logout-checkmark-circle"
                cx="26"
                cy="26"
                r="24"
                fill="none"
              />
              <path
                className="logout-checkmark-check"
                fill="none"
                d="M14 27l7 7 16-16"
              />
            </svg>
          </div>

          {/* Ripple effects */}
          <div className="logout-ripple logout-ripple-1"></div>
          <div className="logout-ripple logout-ripple-2"></div>
          <div className="logout-ripple logout-ripple-3"></div>
        </div>

        {/* Text content */}
        <div className={`logout-text ${phase >= 2 ? "show" : ""}`}>
          <h2 className="logout-title">
            <span className="logout-wave">👋</span> Goodbye, {userName}!
          </h2>
          <p className="logout-message">
            You have been successfully logged out
          </p>
        </div>

        {/* Progress indicator */}
        <div className={`logout-progress ${phase >= 3 ? "show" : ""}`}>
          <p className="logout-redirect-text">Redirecting to home page...</p>
          <div className="logout-progress-bar">
            <div className="logout-progress-fill"></div>
          </div>
        </div>

        {/* Floating icons */}
        <div className={`logout-floating-icons ${phase >= 2 ? "show" : ""}`}>
          <div className="floating-icon floating-icon-1">👕</div>
          <div className="floating-icon floating-icon-2">✨</div>
          <div className="floating-icon floating-icon-3">🎨</div>
          <div className="floating-icon floating-icon-4">💫</div>
          <div className="floating-icon floating-icon-5">🛍️</div>
        </div>
      </div>
    </div>
  );
};

export default LogoutAnimation;
