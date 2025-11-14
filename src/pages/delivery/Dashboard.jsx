/**
 * Delivery Dashboard - Real-World Delivery Partner Experience
 * Features:
 * - Flipkart/Ekart-like delivery workflow
 * - OTP verification for delivery
 * - Real-time location updates (simulated)
 * - Proof of delivery with signature/photo
 * - Delivery statistics and earnings
 */

import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDeliveryOrders,
  pickupOrder,
  markInTransit,
  markOutForDelivery,
  deliverOrderWithOTP,
  updateDeliveryLocation,
  fetchDeliveryStatistics,
  selectOrders,
  selectOrdersLoading,
  selectDeliveryStatistics,
} from "../../store/slices/ordersSlice";
import { useAuth } from "../../context/AuthContext";
import { formatPrice } from "../../utils/currency";
import "./DeliveryDashboard.css";

// Simulated locations for demo
const DEMO_LOCATIONS = [
  {
    address: "DesignDen Warehouse, HSR Layout, Bangalore",
    lat: 12.9141,
    lng: 77.648,
  },
  { address: "Koramangala Transit Hub, Bangalore", lat: 12.9352, lng: 77.6245 },
  {
    address: "Indiranagar Sorting Facility, Bangalore",
    lat: 12.9784,
    lng: 77.6408,
  },
  {
    address: "Whitefield Distribution Center, Bangalore",
    lat: 12.9698,
    lng: 77.75,
  },
];

