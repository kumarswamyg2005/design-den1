import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api, { adminAPI } from "../../services/api";
import { formatPrice } from "../../utils/currency";
import { useFlash } from "../../context/FlashContext";

const Dashboard = () => {
  const { showFlash } = useFlash();
  const [stats, setStats] = useState({});
  const [userStats, setUserStats] = useState({});
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedRole, setSelectedRole] = useState("all");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    } else if (activeTab === "products") {
      fetchProducts();
    }
  }, [activeTab, selectedRole]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashResponse, userStatsResponse, productsResponse] =
        await Promise.all([
          adminAPI.getDashboard(),
          api.get("/admin/api/user-stats"),
          api.get("/admin/api/products"),
        ]);
      setStats(dashResponse.data.stats || {});
      setUserStats(userStatsResponse.data.stats || {});
      setProducts(productsResponse.data.products || []);
    } catch (error) {
      showFlash("Failed to load dashboard", "error");
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get("/admin/api/users", {
        params: { role: selectedRole },
      });
      setUsers(response.data.users || []);
    } catch (error) {
      showFlash("Failed to load users", "error");
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get("/admin/api/products");
      setProducts(response.data.products || []);
    } catch (error) {
      showFlash("Failed to load products", "error");
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

  return (
    <div className="container-fluid my-4">
      {/* Page Header */}
      <div className="row mb-4">
        <div className="col-md-12">
          <div className="card shadow-sm border-0 bg-primary text-white">
            <div className="card-body">
              <h2 className="card-title mb-2">
                <i className="fas fa-chart-line me-2"></i>Admin Analytics
                Dashboard
              </h2>
              <p className="card-text mb-0">
                Overview of business performance, users, and inventory
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <i className="fas fa-chart-pie me-2"></i>
            Overview
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            <i className="fas fa-users me-2"></i>
            Users ({userStats.total || 0})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "products" ? "active" : ""}`}
            onClick={() => setActiveTab("products")}
          >
            <i className="fas fa-box me-2"></i>
            Products & Stock
          </button>
        </li>
      </ul>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <>
          {/* Key Metrics Row */}
          <div className="row mb-4">
            {/* Total Revenue */}
            <div className="col-md-3 mb-3">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-muted mb-2">Total Revenue</h6>
                      <h3 className="mb-0">
                        {formatPrice(stats.totalRevenue || 0)}
                      </h3>
                      <small className="text-success">
                        <i className="fas fa-arrow-up"></i> All time
                      </small>
                    </div>
                    <div
                      className="text-primary"
                      style={{ fontSize: "2.5rem" }}
                    >
                      <i className="fas fa-rupee-sign"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Orders */}
            <div className="col-md-3 mb-3">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-muted mb-2">Total Orders</h6>
                      <h3 className="mb-0">{stats.totalOrders || 0}</h3>
                      <small className="text-info">
                        <i className="fas fa-shopping-bag"></i> All time
                      </small>
                    </div>
                    <div className="text-info" style={{ fontSize: "2.5rem" }}>
                      <i className="fas fa-shopping-cart"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Completed Orders */}
            <div className="col-md-3 mb-3">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-muted mb-2">Completed</h6>
                      <h3 className="mb-0">{stats.completedOrders || 0}</h3>
                      <small className="text-success">
                        <i className="fas fa-check-circle"></i>{" "}
                        {formatPrice(stats.completedRevenue || 0)}
                      </small>
                    </div>
                    <div
                      className="text-success"
                      style={{ fontSize: "2.5rem" }}
                    >
                      <i className="fas fa-check-double"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pending Orders */}
            <div className="col-md-3 mb-3">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-muted mb-2">Pending</h6>
                      <h3 className="mb-0">{stats.pendingOrders || 0}</h3>
                      <small className="text-warning">
                        <i className="fas fa-clock"></i> Awaiting
                      </small>
                    </div>
                    <div
                      className="text-warning"
                      style={{ fontSize: "2.5rem" }}
                    >
                      <i className="fas fa-hourglass-half"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* User Statistics */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="card shadow-sm">
                <div className="card-header bg-white">
                  <h5 className="mb-0">
                    <i className="fas fa-users me-2"></i>User Statistics
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row text-center">
                    <div className="col-md-3 mb-3">
                      <div className="p-3 border rounded">
                        <i className="fas fa-user fa-2x text-primary mb-2"></i>
                        <h4>{userStats.customers || 0}</h4>
                        <p className="text-muted mb-0">Customers</p>
                      </div>
                    </div>
                    <div className="col-md-3 mb-3">
                      <div className="p-3 border rounded">
                        <i className="fas fa-user-tie fa-2x text-success mb-2"></i>
                        <h4>{userStats.managers || 0}</h4>
                        <p className="text-muted mb-0">Managers</p>
                      </div>
                    </div>
                    <div className="col-md-3 mb-3">
                      <div className="p-3 border rounded">
                        <i className="fas fa-paint-brush fa-2x text-warning mb-2"></i>
                        <h4>{userStats.designers || 0}</h4>
                        <p className="text-muted mb-0">Designers</p>
                      </div>
                    </div>
                    <div className="col-md-3 mb-3">
                      <div className="p-3 border rounded">
                        <i className="fas fa-truck fa-2x text-info mb-2"></i>
                        <h4>{userStats.delivery || 0}</h4>
                        <p className="text-muted mb-0">Delivery</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product & Stock Statistics */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="card shadow-sm">
                <div className="card-header bg-white">
                  <h5 className="mb-0">
                    <i className="fas fa-box me-2"></i>Product & Stock Overview
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row text-center">
                    <div className="col-md-3 mb-3">
                      <div className="p-3 border rounded">
                        <i className="fas fa-boxes fa-2x text-secondary mb-2"></i>
                        <h4>{products.length}</h4>
                        <p className="text-muted mb-0">Total Products</p>
                      </div>
                    </div>
                    <div className="col-md-3 mb-3">
                      <div className="p-3 border rounded bg-success bg-opacity-10">
                        <i className="fas fa-check-circle fa-2x text-success mb-2"></i>
                        <h4 className="text-success">
                          {
                            products.filter(
                              (p) => p.inStock && p.stockQuantity > 10,
                            ).length
                          }
                        </h4>
                        <p className="text-muted mb-0">In Stock</p>
                      </div>
                    </div>
                    <div className="col-md-3 mb-3">
                      <div className="p-3 border rounded bg-warning bg-opacity-10">
                        <i className="fas fa-exclamation-triangle fa-2x text-warning mb-2"></i>
                        <h4 className="text-warning">
                          {
                            products.filter(
                              (p) =>
                                p.stockQuantity < 10 && p.stockQuantity > 0,
                            ).length
                          }
                        </h4>
                        <p className="text-muted mb-0">Low Stock</p>
                      </div>
                    </div>
                    <div className="col-md-3 mb-3">
                      <div className="p-3 border rounded bg-danger bg-opacity-10">
                        <i className="fas fa-times-circle fa-2x text-danger mb-2"></i>
                        <h4 className="text-danger">
                          {
                            products.filter(
                              (p) => !p.inStock || p.stockQuantity === 0,
                            ).length
                          }
                        </h4>
                        <p className="text-muted mb-0">Out of Stock</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 text-center">
                    <h5 className="text-primary">
                      Total Stock:{" "}
                      {products.reduce(
                        (sum, p) => sum + (p.stockQuantity || 0),
                        0,
                      )}{" "}
                      items
                    </h5>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="row">
            <div className="col-md-12">
              <div className="card shadow-sm">
                <div className="card-header bg-white">
                  <h5 className="mb-0">
                    <i className="fas fa-tasks me-2"></i>Quick Actions
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row text-center">
                    <div className="col-md-4 mb-3">
                      <Link
                        to="/admin/orders"
                        className="btn btn-outline-primary btn-lg w-100"
                        style={{ padding: "1rem" }}
                      >
                        <i
                          className="fas fa-shopping-cart d-block mb-2"
                          style={{ fontSize: "2rem" }}
                        ></i>
                        View All Orders
                      </Link>
                    </div>
                    <div className="col-md-4 mb-3">
                      <button
                        className="btn btn-outline-success btn-lg w-100"
                        style={{ padding: "1rem" }}
                        onClick={() => setActiveTab("users")}
                      >
                        <i
                          className="fas fa-users d-block mb-2"
                          style={{ fontSize: "2rem" }}
                        ></i>
                        Manage Users
                      </button>
                    </div>
                    <div className="col-md-4 mb-3">
                      <Link
                        to="/admin/feedbacks"
                        className="btn btn-outline-info btn-lg w-100"
                        style={{ padding: "1rem" }}
                      >
                        <i
                          className="fas fa-comments d-block mb-2"
                          style={{ fontSize: "2rem" }}
                        ></i>
                        View Feedbacks
                      </Link>
                    </div>
                    <div className="col-md-4 mb-3">
                      <Link
                        to="/admin/designers"
                        className="btn btn-outline-warning btn-lg w-100"
                        style={{ padding: "1rem" }}
                      >
                        <i
                          className="fas fa-palette d-block mb-2"
                          style={{ fontSize: "2rem" }}
                        ></i>
                        Manage Designers
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <>
          <div className="row mb-3">
            <div className="col-md-12">
              <div className="btn-group" role="group">
                <button
                  className={`btn ${
                    selectedRole === "all"
                      ? "btn-primary"
                      : "btn-outline-primary"
                  }`}
                  onClick={() => setSelectedRole("all")}
                >
                  All Users ({userStats.total || 0})
                </button>
                <button
                  className={`btn ${
                    selectedRole === "customer"
                      ? "btn-primary"
                      : "btn-outline-primary"
                  }`}
                  onClick={() => setSelectedRole("customer")}
                >
                  Customers ({userStats.customers || 0})
                </button>
                <button
                  className={`btn ${
                    selectedRole === "manager"
                      ? "btn-primary"
                      : "btn-outline-primary"
                  }`}
                  onClick={() => setSelectedRole("manager")}
                >
                  Managers ({userStats.managers || 0})
                </button>
                <button
                  className={`btn ${
                    selectedRole === "designer"
                      ? "btn-primary"
                      : "btn-outline-primary"
                  }`}
                  onClick={() => setSelectedRole("designer")}
                >
                  Designers ({userStats.designers || 0})
                </button>
                <button
                  className={`btn ${
                    selectedRole === "delivery"
                      ? "btn-primary"
                      : "btn-outline-primary"
                  }`}
                  onClick={() => setSelectedRole("delivery")}
                >
                  Delivery ({userStats.delivery || 0})
                </button>
              </div>
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Contact</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-4">
                          <i className="fas fa-users fa-3x text-muted mb-2"></i>
                          <p className="text-muted">No users found</p>
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr key={user._id}>
                          <td>
                            <strong>{user.name || "N/A"}</strong>
                          </td>
                          <td>{user.username}</td>
                          <td>{user.email}</td>
                          <td>
                            <span
                              className={`badge ${
                                user.role === "customer"
                                  ? "bg-primary"
                                  : user.role === "manager"
                                    ? "bg-success"
                                    : user.role === "designer"
                                      ? "bg-warning"
                                      : user.role === "delivery"
                                        ? "bg-info"
                                        : "bg-secondary"
                              }`}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td>{user.contactNumber || "N/A"}</td>
                          <td>
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Products Tab */}
      {activeTab === "products" && (
        <>
          <div className="row mb-4">
            <div className="col-md-3 mb-3">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <h6 className="text-muted">Total Products</h6>
                  <h3 className="mb-0">{products.length}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card shadow-sm h-100 border-success">
                <div className="card-body">
                  <h6 className="text-success">In Stock</h6>
                  <h3 className="mb-0 text-success">
                    {
                      products.filter((p) => p.inStock && p.stockQuantity > 10)
                        .length
                    }
                  </h3>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card shadow-sm h-100 border-warning">
                <div className="card-body">
                  <h6 className="text-warning">Low Stock</h6>
                  <h3 className="mb-0 text-warning">
                    {
                      products.filter(
                        (p) => p.stockQuantity < 10 && p.stockQuantity > 0,
                      ).length
                    }
                  </h3>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card shadow-sm h-100 border-danger">
                <div className="card-body">
                  <h6 className="text-danger">Out of Stock</h6>
                  <h3 className="mb-0 text-danger">
                    {
                      products.filter(
                        (p) => !p.inStock || p.stockQuantity === 0,
                      ).length
                    }
                  </h3>
                </div>
              </div>
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Product Name</th>
                      <th>Category</th>
                      <th>Gender</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-4">
                          <i className="fas fa-box-open fa-3x text-muted mb-2"></i>
                          <p className="text-muted">No products found</p>
                        </td>
                      </tr>
                    ) : (
                      products.map((product) => (
                        <tr
                          key={product._id}
                          className={
                            !product.inStock || product.stockQuantity === 0
                              ? "table-danger"
                              : product.stockQuantity < 10
                                ? "table-warning"
                                : ""
                          }
                        >
                          <td>
                            <img
                              src={product.images?.[0] || "/placeholder.png"}
                              alt={product.name}
                              style={{
                                width: "50px",
                                height: "50px",
                                objectFit: "cover",
                                borderRadius: "4px",
                              }}
                            />
                          </td>
                          <td>
                            <strong>{product.name}</strong>
                          </td>
                          <td>
                            <span className="badge bg-secondary">
                              {product.category}
                            </span>
                          </td>
                          <td>{product.gender || "N/A"}</td>
                          <td>
                            <strong>{formatPrice(product.price)}</strong>
                          </td>
                          <td>
                            <strong>{product.stockQuantity || 0}</strong>
                          </td>
                          <td>
                            {product.inStock && product.stockQuantity > 0 ? (
                              <span className="badge bg-success">
                                <i className="fas fa-check me-1"></i>
                                Available
                              </span>
                            ) : (
                              <span className="badge bg-danger">
                                <i className="fas fa-times me-1"></i>
                                Unavailable
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
