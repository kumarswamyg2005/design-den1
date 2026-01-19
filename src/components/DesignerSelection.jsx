import React, { useState, useEffect } from "react";
import "./DesignerSelection.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5174";

const DesignerSelection = ({ onSelectDesigner, selectedDesignerId }) => {
  const [designers, setDesigners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    minRating: 0,
    sortBy: "rating",
  });
  const [expandedPortfolio, setExpandedPortfolio] = useState(null);

  const fetchDesigners = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.minRating > 0) params.append("minRating", filters.minRating);
      if (filters.sortBy) params.append("sortBy", filters.sortBy);

      const response = await fetch(
        `${API_BASE}/api/designers?${params.toString()}`
      );
      const data = await response.json();

      if (data.success) {
        setDesigners(data.designers);
      } else {
        setError(data.message || "Failed to load designers");
      }
    } catch (err) {
      setError("Failed to connect to server");
      console.error("Error fetching designers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesigners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <span key={i} className="star filled">
            ★
          </span>
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <span key={i} className="star half">
            ★
          </span>
        );
      } else {
        stars.push(
          <span key={i} className="star empty">
            ☆
          </span>
        );
      }
    }
    return stars;
  };

  const getBadgeIcon = (badge) => {
    const icons = {
      "Top Rated": "🏆",
      "Fast Delivery": "⚡",
      "Quick Delivery": "⚡",
      Premium: "💎",
      "Premium Designer": "💎",
      Verified: "✓",
      "Rising Star": "🌟",
      Expert: "🎯",
      "3D Expert": "🎨",
      "Customer Favorite": "❤️",
      "New Talent": "✨",
      "Quick Response": "💬",
      "Eco Champion": "🌱",
      "Expert Tailor": "✂️",
    };
    return icons[badge] || "🏅";
  };

  const handleDesignerSelect = (designer) => {
    onSelectDesigner(designer);
  };

  const togglePortfolio = (designerId) => {
    setExpandedPortfolio(expandedPortfolio === designerId ? null : designerId);
  };

  if (loading) {
    return (
      <div className="designer-selection-loading">
        <div className="loading-spinner"></div>
        <p>Finding the best 3D designers for you...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="designer-selection-error">
        <span className="error-icon">⚠️</span>
        <p>{error}</p>
        <button onClick={fetchDesigners} className="retry-btn">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="designer-selection">
      <div className="designer-selection-header">
        <h2>🎨 Choose Your 3D Designer</h2>
        <p>Select a designer to create your custom 3D model</p>
      </div>

      <div className="designer-filters">
        <div className="filter-group">
          <label>Minimum Rating</label>
          <select
            value={filters.minRating}
            onChange={(e) =>
              setFilters({ ...filters, minRating: Number(e.target.value) })
            }
          >
            <option value="0">All Ratings</option>
            <option value="3">3+ Stars</option>
            <option value="4">4+ Stars</option>
            <option value="4.5">4.5+ Stars</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Sort By</label>
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
          >
            <option value="rating">Highest Rated</option>
            <option value="completedOrders">Most Experienced</option>
            <option value="turnaroundDays">Fastest Delivery</option>
          </select>
        </div>
      </div>

      {designers.length === 0 ? (
        <div className="no-designers">
          <span className="no-designers-icon">👨‍🎨</span>
          <h3>No designers available</h3>
          <p>Try adjusting your filters or check back later</p>
        </div>
      ) : (
        <div className="designers-grid">
          {designers.map((designer) => (
            <div
              key={designer._id}
              className={`designer-card ${
                selectedDesignerId === designer._id ? "selected" : ""
              }`}
            >
              <div className="designer-card-header">
                <div className="designer-avatar">
                  {designer.profilePicture ? (
                    <img src={designer.profilePicture} alt={designer.name} />
                  ) : (
                    <span className="avatar-placeholder">
                      {designer.name?.charAt(0)?.toUpperCase() || "D"}
                    </span>
                  )}
                  {designer.isAvailable && (
                    <span className="availability-badge available">
                      Available
                    </span>
                  )}
                </div>
                <div className="designer-info">
                  <h3>{designer.name}</h3>
                  <div className="designer-rating">
                    {renderStars(designer.rating || 0)}
                    <span className="rating-value">
                      {(designer.rating || 0).toFixed(1)}
                    </span>
                    <span className="total-ratings">
                      ({designer.totalRatings || 0} reviews)
                    </span>
                  </div>
                </div>
              </div>

              <div className="designer-badges">
                {designer.badges?.map((badge, index) => (
                  <span key={index} className="badge">
                    {getBadgeIcon(badge)} {badge}
                  </span>
                ))}
              </div>

              <p className="designer-bio">
                {designer.bio ||
                  "Expert 3D designer ready to bring your custom design to life."}
              </p>

              <div className="designer-stats">
                <div className="stat">
                  <span className="stat-icon">🎨</span>
                  <span className="stat-value">
                    {designer.completedOrders || 0}
                  </span>
                  <span className="stat-label">3D Models</span>
                </div>
                <div className="stat">
                  <span className="stat-icon">⏱️</span>
                  <span className="stat-value">
                    {designer.turnaroundDays || 7}
                  </span>
                  <span className="stat-label">Days Avg.</span>
                </div>
                <div className="stat">
                  <span className="stat-icon">⭐</span>
                  <span className="stat-value">
                    {designer.experience || 1}+
                  </span>
                  <span className="stat-label">Years Exp.</span>
                </div>
              </div>

              {/* Portfolio Section */}
              {designer.portfolio?.length > 0 && (
                <div className="designer-portfolio-section">
                  <button
                    className="portfolio-toggle-btn"
                    onClick={() => togglePortfolio(designer._id)}
                  >
                    {expandedPortfolio === designer._id
                      ? "▼ Hide 3D Work Samples"
                      : "▶ View 3D Work Samples"}
                  </button>

                  {expandedPortfolio === designer._id && (
                    <div className="portfolio-gallery">
                      {designer.portfolio.map((item, index) => (
                        <div key={index} className="portfolio-item">
                          <img
                            src={item.image || item.imageUrl}
                            alt={item.title || `3D Model ${index + 1}`}
                          />
                          {item.title && (
                            <span className="portfolio-title">
                              {item.title}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <button
                className={`select-designer-btn ${
                  selectedDesignerId === designer._id ? "selected" : ""
                }`}
                onClick={() => handleDesignerSelect(designer)}
              >
                {selectedDesignerId === designer._id ? (
                  <>✓ Selected</>
                ) : (
                  <>Select {designer.name?.split(" ")[0]}</>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DesignerSelection;
