import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { customerAPI } from "../../services/api";
import { formatPrice } from "../../utils/currency";
import { useAuth } from "../../context/AuthContext";
import { useFlash } from "../../context/FlashContext";

const Dashboard = () => {
  const { user } = useAuth();
  const { showFlash } = useFlash();
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch orders and wishlist separately
      const [ordersResponse, wishlistResponse] = await Promise.all([
        customerAPI.getOrders(),
        customerAPI.getWishlist(),
      ]);

      setOrders(ordersResponse.data.orders || []);
      setWishlist(wishlistResponse.data.wishlist || []);
    } catch (error) {
      showFlash("Failed to load dashboard data", "error");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (itemId) => {
    try {
      await customerAPI.removeFromWishlist(itemId);
      showFlash("Removed from wishlist", "success");
      fetchDashboardData();
    } catch (error) {
      showFlash("Failed to remove from wishlist", "error");
    }
  };

  const handleMoveToCart = async (item) => {
    try {
      if (!item.designId) {
        showFlash("Invalid design", "error");
        return;
      }
      await customerAPI.addToCart({
        designId: item.designId._id,
        quantity: 1,
        size: item.designId.size || "M",
        color: item.designId.color || "#ffffff",
      });
      await customerAPI.removeFromWishlist(item._id);
      showFlash("Design moved to cart!", "success");
      fetchDashboardData();
    } catch (error) {
      showFlash("Failed to add to cart", "error");
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      pending: "bg-warning text-dark",
      "in-production": "bg-primary",
      completed: "bg-success",
      shipped: "bg-info",
      delivered: "bg-success",
      cancelled: "bg-danger",
    };
    return statusMap[status] || "bg-secondary";
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

  return (
    <div className="container my-4">
      <div className="row mb-4">
        <div className="col-md-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <h2 className="card-title">Welcome, {user?.username}</h2>
              <p className="card-text">
                Manage your designs and orders from your personal dashboard.
              </p>
              <div className="d-flex gap-2">
                <Link to="/customer/design-studio" className="btn btn-primary">
                  Create New Design
                </Link>
                <Link to="/shop" className="btn btn-success">
                  Shop Ready-Made Designs
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-12">
          <div className="card shadow-sm">
            <div className="card-header">
              <h3>Your Orders</h3>
            </div>
            <div className="card-body">
              {orders.length === 0 ? (
                <div className="alert alert-info">
                  You don't have any orders yet.{" "}
                  <Link to="/customer/design-studio">
                    Create your first design
                  </Link>{" "}
                  or <Link to="/shop">shop ready-made designs</Link> to get
                  started!
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Date</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th>Status</th>
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
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                          <td>{order.items?.length || 0}</td>
                          <td>{formatPrice(order.totalAmount)}</td>
                          <td>
                            <span
                              className={`badge ${getStatusBadgeClass(
                                order.status
                              )}`}
                            >
                              {order.status.replace("-", " ").toUpperCase()}
                            </span>
                          </td>
                          <td>
                            <Link
                              to={`/customer/order/${order._id}`}
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

      <div className="row mt-4">
        <div className="col-md-12">
          <div className="card shadow-sm">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h3 className="mb-0">Your Wishlist</h3>
              <Link
                to="/customer/design-studio"
                className="btn btn-sm btn-outline-primary"
              >
                Add New
              </Link>
            </div>
            <div className="card-body">
              {wishlist.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  Your wishlist is empty. Start creating designs to save them
                  here!
                </div>
              ) : (
                <div className="row">
                  {wishlist.map((item) => {
                    const graphicPath = item.designId?.graphic
                      ? item.designId.graphic.startsWith("/images")
                        ? item.designId.graphic
                        : `/images/graphics/${item.designId.graphic}`
                      : null;
                    return (
                      <div className="col-md-4 mb-3" key={item._id}>
                        <div className="card h-100">
                          {graphicPath ? (
                            <img
                              src={`http://localhost:3000${graphicPath}`}
                              className="card-img-top"
                              alt={item.designId?.name || "Design"}
                              style={{
                                height: "200px",
                                objectFit: "contain",
                                backgroundColor: "#f8f9fa",
                                padding: "20px",
                              }}
                              onError={(e) => {
                                e.target.src = "/images/casual-tshirt.jpeg";
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                height: "200px",
                                backgroundColor: "#f8f9fa",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <span className="text-muted">No Image</span>
                            </div>
                          )}
                          <div className="card-body d-flex flex-column">
                            <h5 className="card-title">
                              {item.designId?.name || "Custom Design"}
                            </h5>
                            <p className="card-text text-muted small">
                              {item.designId?.category || "T-Shirt"} •{" "}
                              {item.designId?.fabric || "Cotton"}
                            </p>
                            <p className="card-text">
                              <strong>
                                {formatPrice(
                                  item.designId?.estimatedPrice || 1200
                                )}
                              </strong>
                            </p>
                            <div className="mt-auto">
                              <div className="d-grid gap-2">
                                <button
                                  onClick={() => handleMoveToCart(item)}
                                  className="btn btn-sm btn-success"
                                >
                                  Add to Cart
                                </button>
                                <div className="d-flex gap-2">
                                  <Link
                                    to={`/customer/design-studio?designId=${item.designId?._id}`}
                                    className="btn btn-sm btn-outline-primary flex-fill"
                                  >
                                    Edit
                                  </Link>
                                  <button
                                    onClick={() =>
                                      handleRemoveFromWishlist(item._id)
                                    }
                                    className="btn btn-sm btn-outline-danger flex-fill"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
