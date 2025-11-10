import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { adminAPI } from "../../services/api";
import { formatPrice } from "../../utils/currency";
import { useFlash } from "../../context/FlashContext";
import {
  exportOrdersToCSV,
  exportDetailedOrdersToCSV,
} from "../../utils/exportUtils";

const Orders = () => {
  const { showFlash } = useFlash();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getOrders();
      setOrders(response.data.orders || []);
    } catch (error) {
      showFlash("Failed to load orders", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleExportBasic = () => {
    if (orders.length === 0) {
      showFlash("No orders to export", "warning");
      return;
    }
    exportOrdersToCSV(orders);
    showFlash("Orders exported successfully", "success");
  };

  const handleExportDetailed = () => {
    if (orders.length === 0) {
      showFlash("No orders to export", "warning");
      return;
    }
    exportDetailedOrdersToCSV(orders);
    showFlash("Detailed orders exported successfully", "success");
  };

  return (
    <div className="container my-4">
      <div className="row mb-4">
        <div className="col-md-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <h2 className="card-title mb-0">All Orders</h2>
                <div className="d-flex gap-2">
                  <div className="btn-group">
                    <button
                      className="btn btn-success dropdown-toggle"
                      type="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <i className="bi bi-download me-2"></i>
                      Export Orders
                    </button>
                    <ul className="dropdown-menu">
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={handleExportBasic}
                        >
                          <i className="bi bi-file-earmark-spreadsheet me-2"></i>
                          Basic Export (Summary)
                        </button>
                      </li>
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={handleExportDetailed}
                        >
                          <i className="bi bi-file-earmark-text me-2"></i>
                          Detailed Export (With Items)
                        </button>
                      </li>
                    </ul>
                  </div>
                  <Link
                    to="/admin/dashboard"
                    className="btn btn-outline-primary"
                  >
                    Back to Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="btn-group" role="group">
                <button
                  className={`btn ${
                    filter === "all" ? "btn-primary" : "btn-outline-primary"
                  }`}
                  onClick={() => setFilter("all")}
                >
                  All
                </button>
                <button
                  className={`btn ${
                    filter === "pending" ? "btn-warning" : "btn-outline-warning"
                  }`}
                  onClick={() => setFilter("pending")}
                >
                  Pending
                </button>
                <button
                  className={`btn ${
                    filter === "in-production" ? "btn-info" : "btn-outline-info"
                  }`}
                  onClick={() => setFilter("in-production")}
                >
                  In Production
                </button>
                <button
                  className={`btn ${
                    filter === "completed"
                      ? "btn-success"
                      : "btn-outline-success"
                  }`}
                  onClick={() => setFilter("completed")}
                >
                  Completed
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-12">
          <div className="card shadow-sm">
            <div className="card-body">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : orders.length === 0 ? (
                <div className="alert alert-info">No orders found.</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order._id}>
                          <td>
                            <code>{order._id.substring(0, 8)}...</code>
                          </td>
                          <td>
                            {order.userId?.username ||
                              order.userId?.email ||
                              "N/A"}
                          </td>
                          <td>{order.items?.length || 0}</td>
                          <td>{formatPrice(order.totalAmount)}</td>
                          <td>
                            <span className="badge bg-info">
                              {order.status.replace("-", " ").toUpperCase()}
                            </span>
                          </td>
                          <td>
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                          <td>
                            <Link
                              to={`/admin/order/${order._id}`}
                              className="btn btn-sm btn-outline-primary"
                            >
                              View Details
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;
