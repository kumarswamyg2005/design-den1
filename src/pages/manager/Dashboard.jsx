/**
 * Enhanced Manager Dashboard - Real World Workflow
 * Flipkart-like order management with delivery slot scheduling,
 * delivery partner ratings, and comprehensive workflow tracking
 */

import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllOrders,
  assignOrderToDesigner,
  assignOrderToDelivery,
  fetchDesigners,
  fetchDeliveryPersons,
  selectOrders,
  selectOrdersLoading,
  selectDesigners,
  selectDeliveryPersons,
} from "../../store/slices/ordersSlice";
import { useAuth } from "../../context/AuthContext";
import { formatPrice } from "../../utils/currency";
import LoadingSpinner from "../../components/LoadingSpinner";
import "./ManagerDashboard.css";

const Dashboard = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();

  const orders = useSelector(selectOrders);
  const loading = useSelector(selectOrdersLoading);
  const designers = useSelector(selectDesigners);
  const deliveryPersons = useSelector(selectDeliveryPersons);

  // State management
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [assignType, setAssignType] = useState(null);
  const [selectedPersonId, setSelectedPersonId] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date_desc");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState({ date: "", timeSlot: "" });
  const [activeTab, setActiveTab] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  // Fetch data
  useEffect(() => {
    dispatch(fetchAllOrders("manager"));
    dispatch(fetchDesigners());
    dispatch(fetchDeliveryPersons());
  }, [dispatch]);

  // Refresh data
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.all([
      dispatch(fetchAllOrders("manager")),
      dispatch(fetchDesigners()),
      dispatch(fetchDeliveryPersons()),
    ]).finally(() => {
      setTimeout(() => setRefreshing(false), 500);
    });
  }, [dispatch]);

  // Order type detection
  const isCustomOrder = (order) => {
    return (
      order.orderType === "custom" ||
      order.items?.some((item) => item.designId && !item.productId)
    );
  };

  // Filter and sort orders
  const getFilteredOrders = useCallback(() => {
    let filtered = [...orders];

    // Tab filter
    if (activeTab === "pending") {
      // Include both "pending" and "assigned_to_manager" statuses
      filtered = filtered.filter(
        (o) => o.status === "pending" || o.status === "assigned_to_manager",
      );
    } else if (activeTab === "custom") {
      filtered = filtered.filter((o) => isCustomOrder(o));
    } else if (activeTab === "readymade") {
      filtered = filtered.filter((o) => !isCustomOrder(o));
    } else if (activeTab === "delivery") {
      filtered = filtered.filter(
        (o) =>
          o.status === "production_completed" ||
          o.status === "ready_for_pickup" ||
          o.status === "ready_for_delivery" ||
          o.status === "picked_up" ||
          o.status === "in_transit" ||
          o.status === "out_for_delivery",
      );
    }

    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((o) => o.status === filterStatus);
    }

    // Type filter
    if (filterType !== "all") {
      filtered = filtered.filter((o) =>
        filterType === "custom" ? isCustomOrder(o) : !isCustomOrder(o),
      );
    }

    // Search
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o._id.toLowerCase().includes(search) ||
          o.userId?.name?.toLowerCase().includes(search) ||
          o.userId?.email?.toLowerCase().includes(search),
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date_asc":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "date_desc":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "amount_high":
          return b.totalAmount - a.totalAmount;
        case "amount_low":
          return a.totalAmount - b.totalAmount;
        case "priority": {
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return (
            (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2)
          );
        }
        default:
          return 0;
      }
    });

    return filtered;
  }, [orders, activeTab, filterStatus, filterType, searchTerm, sortBy]);

  const filteredOrders = getFilteredOrders();

  // Statistics
  const stats = {
    total: orders.length,
    pendingAssignment: orders.filter((o) => o.status === "assigned_to_manager")
      .length,
    customOrders: orders.filter((o) => isCustomOrder(o)).length,
    readymadeOrders: orders.filter((o) => !isCustomOrder(o)).length,
    inProduction: orders.filter((o) => o.status === "in_production").length,
    productionCompleted: orders.filter(
      (o) => o.status === "production_completed",
    ).length,
    readyForDelivery: orders.filter((o) => o.status === "ready_for_delivery")
      .length,
    outForDelivery: orders.filter((o) => o.status === "out_for_delivery")
      .length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    todayOrders: orders.filter((o) => {
      const today = new Date().toDateString();
      return new Date(o.createdAt).toDateString() === today;
    }).length,
  };

  // Get priority based on order - uses useCallback to prevent re-render issues
  const getOrderPriority = useCallback((order) => {
    const now = Date.now();
    const hoursSinceOrder =
      (now - new Date(order.createdAt)) / (1000 * 60 * 60);
    if (hoursSinceOrder > 48) return "high";
    if (hoursSinceOrder > 24) return "medium";
    return "low";
  }, []);

  // Handle assignment
  const handleAssign = async () => {
    if (!selectedOrder || !selectedPersonId) return;

    try {
      if (assignType === "designer") {
        await dispatch(
          assignOrderToDesigner({
            orderId: selectedOrder._id,
            designerId: selectedPersonId,
          }),
        ).unwrap();
      } else if (assignType === "delivery") {
        await dispatch(
          assignOrderToDelivery({
            orderId: selectedOrder._id,
            deliveryPersonId: selectedPersonId,
          }),
        ).unwrap();
      }
      closeAssignModal();
      handleRefresh();
    } catch (error) {
      console.error("Assignment failed:", error);
    }
  };

  const openAssignModal = (order, type) => {
    setSelectedOrder(order);
    setAssignType(type);
    setSelectedPersonId("");
    setShowAssignModal(true);
  };

  const closeAssignModal = () => {
    setSelectedOrder(null);
    setAssignType(null);
    setSelectedPersonId("");
    setShowAssignModal(false);
  };

  const openSlotModal = (order) => {
    setSelectedOrder(order);
    setSelectedSlot({ date: "", timeSlot: "" });
    setShowSlotModal(true);
  };

  const closeSlotModal = () => {
    setSelectedOrder(null);
    setSelectedSlot({ date: "", timeSlot: "" });
    setShowSlotModal(false);
  };

  // Status badge styling
  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: "bg-secondary", icon: "clock" },
      assigned_to_manager: { class: "bg-info", icon: "user-tie" },
      assigned_to_designer: { class: "bg-primary", icon: "paint-brush" },
      designer_accepted: { class: "bg-success", icon: "check" },
      in_production: { class: "bg-warning text-dark", icon: "cogs" },
      production_completed: { class: "bg-success", icon: "box" },
      ready_for_pickup: { class: "bg-info", icon: "box-seam" },
      picked_up: { class: "bg-primary", icon: "truck" },
      in_transit: { class: "bg-primary", icon: "truck-moving" },
      ready_for_delivery: { class: "bg-info", icon: "truck-loading" },
      out_for_delivery: { class: "bg-primary", icon: "shipping-fast" },
      delivered: { class: "bg-success", icon: "check-double" },
      cancelled: { class: "bg-danger", icon: "times" },
    };
    return badges[status] || { class: "bg-secondary", icon: "question" };
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      high: "danger",
      medium: "warning",
      low: "success",
    };
    return colors[priority] || "secondary";
  };

  // Permission checks
  const canAssignDesigner = (order) => {
    return (
      isCustomOrder(order) &&
      order.status === "assigned_to_manager" &&
      !order.designerId
    );
  };

  const canAssignDelivery = (order) => {
    if (isCustomOrder(order)) {
      return order.status === "production_completed" && !order.deliveryPersonId;
    } else {
      return order.status === "assigned_to_manager" && !order.deliveryPersonId;
    }
  };

  // Generate next 7 days for delivery slot
  const getDeliveryDates = () => {
    const dates = [];
    for (let i = 1; i <= 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push({
        value: date.toISOString().split("T")[0],
        label: date.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        }),
      });
    }
    return dates;
  };

  if (loading && orders.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="manager-dashboard">
      <div className="container-fluid my-4">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card dashboard-header shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                  <div>
                    <h2 className="mb-2">
                      <i className="fas fa-tasks me-2"></i>
                      Manager Dashboard
                    </h2>
                    <p className="text-muted mb-0">
                      Welcome, {user?.username}! Manage orders and coordinate
                      between designers and delivery partners.
                    </p>
                  </div>
                  <div className="d-flex gap-2 align-items-center">
                    <Link to="/manager/stock" className="btn btn-success">
                      <i className="fas fa-warehouse me-2"></i>
                      Manage Stock
                    </Link>
                    <Link to="/manager/designers" className="btn btn-primary">
                      <i className="fas fa-money-bill-wave me-2"></i>
                      Designer Payouts
                    </Link>
                    <button
                      className={`btn btn-outline-secondary ${
                        refreshing ? "rotating" : ""
                      }`}
                      onClick={handleRefresh}
                      disabled={refreshing}
                    >
                      <i className="fas fa-sync-alt"></i>
                    </button>
                    <span className="badge bg-success p-2">
                      <i className="fas fa-calendar-day me-1"></i>
                      {stats.todayOrders} orders today
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="row mb-4">
          <div className="col-xl-3 col-md-6 mb-3">
            <div className="stat-card card shadow-sm h-100 border-left-warning">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="stat-icon bg-warning text-white">
                    <i className="fas fa-clock"></i>
                  </div>
                  <div className="ms-3">
                    <div className="stat-label">Pending Assignment</div>
                    <div className="stat-value text-warning">
                      {stats.pendingAssignment}
                    </div>
                    <small className="text-muted">Needs attention</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-md-6 mb-3">
            <div className="stat-card card shadow-sm h-100 border-left-purple">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="stat-icon bg-purple text-white">
                    <i className="fas fa-palette"></i>
                  </div>
                  <div className="ms-3">
                    <div className="stat-label">Custom Orders</div>
                    <div className="stat-value text-purple">
                      {stats.customOrders}
                    </div>
                    <small className="text-muted">
                      {stats.inProduction} in production
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-md-6 mb-3">
            <div className="stat-card card shadow-sm h-100 border-left-info">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="stat-icon bg-info text-white">
                    <i className="fas fa-truck"></i>
                  </div>
                  <div className="ms-3">
                    <div className="stat-label">Ready for Delivery</div>
                    <div className="stat-value text-info">
                      {stats.readyForDelivery + stats.productionCompleted}
                    </div>
                    <small className="text-muted">
                      {stats.outForDelivery} out for delivery
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-md-6 mb-3">
            <div className="stat-card card shadow-sm h-100 border-left-success">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="stat-icon bg-success text-white">
                    <i className="fas fa-check-circle"></i>
                  </div>
                  <div className="ms-3">
                    <div className="stat-label">Delivered</div>
                    <div className="stat-value text-success">
                      {stats.delivered}
                    </div>
                    <small className="text-muted">Successfully completed</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs & Filters */}
        <div className="row mb-3">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-body">
                {/* Tab Navigation */}
                <ul className="nav nav-pills mb-3">
                  <li className="nav-item">
                    <button
                      className={`nav-link ${
                        activeTab === "all" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("all")}
                    >
                      <i className="fas fa-list me-1"></i> All Orders
                      <span className="badge bg-secondary ms-1">
                        {orders.length}
                      </span>
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${
                        activeTab === "pending" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("pending")}
                    >
                      <i className="fas fa-clock me-1"></i> Pending
                      <span className="badge bg-warning text-dark ms-1">
                        {stats.pendingAssignment}
                      </span>
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${
                        activeTab === "custom" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("custom")}
                    >
                      <i className="fas fa-palette me-1"></i> Custom
                      <span className="badge bg-purple ms-1">
                        {stats.customOrders}
                      </span>
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${
                        activeTab === "readymade" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("readymade")}
                    >
                      <i className="fas fa-store me-1"></i> Readymade
                      <span className="badge bg-teal ms-1">
                        {stats.readymadeOrders}
                      </span>
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${
                        activeTab === "delivery" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("delivery")}
                    >
                      <i className="fas fa-truck me-1"></i> Ready for Delivery
                      <span className="badge bg-info ms-1">
                        {stats.readyForDelivery + stats.productionCompleted}
                      </span>
                    </button>
                  </li>
                </ul>

                {/* Filters Row */}
                <div className="row g-3 align-items-end">
                  <div className="col-md-4">
                    <label className="form-label small fw-bold text-muted">
                      <i className="fas fa-search me-1"></i> Search Orders
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Order ID, Customer name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small fw-bold text-muted">
                      <i className="fas fa-filter me-1"></i> Status
                    </label>
                    <select
                      className="form-select"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="all">All Statuses</option>
                      <option value="assigned_to_manager">
                        Pending Assignment
                      </option>
                      <option value="assigned_to_designer">
                        With Designer
                      </option>
                      <option value="in_production">In Production</option>
                      <option value="production_completed">
                        Production Done
                      </option>
                      <option value="ready_for_pickup">Ready for Pickup</option>
                      <option value="picked_up">Picked Up</option>
                      <option value="in_transit">In Transit</option>
                      <option value="ready_for_delivery">
                        Ready for Delivery
                      </option>
                      <option value="out_for_delivery">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small fw-bold text-muted">
                      <i className="fas fa-sort me-1"></i> Sort By
                    </label>
                    <select
                      className="form-select"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="date_desc">Newest First</option>
                      <option value="date_asc">Oldest First</option>
                      <option value="amount_high">Amount: High to Low</option>
                      <option value="amount_low">Amount: Low to High</option>
                      <option value="priority">Priority</option>
                    </select>
                  </div>
                  <div className="col-md-2">
                    <button
                      className="btn btn-outline-secondary w-100"
                      onClick={() => {
                        setFilterStatus("all");
                        setSearchTerm("");
                        setSortBy("date_desc");
                      }}
                    >
                      <i className="fas fa-redo me-1"></i> Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Grid */}
        <div className="row">
          {filteredOrders.length === 0 ? (
            <div className="col-12">
              <div className="card shadow-sm">
                <div className="card-body text-center py-5">
                  <i className="fas fa-inbox fa-4x text-muted mb-3"></i>
                  <h5 className="text-muted">No orders found</h5>
                  <p className="text-muted">
                    Try adjusting your filters or search criteria
                  </p>
                </div>
              </div>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const priority = getOrderPriority(order);
              const statusInfo = getStatusBadge(order.status);
              const orderType = isCustomOrder(order);

              return (
                <div key={order._id} className="col-lg-6 col-xl-4 mb-4">
                  <div
                    className={`card order-card shadow-sm h-100 ${order.status}`}
                  >
                    {/* Card Header */}
                    <div className="card-header bg-white d-flex justify-content-between align-items-center">
                      <div>
                        <Link
                          to={`/manager/orders/${order._id}`}
                          className="fw-bold text-decoration-none"
                        >
                          #{order._id.substring(0, 8).toUpperCase()}
                        </Link>
                        <div className="small text-muted">
                          {new Date(order.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </div>
                      </div>
                      <div className="d-flex gap-2 align-items-center">
                        {orderType ? (
                          <span className="badge bg-purple">
                            <i className="fas fa-palette me-1"></i>Custom
                          </span>
                        ) : (
                          <span className="badge bg-teal">
                            <i className="fas fa-store me-1"></i>Readymade
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="card-body">
                      {/* Customer Info */}
                      <div className="customer-info mb-3">
                        <div className="customer-avatar">
                          <i className="fas fa-user"></i>
                        </div>
                        <div className="ms-3">
                          <div className="fw-bold">
                            {order.userId?.name || "Customer"}
                          </div>
                          <small className="text-muted">
                            {order.userId?.email}
                          </small>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="mb-3">
                        <span
                          className={`badge ${statusInfo.class} d-inline-flex align-items-center`}
                        >
                          <i className={`fas fa-${statusInfo.icon} me-1`}></i>
                          {order.status.replace(/_/g, " ").toUpperCase()}
                        </span>
                      </div>

                      {/* Items Summary */}
                      <div className="items-summary mb-3">
                        <small className="text-muted d-block mb-1">
                          <i className="fas fa-box me-1"></i>
                          {order.items?.length || 0} item(s)
                        </small>
                        <div className="fw-bold fs-5 text-success">
                          {formatPrice(order.totalAmount)}
                        </div>
                      </div>

                      {/* Assignment Status */}
                      <div className="assignment-status mb-3">
                        {order.designerId && (
                          <div className="d-flex align-items-center mb-2 p-2 bg-light rounded">
                            <i className="fas fa-paint-brush text-purple me-2"></i>
                            <div>
                              <small className="text-muted d-block">
                                Designer
                              </small>
                              <span className="small fw-bold">
                                {order.designerId.name || "Assigned"}
                              </span>
                            </div>
                            <i className="fas fa-check-circle text-success ms-auto"></i>
                          </div>
                        )}
                        {order.deliveryPersonId && (
                          <div className="d-flex align-items-center p-2 bg-light rounded">
                            <i className="fas fa-truck text-info me-2"></i>
                            <div>
                              <small className="text-muted d-block">
                                Delivery Partner
                              </small>
                              <span className="small fw-bold">
                                {order.deliveryPersonId.name || "Assigned"}
                              </span>
                            </div>
                            <i className="fas fa-check-circle text-success ms-auto"></i>
                          </div>
                        )}
                        {!order.designerId && !order.deliveryPersonId && (
                          <div className="alert alert-warning py-2 mb-0">
                            <i className="fas fa-exclamation-triangle me-2"></i>
                            <small>Awaiting assignment</small>
                          </div>
                        )}
                      </div>

                      {/* Delivery Slot if exists */}
                      {order.deliverySlot?.date && (
                        <div className="delivery-slot-info p-2 bg-info bg-opacity-10 rounded mb-3">
                          <small className="text-muted d-block">
                            <i className="fas fa-calendar-alt me-1"></i>{" "}
                            Delivery Slot
                          </small>
                          <span className="small fw-bold text-info">
                            {new Date(
                              order.deliverySlot.date,
                            ).toLocaleDateString()}{" "}
                            - {order.deliverySlot.timeSlot}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Card Footer - Actions */}
                    <div className="card-footer bg-white border-top">
                      <div className="d-flex gap-2 flex-wrap">
                        {canAssignDesigner(order) && (
                          <button
                            className="btn btn-sm btn-outline-purple flex-grow-1"
                            onClick={() => openAssignModal(order, "designer")}
                          >
                            <i className="fas fa-user-plus me-1"></i>
                            Assign Designer
                          </button>
                        )}
                        {canAssignDelivery(order) && (
                          <button
                            className="btn btn-sm btn-outline-success flex-grow-1"
                            onClick={() => openAssignModal(order, "delivery")}
                          >
                            <i className="fas fa-truck me-1"></i>
                            Assign Delivery
                          </button>
                        )}
                        <Link
                          to={`/manager/orders/${order._id}`}
                          className="btn btn-sm btn-outline-primary flex-grow-1"
                        >
                          <i className="fas fa-eye me-1"></i>
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Available Personnel Summary */}
        <div className="row mt-4">
          <div className="col-md-6 mb-4">
            <div className="card shadow-sm h-100">
              <div className="card-header bg-purple text-white">
                <h6 className="mb-0">
                  <i className="fas fa-paint-brush me-2"></i>
                  Available Designers ({designers.length})
                </h6>
              </div>
              <div className="card-body">
                {designers.length === 0 ? (
                  <p className="text-muted text-center mb-0">
                    No designers available
                  </p>
                ) : (
                  <div className="list-group list-group-flush">
                    {designers.slice(0, 5).map((designer) => (
                      <div
                        key={designer._id}
                        className="list-group-item d-flex align-items-center px-0"
                      >
                        <div className="avatar-sm bg-purple-light rounded-circle me-3 d-flex align-items-center justify-content-center">
                          <i className="fas fa-user text-purple"></i>
                        </div>
                        <div className="flex-grow-1">
                          <div className="fw-bold">{designer.name}</div>
                          <small className="text-muted">{designer.email}</small>
                        </div>
                        <span className="badge bg-success">Available</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-md-6 mb-4">
            <div className="card shadow-sm h-100">
              <div className="card-header bg-info text-white">
                <h6 className="mb-0">
                  <i className="fas fa-truck me-2"></i>
                  Delivery Partners ({deliveryPersons.length})
                </h6>
              </div>
              <div className="card-body">
                {deliveryPersons.length === 0 ? (
                  <p className="text-muted text-center mb-0">
                    No delivery partners available
                  </p>
                ) : (
                  <div className="list-group list-group-flush">
                    {deliveryPersons.slice(0, 5).map((person) => (
                      <div
                        key={person._id}
                        className="list-group-item d-flex align-items-center px-0"
                      >
                        <div className="avatar-sm bg-info-light rounded-circle me-3 d-flex align-items-center justify-content-center">
                          <i className="fas fa-motorcycle text-info"></i>
                        </div>
                        <div className="flex-grow-1">
                          <div className="fw-bold">{person.name}</div>
                          <small className="text-muted">{person.email}</small>
                        </div>
                        <div className="text-end">
                          {person.rating && (
                            <div className="small text-warning">
                              <i className="fas fa-star"></i>{" "}
                              {person.rating?.toFixed(1) || "4.5"}
                            </div>
                          )}
                          <span className="badge bg-success">Available</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assignment Modal */}
      {showAssignModal && selectedOrder && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg">
              <div
                className={`modal-header ${
                  assignType === "designer" ? "bg-purple" : "bg-success"
                } text-white`}
              >
                <h5 className="modal-title">
                  <i
                    className={`fas fa-${
                      assignType === "designer" ? "paint-brush" : "truck"
                    } me-2`}
                  ></i>
                  {assignType === "designer"
                    ? "Assign Designer"
                    : "Assign Delivery Partner"}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={closeAssignModal}
                ></button>
              </div>
              <div className="modal-body">
                {/* Order Summary */}
                <div className="order-summary-card p-3 bg-light rounded mb-4">
                  <div className="row">
                    <div className="col-md-6">
                      <small className="text-muted">Order ID</small>
                      <div className="fw-bold">
                        #{selectedOrder._id.substring(0, 8).toUpperCase()}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <small className="text-muted">Customer</small>
                      <div className="fw-bold">
                        {selectedOrder.userId?.name || "N/A"}
                      </div>
                    </div>
                    <div className="col-md-6 mt-2">
                      <small className="text-muted">Amount</small>
                      <div className="fw-bold text-success">
                        {formatPrice(selectedOrder.totalAmount)}
                      </div>
                    </div>
                    <div className="col-md-6 mt-2">
                      <small className="text-muted">Type</small>
                      <div className="fw-bold">
                        {isCustomOrder(selectedOrder)
                          ? "Custom Design"
                          : "Readymade Product"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Person Selection */}
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    Select{" "}
                    {assignType === "designer"
                      ? "Designer"
                      : "Delivery Partner"}
                  </label>

                  {(assignType === "designer" ? designers : deliveryPersons)
                    .length === 0 ? (
                    <div className="alert alert-warning">
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      No{" "}
                      {assignType === "designer"
                        ? "designers"
                        : "delivery partners"}{" "}
                      available at the moment.
                    </div>
                  ) : (
                    <div className="person-list">
                      {(assignType === "designer"
                        ? designers
                        : deliveryPersons
                      ).map((person) => (
                        <div
                          key={person._id}
                          className={`person-item p-3 border rounded mb-2 cursor-pointer ${
                            selectedPersonId === person._id
                              ? "border-primary bg-primary bg-opacity-10"
                              : ""
                          }`}
                          onClick={() => setSelectedPersonId(person._id)}
                          style={{ cursor: "pointer" }}
                        >
                          <div className="d-flex align-items-center">
                            <div
                              className={`avatar-circle me-3 ${
                                assignType === "designer"
                                  ? "bg-purple-light"
                                  : "bg-info-light"
                              }`}
                            >
                              <i
                                className={`fas fa-${
                                  assignType === "designer"
                                    ? "paint-brush text-purple"
                                    : "motorcycle text-info"
                                }`}
                              ></i>
                            </div>
                            <div className="flex-grow-1">
                              <div className="fw-bold">{person.name}</div>
                              <small className="text-muted">
                                {person.email}
                              </small>
                            </div>
                            <div className="text-end">
                              {person.rating && (
                                <div className="text-warning mb-1">
                                  <i className="fas fa-star"></i>{" "}
                                  {person.rating?.toFixed(1) || "4.5"}
                                </div>
                              )}
                              {selectedPersonId === person._id && (
                                <i className="fas fa-check-circle text-primary fs-4"></i>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Delivery Slot Selection (for delivery assignment) */}
                {assignType === "delivery" && (
                  <div className="delivery-slot-section mt-4 p-3 border rounded">
                    <h6 className="mb-3">
                      <i className="fas fa-calendar-alt me-2"></i>
                      Set Delivery Slot (Optional)
                    </h6>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label small">
                          Delivery Date
                        </label>
                        <select
                          className="form-select"
                          value={selectedSlot.date}
                          onChange={(e) =>
                            setSelectedSlot({
                              ...selectedSlot,
                              date: e.target.value,
                            })
                          }
                        >
                          <option value="">Select Date</option>
                          {getDeliveryDates().map((date) => (
                            <option key={date.value} value={date.value}>
                              {date.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small">Time Slot</label>
                        <select
                          className="form-select"
                          value={selectedSlot.timeSlot}
                          onChange={(e) =>
                            setSelectedSlot({
                              ...selectedSlot,
                              timeSlot: e.target.value,
                            })
                          }
                        >
                          <option value="">Select Time</option>
                          <option value="morning">
                            🌅 Morning (9 AM - 12 PM)
                          </option>
                          <option value="afternoon">
                            ☀️ Afternoon (12 PM - 5 PM)
                          </option>
                          <option value="evening">
                            🌆 Evening (5 PM - 9 PM)
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeAssignModal}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={`btn ${
                    assignType === "designer" ? "btn-purple" : "btn-success"
                  }`}
                  onClick={handleAssign}
                  disabled={!selectedPersonId}
                >
                  <i className="fas fa-check me-2"></i>
                  Assign{" "}
                  {assignType === "designer" ? "Designer" : "Delivery Partner"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
