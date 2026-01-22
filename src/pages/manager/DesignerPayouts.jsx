import { useState, useEffect } from "react";
import { managerAPI } from "../../services/api";
import { formatPrice } from "../../utils/currency";
import { useFlash } from "../../context/FlashContext";
import LoadingSpinner from "../../components/LoadingSpinner";

const DesignerPayouts = () => {
  const { showFlash } = useFlash();
  const [designers, setDesigners] = useState([]);
  const [payoutRequests, setPayoutRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("designers");
  const [selectedDesigner, setSelectedDesigner] = useState(null);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [designerProfile, setDesignerProfile] = useState(null);
  const [payoutForm, setPayoutForm] = useState({
    amount: "",
    paymentMethod: "bank_transfer",
    notes: "",
  });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [designersRes, payoutsRes] = await Promise.all([
        managerAPI.getDesignersWithDetails(),
        managerAPI.getPayoutRequests(),
      ]);
      setDesigners(designersRes.data.designers || []);
      setPayoutRequests(payoutsRes.data.requests || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      showFlash("Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = async (designer) => {
    try {
      const res = await managerAPI.getDesignerProfile(designer._id);
      setDesignerProfile(res.data);
      setShowProfileModal(true);
    } catch (error) {
      showFlash("Failed to load designer profile", "error");
    }
  };

  const handleOpenPayoutModal = (designer) => {
    setSelectedDesigner(designer);
    setPayoutForm({
      amount: designer.earnings?.available || 0,
      paymentMethod: "bank_transfer",
      notes: "",
    });
    setShowPayoutModal(true);
  };

  const handleCreatePayout = async (e) => {
    e.preventDefault();
    if (!selectedDesigner) return;

    try {
      setProcessing(true);
      await managerAPI.createDirectPayout({
        designerId: selectedDesigner._id,
        amount: Number(payoutForm.amount),
        paymentMethod: payoutForm.paymentMethod,
        notes: payoutForm.notes,
      });
      showFlash("Payout created successfully!", "success");
      setShowPayoutModal(false);
      fetchData();
    } catch (error) {
      showFlash(
        error.response?.data?.message || "Failed to create payout",
        "error",
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleProcessRequest = async (requestId, action) => {
    try {
      await managerAPI.processPayoutRequest(requestId, action, "");
      showFlash(`Payout ${action}d successfully`, "success");
      fetchData();
    } catch (error) {
      showFlash("Failed to process request", "error");
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container my-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div
            className="card shadow-sm"
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
          >
            <div className="card-body text-white">
              <h2 className="mb-1">
                <i className="fas fa-users-cog me-2"></i>
                Designer & Payout Management
              </h2>
              <p className="mb-0 opacity-75">
                Manage designers and process payouts
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body text-center">
              <h3>{designers.length}</h3>
              <p className="mb-0">Total Designers</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white">
            <div className="card-body text-center">
              <h3>{designers.filter((d) => d.approved).length}</h3>
              <p className="mb-0">Active Designers</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning text-dark">
            <div className="card-body text-center">
              <h3>
                {payoutRequests.filter((r) => r.status === "pending").length}
              </h3>
              <p className="mb-0">Pending Payouts</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info text-white">
            <div className="card-body text-center">
              <h3>
                {formatPrice(
                  designers.reduce(
                    (sum, d) => sum + (d.earnings?.available || 0),
                    0,
                  ),
                )}
              </h3>
              <p className="mb-0">Total Available</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "designers" ? "active" : ""}`}
            onClick={() => setActiveTab("designers")}
          >
            <i className="fas fa-palette me-2"></i>
            Designers ({designers.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "payouts" ? "active" : ""}`}
            onClick={() => setActiveTab("payouts")}
          >
            <i className="fas fa-money-bill-wave me-2"></i>
            Payout Requests ({payoutRequests.length})
          </button>
        </li>
      </ul>

      {/* Designers Tab */}
      {activeTab === "designers" && (
        <div className="card shadow-sm">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Designer</th>
                    <th>Status</th>
                    <th>Shop Status</th>
                    <th>Rating</th>
                    <th>Orders</th>
                    <th>Available Balance</th>
                    <th>Total Earned</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {designers.map((designer) => (
                    <tr key={designer._id}>
                      <td>
                        <div>
                          <strong>{designer.name || designer.username}</strong>
                          <br />
                          <small className="text-muted">{designer.email}</small>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`badge ${designer.approved ? "bg-success" : "bg-warning"}`}
                        >
                          {designer.approved ? "Active" : "Pending"}
                        </span>
                      </td>
                      <td>
                        {designer.designerProfile?.availabilityStatus ===
                          "available" && (
                          <span className="badge bg-success">Available</span>
                        )}
                        {designer.designerProfile?.availabilityStatus ===
                          "busy" && (
                          <span className="badge bg-warning text-dark">
                            Busy
                          </span>
                        )}
                        {designer.designerProfile?.availabilityStatus ===
                          "not_accepting" && (
                          <span className="badge bg-secondary">Closed</span>
                        )}
                        {!designer.designerProfile?.availabilityStatus && (
                          <span className="badge bg-light text-dark">
                            Unknown
                          </span>
                        )}
                      </td>
                      <td>
                        <i className="fas fa-star text-warning me-1"></i>
                        {designer.rating?.toFixed(1) || "N/A"}
                      </td>
                      <td>{designer.orderCount || 0}</td>
                      <td className="text-success fw-bold">
                        {formatPrice(designer.earnings?.available || 0)}
                      </td>
                      <td>{formatPrice(designer.earnings?.total || 0)}</td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => handleViewProfile(designer)}
                            title="View Profile"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button
                            className="btn btn-outline-success"
                            onClick={() => handleOpenPayoutModal(designer)}
                            disabled={(designer.earnings?.available || 0) < 500}
                            title="Create Payout"
                          >
                            <i className="fas fa-money-bill-wave"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {designers.length === 0 && (
                    <tr>
                      <td colSpan="7" className="text-center text-muted py-4">
                        No designers found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Payout Requests Tab */}
      {activeTab === "payouts" && (
        <div className="card shadow-sm">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Date</th>
                    <th>Designer</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payoutRequests.map((request) => (
                    <tr key={request._id}>
                      <td>
                        {new Date(request.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <strong>
                          {request.designerId?.name ||
                            request.designerId?.username}
                        </strong>
                        <br />
                        <small className="text-muted">
                          {request.designerId?.email}
                        </small>
                      </td>
                      <td className="fw-bold">{formatPrice(request.amount)}</td>
                      <td>
                        <span className="badge bg-info">
                          {request.paymentMethod?.replace("_", " ")}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            request.status === "completed"
                              ? "bg-success"
                              : request.status === "approved"
                                ? "bg-info"
                                : request.status === "rejected"
                                  ? "bg-danger"
                                  : request.status === "processing"
                                    ? "bg-warning"
                                    : "bg-secondary"
                          }`}
                        >
                          {request.status.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        {request.status === "pending" && (
                          <div className="btn-group btn-group-sm">
                            <button
                              className="btn btn-success"
                              onClick={() =>
                                handleProcessRequest(request._id, "approve")
                              }
                              title="Approve"
                            >
                              <i className="fas fa-check"></i>
                            </button>
                            <button
                              className="btn btn-danger"
                              onClick={() =>
                                handleProcessRequest(request._id, "reject")
                              }
                              title="Reject"
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          </div>
                        )}
                        {request.status === "approved" && (
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() =>
                              handleProcessRequest(request._id, "complete")
                            }
                          >
                            <i className="fas fa-check-double me-1"></i>
                            Mark Paid
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {payoutRequests.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center text-muted py-4">
                        No payout requests
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Create Payout Modal */}
      {showPayoutModal && selectedDesigner && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title">
                  <i className="fas fa-money-bill-wave me-2"></i>
                  Create Payout
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowPayoutModal(false)}
                ></button>
              </div>
              <form onSubmit={handleCreatePayout}>
                <div className="modal-body">
                  <div className="alert alert-info">
                    <strong>Designer:</strong>{" "}
                    {selectedDesigner.name || selectedDesigner.username}
                    <br />
                    <strong>Available Balance:</strong>{" "}
                    {formatPrice(selectedDesigner.earnings?.available || 0)}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Amount (₹)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={payoutForm.amount}
                      onChange={(e) =>
                        setPayoutForm((prev) => ({
                          ...prev,
                          amount: e.target.value,
                        }))
                      }
                      max={selectedDesigner.earnings?.available || 0}
                      min={500}
                      required
                    />
                    <small className="text-muted">Minimum: ₹500</small>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Payment Method</label>
                    <select
                      className="form-select"
                      value={payoutForm.paymentMethod}
                      onChange={(e) =>
                        setPayoutForm((prev) => ({
                          ...prev,
                          paymentMethod: e.target.value,
                        }))
                      }
                    >
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="upi">UPI</option>
                      <option value="paypal">PayPal</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Notes</label>
                    <textarea
                      className="form-control"
                      value={payoutForm.notes}
                      onChange={(e) =>
                        setPayoutForm((prev) => ({
                          ...prev,
                          notes: e.target.value,
                        }))
                      }
                      rows="2"
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowPayoutModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={processing}
                  >
                    {processing ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Processing...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-check me-2"></i>
                        Create Payout
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Designer Profile Modal */}
      {showProfileModal && designerProfile && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="fas fa-user me-2"></i>
                  Designer Profile
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowProfileModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6>Basic Info</h6>
                    <p>
                      <strong>Name:</strong>{" "}
                      {designerProfile.designer?.name ||
                        designerProfile.designer?.username}
                    </p>
                    <p>
                      <strong>Email:</strong> {designerProfile.designer?.email}
                    </p>
                    <p>
                      <strong>Phone:</strong>{" "}
                      {designerProfile.designer?.contactNumber || "N/A"}
                    </p>
                    <p>
                      <strong>Status:</strong>
                      <span
                        className={`badge ms-2 ${designerProfile.designer?.approved ? "bg-success" : "bg-warning"}`}
                      >
                        {designerProfile.designer?.approved
                          ? "Approved"
                          : "Pending"}
                      </span>
                    </p>
                    <p>
                      <strong>Shop Status:</strong>
                      {designerProfile.designer?.designerProfile
                        ?.availabilityStatus === "available" && (
                        <span className="badge bg-success ms-2">Available</span>
                      )}
                      {designerProfile.designer?.designerProfile
                        ?.availabilityStatus === "busy" && (
                        <span className="badge bg-warning text-dark ms-2">
                          Busy
                        </span>
                      )}
                      {designerProfile.designer?.designerProfile
                        ?.availabilityStatus === "not_accepting" && (
                        <span className="badge bg-secondary ms-2">Closed</span>
                      )}
                      {!designerProfile.designer?.designerProfile
                        ?.availabilityStatus && (
                        <span className="badge bg-light text-dark ms-2">
                          Unknown
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <h6>Designer Profile</h6>
                    <p>
                      <strong>Bio:</strong>{" "}
                      {designerProfile.designer?.designerProfile?.bio || "N/A"}
                    </p>
                    <p>
                      <strong>Experience:</strong>{" "}
                      {designerProfile.designer?.designerProfile?.experience ||
                        0}{" "}
                      years
                    </p>
                    <p>
                      <strong>Rating:</strong>{" "}
                      {designerProfile.designer?.designerProfile?.rating?.toFixed(
                        1,
                      ) || "N/A"}{" "}
                      ⭐
                    </p>
                    <p>
                      <strong>Specializations:</strong>
                    </p>
                    <div>
                      {(
                        designerProfile.designer?.designerProfile
                          ?.specializations || []
                      ).map((s, i) => (
                        <span key={i} className="badge bg-secondary me-1">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <hr />
                <h6>Recent Orders ({designerProfile.orders?.length || 0})</h6>
                <div
                  className="table-responsive"
                  style={{ maxHeight: "200px" }}
                >
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Order</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(designerProfile.orders || [])
                        .slice(0, 10)
                        .map((order) => (
                          <tr key={order._id}>
                            <td>{order.orderNumber || order._id.slice(-8)}</td>
                            <td>{formatPrice(order.totalAmount)}</td>
                            <td>
                              <span className="badge bg-info">
                                {order.status}
                              </span>
                            </td>
                            <td>
                              {new Date(order.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowProfileModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DesignerPayouts;
