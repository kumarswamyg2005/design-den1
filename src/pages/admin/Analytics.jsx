import { useState, useEffect } from "react";
import { adminAPI } from "../../services/api";
import { formatPrice } from "../../utils/currency";

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30"); // days

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getDashboard();
      setStats(response.data.stats);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container my-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  const orderStatusData = [
    { status: "Pending", count: stats?.pendingOrders || 0, color: "#ffc107" },
    {
      status: "In Production",
      count: stats?.inProductionOrders || 0,
      color: "#0dcaf0",
    },
    {
      status: "Completed",
      count: stats?.completedOrders || 0,
      color: "#198754",
    },
    { status: "Shipped", count: stats?.shippedOrders || 0, color: "#0d6efd" },
    {
      status: "Delivered",
      count: stats?.deliveredOrders || 0,
      color: "#6c757d",
    },
  ];

  const totalOrders = orderStatusData.reduce(
    (sum, item) => sum + item.count,
    0
  );

  return (
    <div className="container-fluid my-4">
      <div className="row mb-4">
        <div className="col-md-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <h2 className="card-title mb-0">
                  <i className="fas fa-chart-line me-2"></i>
                  Analytics Dashboard
                </h2>
                <div className="btn-group">
                  <button
                    className={`btn btn-sm ${
                      timeRange === "7" ? "btn-primary" : "btn-outline-primary"
                    }`}
                    onClick={() => setTimeRange("7")}
                  >
                    7 Days
                  </button>
                  <button
                    className={`btn btn-sm ${
                      timeRange === "30" ? "btn-primary" : "btn-outline-primary"
                    }`}
                    onClick={() => setTimeRange("30")}
                  >
                    30 Days
                  </button>
                  <button
                    className={`btn btn-sm ${
                      timeRange === "90" ? "btn-primary" : "btn-outline-primary"
                    }`}
                    onClick={() => setTimeRange("90")}
                  >
                    90 Days
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card shadow-sm border-0 bg-primary text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-uppercase mb-1">Total Revenue</h6>
                  <h3 className="mb-0">
                    {formatPrice(stats?.totalRevenue || 0)}
                  </h3>
                </div>
                <div className="fs-1">
                  <i className="fas fa-rupee-sign"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm border-0 bg-success text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-uppercase mb-1">Total Orders</h6>
                  <h3 className="mb-0">{stats?.totalOrders || 0}</h3>
                </div>
                <div className="fs-1">
                  <i className="fas fa-shopping-bag"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm border-0 bg-info text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-uppercase mb-1">Total Customers</h6>
                  <h3 className="mb-0">{stats?.totalCustomers || 0}</h3>
                </div>
                <div className="fs-1">
                  <i className="fas fa-users"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm border-0 bg-warning text-dark">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-uppercase mb-1">Avg. Order Value</h6>
                  <h3 className="mb-0">
                    {formatPrice(
                      stats?.totalOrders > 0
                        ? stats?.totalRevenue / stats?.totalOrders
                        : 0
                    )}
                  </h3>
                </div>
                <div className="fs-1">
                  <i className="fas fa-chart-bar"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="row g-4 mb-4">
        {/* Order Status Distribution */}
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">
                <i className="fas fa-chart-pie me-2"></i>
                Order Status Distribution
              </h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <table className="table table-sm">
                  <tbody>
                    {orderStatusData.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <span
                            className="badge me-2"
                            style={{ backgroundColor: item.color }}
                          >
                            &nbsp;&nbsp;&nbsp;
                          </span>
                          {item.status}
                        </td>
                        <td className="text-end">
                          <strong>{item.count}</strong>
                        </td>
                        <td className="text-end text-muted">
                          {totalOrders > 0
                            ? ((item.count / totalOrders) * 100).toFixed(1)
                            : 0}
                          %
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Simple Bar Chart */}
              <div className="chart-container">
                {orderStatusData.map((item, index) => (
                  <div key={index} className="mb-2">
                    <div className="d-flex justify-content-between mb-1">
                      <small>{item.status}</small>
                      <small>{item.count}</small>
                    </div>
                    <div className="progress" style={{ height: "20px" }}>
                      <div
                        className="progress-bar"
                        role="progressbar"
                        style={{
                          width:
                            totalOrders > 0
                              ? `${(item.count / totalOrders) * 100}%`
                              : "0%",
                          backgroundColor: item.color,
                        }}
                        aria-valuenow={item.count}
                        aria-valuemin="0"
                        aria-valuemax={totalOrders}
                      >
                        {totalOrders > 0 &&
                          ((item.count / totalOrders) * 100).toFixed(0)}
                        %
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Breakdown */}
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">
                <i className="fas fa-money-bill-wave me-2"></i>
                Revenue Breakdown
              </h5>
            </div>
            <div className="card-body">
              <div className="row text-center">
                <div className="col-md-6 mb-3">
                  <div className="border rounded p-3">
                    <h6 className="text-muted">This Month</h6>
                    <h3 className="text-success">
                      {formatPrice(stats?.monthlyRevenue || 0)}
                    </h3>
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <div className="border rounded p-3">
                    <h6 className="text-muted">This Week</h6>
                    <h3 className="text-primary">
                      {formatPrice(stats?.weeklyRevenue || 0)}
                    </h3>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="border rounded p-3">
                    <h6 className="text-muted">Today</h6>
                    <h3 className="text-info">
                      {formatPrice(stats?.todayRevenue || 0)}
                    </h3>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="border rounded p-3">
                    <h6 className="text-muted">Pending Amount</h6>
                    <h3 className="text-warning">
                      {formatPrice(stats?.pendingAmount || 0)}
                    </h3>
                  </div>
                </div>
              </div>

              <hr />

              <div className="mt-3">
                <h6 className="mb-3">Payment Method Breakdown</h6>
                <div className="mb-2">
                  <div className="d-flex justify-content-between mb-1">
                    <small>
                      <i className="fas fa-money-bill-wave me-1"></i> Cash on
                      Delivery
                    </small>
                    <small>
                      <strong>{stats?.codOrders || 0}</strong> orders
                    </small>
                  </div>
                  <div className="progress" style={{ height: "15px" }}>
                    <div
                      className="progress-bar bg-success"
                      style={{
                        width: `${
                          ((stats?.codOrders || 0) /
                            (stats?.totalOrders || 1)) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div className="mb-2">
                  <div className="d-flex justify-content-between mb-1">
                    <small>
                      <i className="fas fa-credit-card me-1"></i> Card Payment
                    </small>
                    <small>
                      <strong>{stats?.cardOrders || 0}</strong> orders
                    </small>
                  </div>
                  <div className="progress" style={{ height: "15px" }}>
                    <div
                      className="progress-bar bg-primary"
                      style={{
                        width: `${
                          ((stats?.cardOrders || 0) /
                            (stats?.totalOrders || 1)) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="d-flex justify-content-between mb-1">
                    <small>
                      <i className="fas fa-mobile-alt me-1"></i> UPI Payment
                    </small>
                    <small>
                      <strong>{stats?.upiOrders || 0}</strong> orders
                    </small>
                  </div>
                  <div className="progress" style={{ height: "15px" }}>
                    <div
                      className="progress-bar bg-info"
                      style={{
                        width: `${
                          ((stats?.upiOrders || 0) /
                            (stats?.totalOrders || 1)) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="row g-4">
        <div className="col-md-12">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">
                <i className="fas fa-list me-2"></i>
                Quick Stats
              </h5>
            </div>
            <div className="card-body">
              <div className="row text-center">
                <div className="col-md-2">
                  <div className="border-end">
                    <h4 className="text-warning">
                      {stats?.pendingOrders || 0}
                    </h4>
                    <small className="text-muted">Pending Orders</small>
                  </div>
                </div>
                <div className="col-md-2">
                  <div className="border-end">
                    <h4 className="text-info">
                      {stats?.inProductionOrders || 0}
                    </h4>
                    <small className="text-muted">In Production</small>
                  </div>
                </div>
                <div className="col-md-2">
                  <div className="border-end">
                    <h4 className="text-success">
                      {stats?.completedOrders || 0}
                    </h4>
                    <small className="text-muted">Completed</small>
                  </div>
                </div>
                <div className="col-md-2">
                  <div className="border-end">
                    <h4 className="text-primary">
                      {stats?.shippedOrders || 0}
                    </h4>
                    <small className="text-muted">Shipped</small>
                  </div>
                </div>
                <div className="col-md-2">
                  <div className="border-end">
                    <h4 className="text-secondary">
                      {stats?.deliveredOrders || 0}
                    </h4>
                    <small className="text-muted">Delivered</small>
                  </div>
                </div>
                <div className="col-md-2">
                  <h4 className="text-danger">{stats?.cancelledOrders || 0}</h4>
                  <small className="text-muted">Cancelled</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
