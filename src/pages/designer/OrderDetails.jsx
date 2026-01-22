import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { designerAPI } from "../../services/api";
import { formatPrice } from "../../utils/currency";
import { useFlash } from "../../context/FlashContext";

const OrderDetails = () => {
  const { id } = useParams();
  const { showFlash } = useFlash();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [updatingProgress, setUpdatingProgress] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await designerAPI.getOrderDetails(id);
      setOrder(response.data.order);
      setProgress(response.data.order.progressPercentage || 0);
    } catch (error) {
      showFlash("Failed to load order", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleStartProduction = async () => {
    try {
      await designerAPI.startProduction(id);
      showFlash("Production started!", "success");
      fetchOrderDetails();
    } catch (error) {
      showFlash("Failed to start production", "error");
    }
  };

  const handleUpdateProgress = async () => {
    if (progress < 0 || progress > 100) {
      showFlash("Progress must be between 0 and 100", "error");
      return;
    }

    try {
      setUpdatingProgress(true);
      await designerAPI.updateProgress(id, progress);
      showFlash("Progress updated successfully", "success");
      fetchOrderDetails();
    } catch (error) {
      showFlash("Failed to update progress", "error");
    } finally {
      setUpdatingProgress(false);
    }
  };

  const handleCompleteOrder = async () => {
    if (!window.confirm("Mark this order as completed?")) return;

    try {
      await designerAPI.completeOrder(id);
      showFlash("Order completed successfully!", "success");
      fetchOrderDetails();
    } catch (error) {
      showFlash("Failed to complete order", "error");
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      await designerAPI.updateOrderStatus(id, newStatus);
      showFlash("Order status updated successfully", "success");
      fetchOrderDetails();
    } catch (error) {
      showFlash("Failed to update status", "error");
    }
  };

  if (loading) {
    return (
      <div className="container my-4">
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container my-4">
        <div className="alert alert-warning">Order not found</div>
        <Link to="/designer/dashboard" className="btn btn-primary">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="container my-4">
      <div className="row mb-4">
        <div className="col-md-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h2 className="card-title mb-2">Order Details</h2>
                  <p className="text-muted mb-0">
                    Order ID: <code>{order._id}</code>
                  </p>
                </div>
                <Link
                  to="/designer/dashboard"
                  className="btn btn-outline-primary"
                >
                  Back to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-header">
              <h3>Order Items</h3>
            </div>
            <div className="card-body">
              {order.items && order.items.length > 0 ? (
                <div className="list-group list-group-flush">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="list-group-item">
                      <div className="row align-items-center">
                        {/* Product/Design Image */}
                        <div className="col-md-3">
                          {item.designId?.graphic ? (
                            <img
                              src={`/images/graphics/${item.designId.graphic}`}
                              alt="Design"
                              className="img-fluid rounded"
                              style={{
                                maxHeight: "100px",
                                objectFit: "contain",
                              }}
                            />
                          ) : item.productId?.images?.[0] ? (
                            <img
                              src={item.productId.images[0]}
                              alt="Product"
                              className="img-fluid rounded"
                              style={{
                                maxHeight: "100px",
                                objectFit: "contain",
                              }}
                            />
                          ) : (
                            <div
                              className="bg-light rounded d-flex align-items-center justify-content-center"
                              style={{ height: "100px" }}
                            >
                              <i className="fas fa-image fa-2x text-muted"></i>
                            </div>
                          )}
                        </div>

                        {/* Product/Design Details */}
                        <div className="col-md-6">
                          <h5 className="mb-2">
                            {item.designId ? (
                              <>
                                <i className="fas fa-paint-brush text-primary me-2"></i>
                                Custom Design
                              </>
                            ) : (
                              <>
                                <i className="fas fa-tshirt text-success me-2"></i>
                                {item.productId?.name || "Product"}
                              </>
                            )}
                          </h5>

                          {item.designId && (
                            <div className="small text-muted">
                              <div>
                                <strong>Name:</strong> {item.designId.name}
                              </div>
                              <div>
                                <strong>Category:</strong>{" "}
                                {item.designId.category || "T-Shirt"}
                              </div>
                              <div>
                                <strong>Fabric:</strong>{" "}
                                {item.designId.fabric || "Cotton"}
                              </div>
                              <div>
                                <strong>Color:</strong>{" "}
                                {item.designId.color || "N/A"}
                              </div>
                              <div>
                                <strong>Size:</strong>{" "}
                                {item.designId.size || "N/A"}
                              </div>
                              {item.designId.customText && (
                                <div>
                                  <strong>Custom Text:</strong>{" "}
                                  {item.designId.customText}
                                </div>
                              )}
                            </div>
                          )}

                          {item.productId && (
                            <div className="small text-muted">
                              <div>{item.productId.description}</div>
                            </div>
                          )}
                        </div>

                        {/* Quantity and Price */}
                        <div className="col-md-3 text-end">
                          <div className="mb-2">
                            <span className="badge bg-secondary">
                              Qty: {item.quantity}
                            </span>
                          </div>
                          <h5 className="mb-0">
                            {formatPrice(item.price * item.quantity)}
                          </h5>
                          <small className="text-muted">
                            {formatPrice(item.price)} each
                          </small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted">No items found</p>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm mb-3">
            <div className="card-header">
              <h3>Order Status</h3>
            </div>
            <div className="card-body">
              <span className="badge bg-info fs-6 mb-3">
                {order.status.toUpperCase()}
              </span>

              {/* Progress Tracker for in_production */}
              {order.status === "in_production" && (
                <div className="mb-3">
                  <label className="form-label small">
                    <i className="fas fa-tasks me-2"></i>
                    Production Progress
                  </label>
                  <div className="input-group mb-2">
                    <input
                      type="number"
                      className="form-control"
                      min="0"
                      max="100"
                      value={progress}
                      onChange={(e) =>
                        setProgress(parseInt(e.target.value) || 0)
                      }
                    />
                    <span className="input-group-text">%</span>
                  </div>
                  <button
                    onClick={handleUpdateProgress}
                    className="btn btn-sm btn-primary w-100 mb-2"
                    disabled={updatingProgress}
                  >
                    {updatingProgress ? "Updating..." : "Update Progress"}
                  </button>
                  <div className="progress" style={{ height: "20px" }}>
                    <div
                      className="progress-bar"
                      role="progressbar"
                      style={{ width: `${progress}%` }}
                      aria-valuenow={progress}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    >
                      {progress}%
                    </div>
                  </div>
                </div>
              )}

              <div className="d-grid gap-2">
                {order.status === "pending" && (
                  <button
                    onClick={() => handleStatusUpdate("in-production")}
                    className="btn btn-primary btn-sm"
                  >
                    <i className="fas fa-play me-2"></i>
                    Start Production
                  </button>
                )}
                {order.status === "in-production" && (
                  <button
                    onClick={() => handleStatusUpdate("completed")}
                    className="btn btn-success btn-sm"
                  >
                    <i className="fas fa-check me-2"></i>
                    Mark as Completed
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-header">
              <h3>Summary</h3>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between mb-2">
                <span>Order Total:</span>
                <strong>{formatPrice(order.totalAmount || 0)}</strong>
              </div>
              <hr />

              {/* Expected Earnings Card */}
              <div className="bg-success bg-opacity-10 rounded p-3 mb-3">
                <h6 className="text-success mb-2">
                  <i className="fas fa-wallet me-2"></i>
                  Your Expected Earnings
                </h6>
                <div className="d-flex justify-content-between align-items-center">
                  <span>Commission (80%):</span>
                  <strong className="text-success fs-5">
                    {formatPrice(Math.round((order.totalAmount || 0) * 0.8))}
                  </strong>
                </div>
                <small className="text-muted d-block mt-2">
                  <i className="fas fa-info-circle me-1"></i>
                  Earnings are credited 7 days after delivery
                </small>
              </div>

              <p className="mb-0 text-muted small">
                Ordered: {new Date(order.orderDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
