import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import LoadingSpinner from "../../components/LoadingSpinner";
import "../../styles/DesignerMarketplace.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5174";

const DesignerMarketplace = () => {
  const [designers, setDesigners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    specialization: "",
    minRating: "",
    maxPrice: "",
    available: false,
    sortBy: "rating",
    search: "",
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalDesigners: 0,
  });

  const specializations = [
    "T-Shirts",
    "Formal Wear",
    "Casual Wear",
    "Ethnic Wear",
    "Streetwear",
    "Sustainable Fashion",
    "Kids Wear",
    "Hoodies",
  ];

  const fetchDesigners = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.currentPage,
        limit: 12,
        ...filters,
      });

      const response = await axios.get(
        `${API_URL}/api/marketplace/designers?${params}`,
        { withCredentials: true },
      );

      if (response.data.success) {
        setDesigners(response.data.designers);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching designers:", error);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.currentPage]);

  useEffect(() => {
    fetchDesigners();
  }, [fetchDesigners]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      specialization: "",
      minRating: "",
      maxPrice: "",
      available: false,
      sortBy: "rating",
      search: "",
    });
  };

  return (
    <div className="designer-marketplace">
      {/* Hero Section */}
      <div className="marketplace-hero">
        <div className="container">
          <h1 className="display-4 fw-bold text-white">
            Discover Talented Designers
          </h1>
          <p className="lead text-white mb-4">
            Connect with skilled freelance fashion designers ready to bring your
            vision to life
          </p>
          <div className="hero-search">
            <div className="input-group input-group-lg">
              <span className="input-group-text bg-white border-0">
                <i className="fas fa-search"></i>
              </span>
              <input
                type="text"
                className="form-control border-0"
                placeholder="Search designers by name, skills, or specialization..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mt-5">
        <div className="row">
          {/* Filters Sidebar */}
          <div className="col-lg-3 mb-4">
            <div className="card shadow-sm sticky-top" style={{ top: "20px" }}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="card-title mb-0">Filters</h5>
                  <button
                    className="btn btn-sm btn-link text-decoration-none"
                    onClick={clearFilters}
                  >
                    Clear All
                  </button>
                </div>

                <hr />

                {/* Specialization Filter */}
                <div className="mb-4">
                  <label className="form-label fw-bold">
                    <i className="fas fa-tag me-2"></i>Specialization
                  </label>
                  <select
                    className="form-select"
                    value={filters.specialization}
                    onChange={(e) =>
                      handleFilterChange("specialization", e.target.value)
                    }
                  >
                    <option value="">All Specializations</option>
                    {specializations.map((spec) => (
                      <option key={spec} value={spec}>
                        {spec}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Rating Filter */}
                <div className="mb-4">
                  <label className="form-label fw-bold">
                    <i className="fas fa-star me-2"></i>Minimum Rating
                  </label>
                  <select
                    className="form-select"
                    value={filters.minRating}
                    onChange={(e) =>
                      handleFilterChange("minRating", e.target.value)
                    }
                  >
                    <option value="">Any Rating</option>
                    <option value="4.5">4.5+ Stars</option>
                    <option value="4.0">4.0+ Stars</option>
                    <option value="3.5">3.5+ Stars</option>
                    <option value="3.0">3.0+ Stars</option>
                  </select>
                </div>

                {/* Price Filter */}
                <div className="mb-4">
                  <label className="form-label fw-bold">
                    <i className="fas fa-rupee-sign me-2"></i>Max Price
                  </label>
                  <select
                    className="form-select"
                    value={filters.maxPrice}
                    onChange={(e) =>
                      handleFilterChange("maxPrice", e.target.value)
                    }
                  >
                    <option value="">Any Price</option>
                    <option value="1000">Under ₹1,000</option>
                    <option value="2000">Under ₹2,000</option>
                    <option value="3000">Under ₹3,000</option>
                    <option value="5000">Under ₹5,000</option>
                  </select>
                </div>

                {/* Availability Filter */}
                <div className="mb-4">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="availableOnly"
                      checked={filters.available}
                      onChange={(e) =>
                        handleFilterChange("available", e.target.checked)
                      }
                    />
                    <label className="form-check-label" htmlFor="availableOnly">
                      <i className="fas fa-check-circle me-2"></i>Available Now
                    </label>
                  </div>
                </div>

                {/* Sort By */}
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    <i className="fas fa-sort me-2"></i>Sort By
                  </label>
                  <select
                    className="form-select"
                    value={filters.sortBy}
                    onChange={(e) =>
                      handleFilterChange("sortBy", e.target.value)
                    }
                  >
                    <option value="rating">Highest Rated</option>
                    <option value="experience">Most Experienced</option>
                    <option value="orders">Most Orders</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Designers Grid */}
          <div className="col-lg-9">
            {/* Results Count */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4>
                {pagination.totalDesigners} Designer
                {pagination.totalDesigners !== 1 ? "s" : ""} Found
              </h4>
            </div>

            {loading ? (
              <LoadingSpinner />
            ) : designers.length === 0 ? (
              <div className="text-center py-5">
                <i className="fas fa-search fa-3x text-muted mb-3"></i>
                <h4>No designers found</h4>
                <p className="text-muted">
                  Try adjusting your filters to see more results
                </p>
                <button className="btn btn-primary" onClick={clearFilters}>
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="row g-4">
                  {designers.map((designer) => (
                    <div key={designer._id} className="col-md-6 col-lg-4">
                      <div
                        className={`designer-card card h-100 shadow-sm ${!designer.isAvailable ? "designer-unavailable" : ""}`}
                      >
                        {/* Unavailable Overlay */}
                        {!designer.isAvailable && (
                          <div className="unavailable-overlay">
                            <div className="unavailable-badge">
                              <i
                                className={`fas ${designer.availabilityStatus === "busy" ? "fa-clock" : "fa-store-slash"} me-2`}
                              ></i>
                              {designer.availabilityStatus === "busy"
                                ? "Busy"
                                : "Shop Closed"}
                            </div>
                          </div>
                        )}
                        <div className="card-body">
                          {/* Designer Header */}
                          <div className="text-center mb-3">
                            <div className="designer-avatar mb-2">
                              <i
                                className={`fas fa-user-circle fa-4x ${designer.isAvailable ? "text-primary" : "text-muted"}`}
                              ></i>
                            </div>
                            <h5 className="card-title mb-1">{designer.name}</h5>
                            <p className="text-muted small mb-2">
                              @{designer.username}
                            </p>

                            {/* Rating */}
                            <div className="rating mb-2">
                              <span className="text-warning">
                                {"★".repeat(
                                  Math.floor(
                                    designer.designerProfile?.rating || 0,
                                  ),
                                )}
                                {"☆".repeat(
                                  5 -
                                    Math.floor(
                                      designer.designerProfile?.rating || 0,
                                    ),
                                )}
                              </span>
                              <span className="ms-2 fw-bold">
                                {designer.designerProfile?.rating?.toFixed(1) ||
                                  "0.0"}
                              </span>
                              <span className="text-muted small ms-1">
                                ({designer.designerProfile?.totalRatings || 0})
                              </span>
                            </div>

                            {/* Badges */}
                            {designer.designerProfile?.badges?.length > 0 && (
                              <div className="badges mb-3">
                                {designer.designerProfile.badges
                                  .slice(0, 2)
                                  .map((badge, idx) => (
                                    <span
                                      key={idx}
                                      className="badge bg-success me-1 mb-1"
                                    >
                                      {badge}
                                    </span>
                                  ))}
                              </div>
                            )}
                          </div>

                          {/* Bio */}
                          <p className="card-text small text-muted mb-3">
                            {designer.bio?.substring(0, 100)}
                            {designer.bio?.length > 100 && "..."}
                          </p>

                          {/* Stats */}
                          <div className="designer-stats mb-3">
                            <div className="stat-item">
                              <i className="fas fa-briefcase text-primary me-2"></i>
                              <span className="fw-bold">
                                {designer.completedOrders || 0}
                              </span>
                              <span className="text-muted small"> orders</span>
                            </div>
                            <div className="stat-item">
                              <i className="fas fa-clock text-primary me-2"></i>
                              <span className="fw-bold">
                                {designer.turnaroundDays || 7}
                              </span>
                              <span className="text-muted small"> days</span>
                            </div>
                            <div className="stat-item">
                              <i className="fas fa-medal text-primary me-2"></i>
                              <span className="fw-bold">
                                {designer.experience || 0}
                              </span>
                              <span className="text-muted small"> yrs exp</span>
                            </div>
                          </div>

                          {/* Price Range */}
                          <div className="price-range mb-3">
                            <div className="d-flex justify-content-between align-items-center">
                              <span className="text-muted small">
                                Price Range:
                              </span>
                              <span className="fw-bold text-success">
                                ₹{designer.priceRange?.min || 500} - ₹
                                {designer.priceRange?.max || 5000}
                              </span>
                            </div>
                          </div>

                          {/* Specializations */}
                          {designer.specializations?.length > 0 && (
                            <div className="specializations mb-3">
                              {designer.specializations
                                .slice(0, 3)
                                .map((spec, idx) => (
                                  <span
                                    key={idx}
                                    className="badge bg-light text-dark me-1 mb-1"
                                  >
                                    {spec}
                                  </span>
                                ))}
                            </div>
                          )}

                          {/* Availability */}
                          <div className="availability mb-3">
                            {designer.isAvailable ? (
                              <span className="badge bg-success">
                                <i className="fas fa-check-circle me-1"></i>
                                Available Now
                              </span>
                            ) : (
                              <span className="badge bg-danger">
                                <i className="fas fa-store-slash me-1"></i>
                                Shop Closed
                              </span>
                            )}
                          </div>

                          {/* View Profile Button */}
                          <Link
                            to={`/marketplace/designer/${designer._id}`}
                            className={`btn w-100 ${designer.isAvailable ? "btn-primary" : "btn-outline-secondary"}`}
                            onClick={() => {
                              console.log("=== DESIGNER CARD CLICKED ===");
                              console.log("Designer:", designer.name);
                              console.log("Designer ID:", designer._id);
                              console.log("Type:", typeof designer._id);
                              console.log("=============================");
                            }}
                          >
                            View Profile
                            <i className="fas fa-arrow-right ms-2"></i>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="d-flex justify-content-center mt-5">
                    <nav>
                      <ul className="pagination">
                        <li
                          className={`page-item ${
                            pagination.currentPage === 1 ? "disabled" : ""
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() =>
                              setPagination((prev) => ({
                                ...prev,
                                currentPage: prev.currentPage - 1,
                              }))
                            }
                            disabled={pagination.currentPage === 1}
                          >
                            Previous
                          </button>
                        </li>

                        {[...Array(pagination.totalPages)].map((_, idx) => {
                          const pageNum = idx + 1;
                          // Show first, last, current, and pages around current
                          if (
                            pageNum === 1 ||
                            pageNum === pagination.totalPages ||
                            Math.abs(pageNum - pagination.currentPage) <= 1
                          ) {
                            return (
                              <li
                                key={pageNum}
                                className={`page-item ${
                                  pagination.currentPage === pageNum
                                    ? "active"
                                    : ""
                                }`}
                              >
                                <button
                                  className="page-link"
                                  onClick={() =>
                                    setPagination((prev) => ({
                                      ...prev,
                                      currentPage: pageNum,
                                    }))
                                  }
                                >
                                  {pageNum}
                                </button>
                              </li>
                            );
                          } else if (
                            pageNum === pagination.currentPage - 2 ||
                            pageNum === pagination.currentPage + 2
                          ) {
                            return (
                              <li key={pageNum} className="page-item disabled">
                                <span className="page-link">...</span>
                              </li>
                            );
                          }
                          return null;
                        })}

                        <li
                          className={`page-item ${
                            pagination.currentPage === pagination.totalPages
                              ? "disabled"
                              : ""
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() =>
                              setPagination((prev) => ({
                                ...prev,
                                currentPage: prev.currentPage + 1,
                              }))
                            }
                            disabled={
                              pagination.currentPage === pagination.totalPages
                            }
                          >
                            Next
                          </button>
                        </li>
                      </ul>
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignerMarketplace;