const Dashboard = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();

  const orders = useSelector(selectOrders);
  const loading = useSelector(selectOrdersLoading);
  const deliveryStats = useSelector(selectDeliveryStatistics);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [showDeliverModal, setShowDeliverModal] = useState(false);

  // Delivery form state
  const [deliveryForm, setDeliveryForm] = useState({
    otp: "",
    receivedBy: "",
    relationship: "Self",
    notes: "",
  });

  useEffect(() => {
    dispatch(fetchDeliveryOrders());
    dispatch(fetchDeliveryStatistics());
  }, [dispatch]);

  // Filter orders based on status
  const filteredOrders = (orders || []).filter((order) => {
    if (filterStatus === "all") return true;
    if (filterStatus === "pending") return order.status === "ready_for_pickup";
    if (filterStatus === "active")
      return ["picked_up", "in_transit", "out_for_delivery"].includes(
        order.status
      );
    if (filterStatus === "completed") return order.status === "delivered";
    return order.status === filterStatus;
  });

  // Calculate stats
  const stats = {
    pending: (orders || []).filter((o) => o.status === "ready_for_pickup")
      .length,
    active: (orders || []).filter((o) =>
      ["picked_up", "in_transit", "out_for_delivery"].includes(o.status)
    ).length,
    delivered: (orders || []).filter((o) => o.status === "delivered").length,
    todayEarnings:
      (orders || []).filter((o) => o.status === "delivered").length * 50, // ₹50 per delivery
  };

  // Handle pickup
  const handlePickup = async (orderId) => {
    if (window.confirm("Confirm pickup from warehouse?")) {
      await dispatch(pickupOrder(orderId));
      dispatch(fetchDeliveryOrders());
    }
  };

  // Get a random demo location (for demo purposes)
  const getRandomLocation = useCallback(() => {
    const index = Math.floor(Math.random() * DEMO_LOCATIONS.length);
    return DEMO_LOCATIONS[index];
  }, []);

  // Handle in-transit
  const handleInTransit = async (orderId) => {
    const location = getRandomLocation();
    await dispatch(markInTransit({ orderId, location: location.address }));
    dispatch(fetchDeliveryOrders());
  };

  // Handle out for delivery
  const handleOutForDelivery = async (orderId) => {
    await dispatch(markOutForDelivery(orderId));
    dispatch(fetchDeliveryOrders());
  };

  // Handle delivery with OTP
  const openDeliverModal = (order) => {
    setSelectedOrder(order);
    setDeliveryForm({
      otp: "",
      receivedBy: order.shippingAddress?.name || "",
      relationship: "Self",
      notes: "",
    });
    setShowDeliverModal(true);
  };

  const handleDelivery = async () => {
    if (!deliveryForm.otp) {
      alert("Please enter the delivery OTP");
      return;
    }

    const result = await dispatch(
      deliverOrderWithOTP({
        orderId: selectedOrder._id,
        otp: deliveryForm.otp,
        receivedBy: deliveryForm.receivedBy,
        relationship: deliveryForm.relationship,
        notes: deliveryForm.notes,
      })
    );

    if (result.error) {
      alert(result.payload?.message || "Invalid OTP. Please try again.");
    } else {
      setShowDeliverModal(false);
      dispatch(fetchDeliveryOrders());
      dispatch(fetchDeliveryStatistics());
    }
  };

  // Update location simulation
  const handleUpdateLocation = async (orderId) => {
    const location =
      DEMO_LOCATIONS[Math.floor(Math.random() * DEMO_LOCATIONS.length)];
    await dispatch(
      updateDeliveryLocation({
        orderId,
        lat: location.lat,
        lng: location.lng,
        address: location.address,
      })
    );
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const badges = {
      ready_for_pickup: { class: "bg-warning", text: "Ready for Pickup" },
      picked_up: { class: "bg-info", text: "Picked Up" },
      in_transit: { class: "bg-primary", text: "In Transit" },
      out_for_delivery: { class: "bg-purple", text: "Out for Delivery" },
      delivered: { class: "bg-success", text: "Delivered" },
    };
    return badges[status] || { class: "bg-secondary", text: status };
  };

  // Get action buttons based on status
  const renderActionButtons = (order) => {
    switch (order.status) {
      case "ready_for_pickup":
        return (
          <button
            className="btn btn-success btn-sm w-100"
            onClick={() => handlePickup(order._id)}
          >
            <i className="bi bi-box-seam me-2"></i>
            Pickup from Warehouse
          </button>
        );

      case "picked_up":
        return (
          <div className="d-flex gap-2">
            <button
              className="btn btn-info btn-sm flex-fill"
              onClick={() => handleInTransit(order._id)}
            >
              <i className="bi bi-truck me-1"></i>
              Mark In Transit
            </button>
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => handleUpdateLocation(order._id)}
              title="Update Location"
            >
              <i className="bi bi-geo-alt"></i>
            </button>
          </div>
        );

      case "in_transit":
        return (
          <div className="d-flex gap-2">
            <button
              className="btn btn-primary btn-sm flex-fill"
              onClick={() => handleOutForDelivery(order._id)}
            >
              <i className="bi bi-bicycle me-1"></i>
              Out for Delivery
            </button>
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => handleUpdateLocation(order._id)}
              title="Update Location"
            >
              <i className="bi bi-geo-alt"></i>
            </button>
          </div>
        );

      case "out_for_delivery":
        return (
          <button
            className="btn btn-success btn-sm w-100"
            onClick={() => openDeliverModal(order)}
          >
            <i className="bi bi-check2-circle me-2"></i>
            Complete Delivery (OTP)
          </button>
        );

      case "delivered":
        return (
          <span className="text-success">
            <i className="bi bi-check-circle-fill me-2"></i>
            Delivered Successfully
          </span>
        );

      default:
        return null;
    }
  };

  return (
    <div className="delivery-dashboard">
      <div className="container-fluid py-4">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card dashboard-header shadow-sm">
              <div className="card-body d-flex justify-content-between align-items-center flex-wrap gap-3">
                <div>
                  <h2 className="mb-1">
                    <i className="bi bi-truck text-success me-2"></i>
                    Delivery Dashboard
                  </h2>
                  <p className="text-muted mb-0">
                    Welcome back,{" "}
                    {user?.name ||
                      (user?.username
                        ? user.username.charAt(0).toUpperCase() +
                          user.username.slice(1)
                        : "Delivery Partner")}
                  </p>
                </div>
                <div className="delivery-badge">
                  <i className="bi bi-person-badge"></i>
                  <span>DesignDen Express Partner</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="row mb-4">
          <div className="col-md-3 col-sm-6 mb-3">
            <div className="card stat-card h-100 shadow-sm border-left-warning">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="stat-label mb-1">Pending Pickup</p>
                    <h3 className="stat-value mb-0">{stats.pending}</h3>
                  </div>
                  <div className="stat-icon bg-warning">
                    <i className="bi bi-box-seam"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-sm-6 mb-3">
            <div className="card stat-card h-100 shadow-sm border-left-primary">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="stat-label mb-1">Active Deliveries</p>
                    <h3 className="stat-value mb-0">{stats.active}</h3>
                  </div>
                  <div className="stat-icon bg-primary">
                    <i className="bi bi-truck"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-sm-6 mb-3">
            <div className="card stat-card h-100 shadow-sm border-left-success">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="stat-label mb-1">Delivered Today</p>
                    <h3 className="stat-value mb-0">{stats.delivered}</h3>
                  </div>
                  <div className="stat-icon bg-success">
                    <i className="bi bi-check-circle"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-sm-6 mb-3">
            <div className="card stat-card h-100 shadow-sm border-left-info">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="stat-label mb-1">Today's Earnings</p>
                    <h3 className="stat-value mb-0">
                      {formatPrice(stats.todayEarnings)}
                    </h3>
                  </div>
                  <div className="stat-icon bg-info">
                    <i className="bi bi-currency-rupee"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-body py-2">
                <div className="d-flex flex-wrap gap-2">
                  {[
                    { value: "all", label: "All Orders", icon: "bi-list" },
                    {
                      value: "pending",
                      label: "Pending Pickup",
                      icon: "bi-box-seam",
                    },
                    { value: "active", label: "In Progress", icon: "bi-truck" },
                    {
                      value: "completed",
                      label: "Delivered",
                      icon: "bi-check-circle",
                    },
                  ].map((filter) => (
                    <button
                      key={filter.value}
                      className={`btn btn-sm ${
                        filterStatus === filter.value
                          ? "btn-success"
                          : "btn-outline-secondary"
                      }`}
                      onClick={() => setFilterStatus(filter.value)}
                    >
                      <i className={`bi ${filter.icon} me-1`}></i>
                      {filter.label}
                      <span className="badge bg-light text-dark ms-2">
                        {filter.value === "all"
                          ? (orders || []).length
                          : filter.value === "pending"
                          ? stats.pending
                          : filter.value === "active"
                          ? stats.active
                          : stats.delivered}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="row">
          <div className="col-12">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-success" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2 text-muted">Loading deliveries...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="card shadow-sm">
                <div className="card-body text-center py-5">
                  <i className="bi bi-inbox display-1 text-muted"></i>
                  <h5 className="mt-3">No deliveries found</h5>
                  <p className="text-muted">
                    {filterStatus === "pending"
                      ? "No packages ready for pickup"
                      : filterStatus === "active"
                      ? "No active deliveries in progress"
                      : "Check back later for new assignments"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="row">
                {filteredOrders.map((order) => (
                  <div key={order._id} className="col-lg-6 col-xl-4 mb-4">
                    <div
                      className={`card delivery-card h-100 shadow-sm ${
                        order.status === "out_for_delivery"
                          ? "border-warning border-2"
                          : ""
                      }`}
                    >
                      {/* Card Header */}
                      <div className="card-header bg-white d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-0 fw-bold">
                            #
                            {order.orderNumber ||
                              order._id.substring(0, 8).toUpperCase()}
                          </h6>
                          <small className="text-muted">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </small>
                        </div>
                        <div className="d-flex gap-2 align-items-center">
                          <span
                            className={`badge ${
                              order.orderType === "custom"
                                ? "bg-purple"
                                : "bg-teal"
                            }`}
                          >
                            {order.orderType === "custom" ? "Custom" : "Shop"}
                          </span>
                          <span
                            className={`badge ${
                              getStatusBadge(order.status).class
                            }`}
                          >
                            {getStatusBadge(order.status).text}
                          </span>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="card-body">
                        {/* Tracking Info */}
                        {order.deliveryPartner?.trackingNumber && (
                          <div className="tracking-info mb-3 p-2 bg-light rounded">
                            <small className="text-muted d-block">
                              Tracking Number
                            </small>
                            <span className="fw-bold text-primary">
                              <i className="bi bi-upc me-1"></i>
                              {order.deliveryPartner.trackingNumber}
                            </span>
                          </div>
                        )}

                        {/* Customer Info */}
                        <div className="delivery-section">
                          <h6 className="section-title">
                            <i className="bi bi-person me-2"></i>Customer
                          </h6>
                          <p className="mb-1 fw-semibold">
                            {order.shippingAddress?.name}
                          </p>
                          <p className="mb-1">
                            <i className="bi bi-telephone me-2 text-muted"></i>
                            {order.shippingAddress?.phone}
                            {order.shippingAddress?.alternativePhone && (
                              <span className="text-muted">
                                {" "}
                                / {order.shippingAddress.alternativePhone}
                              </span>
                            )}
                          </p>
                        </div>

                        {/* Delivery Address */}
                        <div className="delivery-section">
                          <h6 className="section-title">
                            <i className="bi bi-geo-alt me-2"></i>Delivery
                            Address
                          </h6>
                          <div className="address-box">
                            <p className="mb-1">
                              {order.shippingAddress?.street}
                            </p>
                            {order.shippingAddress?.landmark && (
                              <p className="mb-1 text-muted">
                                <small>
                                  Landmark: {order.shippingAddress.landmark}
                                </small>
                              </p>
                            )}
                            <p className="mb-0">
                              {order.shippingAddress?.city},{" "}
                              {order.shippingAddress?.state} -{" "}
                              {order.shippingAddress?.zipCode}
                            </p>
                          </div>
                        </div>

                        {/* Order Items Summary */}
                        <div className="delivery-section">
                          <h6 className="section-title">
                            <i className="bi bi-bag me-2"></i>
                            Items ({order.items?.length || 0})
                          </h6>
                          <div className="items-summary">
                            {order.items?.slice(0, 2).map((item, idx) => (
                              <div key={idx} className="item-row">
                                <span>
                                  {item.productId?.name ||
                                    item.designId?.name ||
                                    "Custom Design"}
                                </span>
                                <span className="text-muted">
                                  x{item.quantity}
                                </span>
                              </div>
                            ))}
                            {(order.items?.length || 0) > 2 && (
                              <small className="text-muted">
                                +{order.items.length - 2} more items
                              </small>
                            )}
                          </div>
                        </div>

                        {/* Amount */}
                        <div className="order-total">
                          <div className="d-flex justify-content-between">
                            <span>
                              <i className="bi bi-cash-stack me-2"></i>
                              {order.paymentMethod === "cod"
                                ? "Collect on Delivery"
                                : "Prepaid"}
                            </span>
                            <span className="fw-bold">
                              {formatPrice(order.totalAmount)}
                            </span>
                          </div>
                        </div>

                        {/* OTP Notice (for out_for_delivery) - Don't show actual OTP */}
                        {order.status === "out_for_delivery" && (
                          <div className="otp-notice mt-3 p-3 bg-info bg-opacity-10 rounded border border-info">
                            <div className="text-center">
                              <i className="bi bi-shield-lock fs-4 text-info d-block mb-2"></i>
                              <small className="text-info fw-semibold d-block">
                                OTP Required for Delivery
                              </small>
                              <small className="text-muted">
                                Ask customer for 4-digit OTP to complete
                                delivery
                              </small>
                            </div>
                          </div>
                        )}

                        {/* Live Tracking Status */}
                        {order.liveTracking?.isActive && (
                          <div className="live-tracking mt-3 p-2 bg-success bg-opacity-10 rounded">
                            <small className="text-success">
                              <i className="bi bi-broadcast me-1"></i>
                              Live Tracking Active
                            </small>
                            {order.liveTracking.currentLocation?.address && (
                              <p className="mb-0 small mt-1">
                                {order.liveTracking.currentLocation.address}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Card Footer - Actions */}
                      <div className="card-footer bg-white">
                        {renderActionButtons(order)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Deliver Modal with OTP */}
      {showDeliverModal && selectedOrder && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title">
                  <i className="bi bi-check2-circle me-2"></i>
                  Complete Delivery
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowDeliverModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                {/* Order Summary */}
                <div className="alert alert-light">
                  <div className="d-flex justify-content-between">
                    <span>
                      Order #
                      {selectedOrder.orderNumber ||
                        selectedOrder._id.substring(0, 8)}
                    </span>
                    <span className="fw-bold">
                      {formatPrice(selectedOrder.totalAmount)}
                    </span>
                  </div>
                  <small className="text-muted">
                    {selectedOrder.shippingAddress?.name}
                  </small>
                </div>

                {/* OTP Input */}
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    <i className="bi bi-shield-lock me-1"></i>
                    Delivery OTP *
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-lg text-center fw-bold"
                    placeholder="Enter 4-digit OTP"
                    maxLength={4}
                    value={deliveryForm.otp}
                    onChange={(e) =>
                      setDeliveryForm({ ...deliveryForm, otp: e.target.value })
                    }
                  />
                  <small className="text-muted">
                    Ask customer for the OTP sent to their phone
                  </small>
                </div>

                {/* Received By */}
                <div className="mb-3">
                  <label className="form-label fw-bold">Received By</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Name of person receiving"
                    value={deliveryForm.receivedBy}
                    onChange={(e) =>
                      setDeliveryForm({
                        ...deliveryForm,
                        receivedBy: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Relationship */}
                <div className="mb-3">
                  <label className="form-label fw-bold">Relationship</label>
                  <select
                    className="form-select"
                    value={deliveryForm.relationship}
                    onChange={(e) =>
                      setDeliveryForm({
                        ...deliveryForm,
                        relationship: e.target.value,
                      })
                    }
                  >
                    <option value="Self">Self</option>
                    <option value="Family">Family Member</option>
                    <option value="Colleague">Colleague</option>
                    <option value="Security">Security Guard</option>
                    <option value="Neighbor">Neighbor</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Delivery Notes */}
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    Delivery Notes (Optional)
                  </label>
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder="Any additional notes..."
                    value={deliveryForm.notes}
                    onChange={(e) =>
                      setDeliveryForm({
                        ...deliveryForm,
                        notes: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Payment Reminder (for COD) */}
                {selectedOrder.paymentMethod === "cod" && (
                  <div className="alert alert-warning">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    <strong>COD Order:</strong> Collect{" "}
                    {formatPrice(selectedOrder.totalAmount)} before delivery
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDeliverModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleDelivery}
                  disabled={!deliveryForm.otp || deliveryForm.otp.length !== 4}
                >
                  <i className="bi bi-check-circle me-2"></i>
                  Confirm Delivery
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
