import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { adminAPI } from "../../services/api";
import { formatPrice } from "../../utils/currency";
import { useFlash } from "../../context/FlashContext";

const OrderDetails = () => {
  const { id } = useParams();
  const { showFlash } = useFlash();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getOrderDetails(id);
      setOrder(response.data.order);
    } catch (error) {
      showFlash("Failed to load order details", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      await adminAPI.updateOrderStatus(id, newStatus);
      showFlash("Order status updated", "success");
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
        <Link to="/admin/orders" className="btn btn-primary">
          Back to Orders
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
                <Link to="/admin/orders" className="btn btn-outline-primary">
                  Back to Orders
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-8">
          <div className="card shadow-sm mb-4">
            <div className="card-header">
              <h3>Order Items</h3>
            </div>
            <div className="card-body">
              {order.items && order.items.length > 0 ? (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Details</th>
                        <th>Quantity</th>
                        <th>Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item, idx) => {
                        const isCustomDesign = !!item.designId;
                        const name = isCustomDesign
                          ? item.designId?.name || "Custom Design"
                          : item.productId?.name || "Product";
                        const details = `Size: ${item.size || "N/A"}, Color: ${
                          item.color || "Default"
                        }`;

                        return (
                          <tr key={idx}>
                            <td>
                              {name}
                              {isCustomDesign && (
                                <span
                                  className="badge bg-info text-dark ms-2"
                                  style={{ fontSize: "0.7rem" }}
                                >
                                  Custom
                                </span>
                              )}
                            </td>
                            <td>
                              <small className="text-muted">{details}</small>
                            </td>
                            <td>{item.quantity}</td>
                            <td>{formatPrice(item.price * item.quantity)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted">No items found</p>
              )}
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-header">
              <h3>Customer Information</h3>
            </div>
            <div className="card-body">
              <p className="mb-2">
                <strong>Name:</strong> {order.userId?.username || "N/A"}
              </p>
              <p className="mb-2">
                <strong>Email:</strong> {order.userId?.email || "N/A"}
              </p>
              <p className="mb-0">
                <strong>Contact:</strong> {order.userId?.contactNumber || "N/A"}
              </p>
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

              <div className="d-grid gap-2">
                <select
                  className="form-select mb-2"
                  value={order.status}
                  onChange={(e) => handleStatusUpdate(e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="in-production">In Production</option>
                  <option value="completed">Completed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>

              <p className="mt-3 mb-0 text-muted small">
                Ordered: {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-header">
              <h3>Payment Summary</h3>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between mb-2">
                <span>Total Amount:</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between">
                <strong>Payment Status:</strong>
                <strong>
                  <span
                    className={`badge ${
                      order.paymentStatus === "paid"
                        ? "bg-success"
                        : "bg-warning text-dark"
                    }`}
                  >
                    {order.paymentStatus?.toUpperCase() || "PENDING"}
                  </span>
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
