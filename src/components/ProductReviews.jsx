import { useState, useEffect } from "react";
import { reviewAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useFlash } from "../context/FlashContext";

const ProductReviews = ({ productId }) => {
  const { user } = useAuth();
  const { showFlash } = useFlash();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: "",
    comment: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Review eligibility state
  const [canReview, setCanReview] = useState(false);
  const [reviewEligibility, setReviewEligibility] = useState(null);
  const [eligibleOrderId, setEligibleOrderId] = useState(null);

  useEffect(() => {
    fetchReviews();
    checkReviewEligibility();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewAPI.getProductReviews(productId);
      setReviews(response.data.reviews || []);
      setStats(response.data.stats || null);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkReviewEligibility = async () => {
    try {
      const response = await reviewAPI.canReview(productId);
      if (response.data.success) {
        setCanReview(response.data.canReview);
        setReviewEligibility(response.data.reason);
        setEligibleOrderId(response.data.orderId || null);
      }
    } catch (error) {
      console.error("Error checking review eligibility:", error);
      setCanReview(false);
    }
  };

  const getEligibilityMessage = () => {
    switch (reviewEligibility) {
      case "not_logged_in":
        return "Please login to write a review";
      case "not_customer":
        return "Only customers can write reviews";
      case "already_reviewed":
        return "You have already reviewed this product";
      case "order_not_delivered":
        return "You can review after your order is delivered";
      case "not_ordered":
        return "Purchase this product to write a review";
      default:
        return null;
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!user) {
      showFlash("Please login to submit a review", "warning");
      return;
    }

    if (!canReview) {
      showFlash(
        getEligibilityMessage() || "You cannot review this product",
        "warning"
      );
      return;
    }

    if (!reviewForm.title.trim() || !reviewForm.comment.trim()) {
      showFlash("Please fill in all fields", "warning");
      return;
    }

    try {
      setSubmitting(true);
      await reviewAPI.createReview(productId, {
        ...reviewForm,
        orderId: eligibleOrderId, // Include order ID for verified purchase badge
      });
      showFlash("Review submitted successfully", "success");
      setShowReviewForm(false);
      setReviewForm({ rating: 5, title: "", comment: "" });
      setCanReview(false); // User has now reviewed, can't review again
      setReviewEligibility("already_reviewed");
      fetchReviews();
    } catch (error) {
      showFlash(
        error.response?.data?.message || "Failed to submit review",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkHelpful = async (reviewId) => {
    if (!user) {
      showFlash("Please login to mark reviews as helpful", "warning");
      return;
    }

    try {
      await reviewAPI.markHelpful(reviewId);
      fetchReviews();
    } catch (error) {
      showFlash("Failed to update review", "error");
    }
  };

  const renderStars = (rating, size = "16px") => {
    return (
      <div className="d-flex align-items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <i
            key={star}
            className={`bi bi-star${star <= rating ? "-fill" : ""}`}
            style={{
              color: star <= rating ? "#ffc107" : "#dee2e6",
              fontSize: size,
              marginRight: "2px",
            }}
          ></i>
        ))}
      </div>
    );
  };

  const renderRatingDistribution = () => {
    if (!stats || stats.totalReviews === 0) return null;

    return (
      <div className="mb-4">
        <div className="row">
          <div className="col-md-4 text-center">
            <h1 className="display-4 fw-bold">
              {stats.averageRating.toFixed(1)}
            </h1>
            {renderStars(Math.round(stats.averageRating), "20px")}
            <p className="text-muted mt-2">{stats.totalReviews} reviews</p>
          </div>
          <div className="col-md-8">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats.distribution[rating] || 0;
              const percentage =
                stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;

              return (
                <div key={rating} className="d-flex align-items-center mb-2">
                  <span className="me-2" style={{ width: "60px" }}>
                    {rating}{" "}
                    <i
                      className="bi bi-star-fill"
                      style={{ color: "#ffc107", fontSize: "12px" }}
                    ></i>
                  </span>
                  <div
                    className="progress flex-grow-1"
                    style={{ height: "8px" }}
                  >
                    <div
                      className="progress-bar bg-warning"
                      role="progressbar"
                      style={{ width: `${percentage}%` }}
                      aria-valuenow={percentage}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    ></div>
                  </div>
                  <span
                    className="ms-2 text-muted"
                    style={{ width: "50px", fontSize: "14px" }}
                  >
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="product-reviews mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Customer Reviews</h3>
        <div className="d-flex align-items-center gap-2">
          {/* Show write review button only if user can review */}
          {canReview && (
            <button
              className="btn btn-primary"
              onClick={() => setShowReviewForm(!showReviewForm)}
            >
              <i className="bi bi-pencil me-2"></i>
              {showReviewForm ? "Cancel" : "Write a Review"}
            </button>
          )}

          {/* Show eligibility message for logged-in customers who can't review */}
          {user &&
            user.role === "customer" &&
            !canReview &&
            reviewEligibility && (
              <span className="text-muted small">
                <i className="bi bi-info-circle me-1"></i>
                {getEligibilityMessage()}
              </span>
            )}
        </div>
      </div>

      {showReviewForm && canReview && (
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title">Write Your Review</h5>
            <form onSubmit={handleSubmitReview}>
              <div className="mb-3">
                <label className="form-label">Rating</label>
                <div className="d-flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="btn btn-link p-0"
                      onClick={() =>
                        setReviewForm({ ...reviewForm, rating: star })
                      }
                    >
                      <i
                        className={`bi bi-star${
                          star <= reviewForm.rating ? "-fill" : ""
                        }`}
                        style={{
                          color:
                            star <= reviewForm.rating ? "#ffc107" : "#dee2e6",
                          fontSize: "24px",
                        }}
                      ></i>
                    </button>
                  ))}
                  <span className="ms-2 align-self-center">
                    {reviewForm.rating}{" "}
                    {reviewForm.rating === 1 ? "star" : "stars"}
                  </span>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Review Title</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Summarize your review"
                  value={reviewForm.title}
                  onChange={(e) =>
                    setReviewForm({ ...reviewForm, title: e.target.value })
                  }
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Review</label>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Tell us what you think about this product"
                  value={reviewForm.comment}
                  onChange={(e) =>
                    setReviewForm({ ...reviewForm, comment: e.target.value })
                  }
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          </div>
        </div>
      )}

      {renderRatingDistribution()}

      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : reviews.length === 0 ? (
        <div className="alert alert-info">
          No reviews yet. Be the first to review this product!
        </div>
      ) : (
        <div className="reviews-list">
          {reviews.map((review) => (
            <div key={review._id} className="card mb-3">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      {renderStars(review.rating)}
                      {review.verified && (
                        <span
                          className="badge bg-success"
                          style={{ fontSize: "10px" }}
                        >
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    <h6 className="mb-1">{review.title}</h6>
                  </div>
                  <small className="text-muted">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </small>
                </div>

                <p className="mb-2">{review.comment}</p>

                <div className="d-flex justify-content-between align-items-center">
                  <small className="text-muted">
                    By {review.userId?.username || "Anonymous"}
                  </small>
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => handleMarkHelpful(review._id)}
                    disabled={!user}
                  >
                    <i className="bi bi-hand-thumbs-up me-1"></i>
                    Helpful{" "}
                    {review.helpful?.length > 0 && `(${review.helpful.length})`}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductReviews;
