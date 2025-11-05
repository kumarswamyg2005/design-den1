import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { managerAPI } from "../../services/api";
import { formatPrice } from "../../utils/currency";
import { useFlash } from "../../context/FlashContext";

const OrderDetails = () => {
  const { id } = useParams();
  const { showFlash } = useFlash();
  const [order, setOrder] = useState(null);
  const [designers, setDesigners] = useState([]);
  const [selectedDesigner, setSelectedDesigner] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const orderResponse = await managerAPI.getOrderDetails(id);
      setOrder(orderResponse.data.order);

      // Fetch designers list
      const designersResponse = await managerAPI.getDesigners();
      setDesigners(designersResponse.data.designers || []);
    } catch (error) {
      showFlash("Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedDesigner) {
      showFlash("Please select a designer", "error");
      return;
    }

    try {
      await managerAPI.assignToDesigner(id, selectedDesigner);
      showFlash("Order assigned successfully", "success");
      fetchData();
    } catch (error) {
      showFlash("Failed to assign order", "error");
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await managerAPI.updateOrderStatus(id, newStatus);
      showFlash(`Order status updated to ${newStatus}`, "success");
      fetchData();
    } catch (error) {
      showFlash("Failed to update order status", "error");
    }
  };

  const handleShip = async () => {
    if (!trackingNumber || trackingNumber.length < 5) {
      showFlash("Please enter a valid tracking number", "error");
      return;
    }

    try {
      await managerAPI.shipOrder(id, trackingNumber);
      showFlash("Order marked as shipped", "success");
      fetchData();
    } catch (error) {
      showFlash("Failed to ship order", "error");
    }
  };

  const handleDeliver = async () => {
    if (!window.confirm("Mark this order as delivered?")) return;

    try {
      await managerAPI.deliverOrder(id);
      showFlash("Order marked as delivered", "success");
      fetchData();
    } catch (error) {
      showFlash("Failed to deliver order", "error");
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
        <Link to="/manager/dashboard" className="btn btn-primary">
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
                  to="/manager/dashboard"
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
          {/* Only show designer assignment for custom designs (3D models) */}
          {order.items && order.items.some((item) => item.designId) && (
            <div className="card shadow-sm mb-3">
              <div className="card-header">
                <h3>Assign Designer</h3>
              </div>
              <div className="card-body">
                {order.status === "pending" ? (
                  <>
                    <div className="alert alert-info small mb-3">
                      <i className="fas fa-info-circle me-1"></i>
                      This order contains custom designs (3D models) that
                      require designer assignment.
                    </div>
                    <select
                      className="form-select mb-3"
                      value={selectedDesigner}
                      onChange={(e) => setSelectedDesigner(e.target.value)}
                    >
                      <option value="">Select Designer</option>
                      {designers.map((designer) => (
                        <option key={designer._id} value={designer._id}>
                          {designer.username}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleAssign}
                      className="btn btn-primary w-100"
                    >
                      Assign to Designer
                    </button>
                  </>
                ) : (
                  <div className="alert alert-info mb-0">
                    Order already assigned to:{" "}
                    {order.designerId?.username || "N/A"}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Status Update Section - Always visible */}
          <div className="card shadow-sm mb-3">
            <div className="card-header">
              <h3>Update Status</h3>
            </div>
            <div className="card-body">
              {!order.items || !order.items.some((item) => item.designId) ? (
                <div className="alert alert-warning small mb-3">
                  <i className="fas fa-shopping-bag me-1"></i>
                  Shop product - No designer assignment needed.
                </div>
              ) : null}

              {order.status === "pending" && (
                <button
                  onClick={() => handleStatusChange("in-production")}
                  className="btn btn-info w-100 mb-2"
                >
                  <i className="fas fa-play me-2"></i>
                  Start Production
                </button>
              )}

              {order.status === "in-production" && (
                <button
                  onClick={() => handleStatusChange("completed")}
                  className="btn btn-success w-100 mb-2"
                >
                  <i className="fas fa-check me-2"></i>
                  Mark as Completed
                </button>
              )}

              {order.status === "completed" && (
                <button
                  onClick={() => handleStatusChange("shipped")}
                  className="btn btn-primary w-100 mb-2"
                >
                  <i className="fas fa-shipping-fast me-2"></i>
                  Mark as Shipped
                </button>
              )}

              {order.status === "shipped" && (
                <button
                  onClick={handleDeliver}
                  className="btn btn-success w-100"
                >
                  <i className="fas fa-check-circle me-2"></i>
                  Mark as Delivered
                </button>
              )}
            </div>
          </div>

          <div className="card shadow-sm mb-3">
            <div className="card-header">
              <h3>Summary</h3>
            </div>
            <div className="card-body">
              <p className="mb-2">
                <strong>Status:</strong>{" "}
                <span className="badge bg-info">
                  {order.status.toUpperCase()}
                </span>
              </p>
              <p className="mb-2">
                <strong>Total:</strong> {formatPrice(order.totalPrice)}
              </p>
              <p className="mb-2 text-muted small">
                Ordered: {new Date(order.orderDate).toLocaleDateString()}
              </p>
              {order.trackingNumber && (
                <p className="mb-0">
                  <strong>Tracking:</strong> {order.trackingNumber}
                </p>
              )}
            </div>
          </div>

          {/* Ship Order Section */}
          {order.status === "completed" && (
            <div className="card shadow-sm mb-3">
              <div className="card-header">
                <h3>
                  <i className="fas fa-shipping-fast me-2"></i>Ship Order
                </h3>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label">Tracking Number</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter tracking number"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                  />
                </div>
                <button onClick={handleShip} className="btn btn-primary w-100">
                  <i className="fas fa-truck me-2"></i>
                  Mark as Shipped
                </button>
              </div>
            </div>
          )}

          {/* Deliver Order Section */}
          {order.status === "shipped" && (
            <div className="card shadow-sm">
              <div className="card-header">
                <h3>
                  <i className="fas fa-check-circle me-2"></i>Deliver Order
                </h3>
              </div>
              <div className="card-body">
                <button
                  onClick={handleDeliver}
                  className="btn btn-success w-100"
                >
                  <i className="fas fa-check me-2"></i>
                  Mark as Delivered
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
