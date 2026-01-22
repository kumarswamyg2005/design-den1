import { useState, useEffect } from "react";
import axios from "axios";
import LoadingSpinner from "../../components/LoadingSpinner";
import "../../styles/DesignerMarketplace.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5174";

const DesignerEarnings = () => {
  const [earnings, setEarnings] = useState([]);
  const [summary, setSummary] = useState({
    totalEarned: 0,
    pending: 0,
    processing: 0,
    paid: 0,
    availableBalance: 0,
  });
  const [payoutRequests, setPayoutRequests] = useState([]);
  const [commissionInfo, setCommissionInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutForm, setPayoutForm] = useState({
    amount: "",
    paymentMethod: "bank_transfer",
    paymentDetails: {
      accountNumber: "",
      ifscCode: "",
      accountHolderName: "",
      bankName: "",
      paypalEmail: "",
      upiId: "",
    },
  });

  useEffect(() => {
    fetchEarnings();
    fetchPayoutRequests();
    fetchCommissionInfo();
  }, []);

  const fetchCommissionInfo = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/platform/commission-info`,
      );
      if (response.data.success) {
        setCommissionInfo(response.data.commission);
      }
    } catch (error) {
      console.error("Error fetching commission info:", error);
    }
  };

  const fetchEarnings = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/designer/earnings`, {
        withCredentials: true,
      });

      if (response.data.success) {
        setEarnings(response.data.earnings);
        setSummary(response.data.summary);
      }
    } catch (error) {
      console.error("Error fetching earnings:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPayoutRequests = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/designer/payout/requests`,
        { withCredentials: true },
      );

      if (response.data.success) {
        setPayoutRequests(response.data.requests);
      }
    } catch (error) {
      console.error("Error fetching payout requests:", error);
    }
  };

  const handlePayoutRequest = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${API_URL}/api/designer/payout/request`,
        payoutForm,
        { withCredentials: true },
      );

      if (response.data.success) {
        alert("Payout request submitted successfully!");
        setShowPayoutModal(false);
        setPayoutForm({
          amount: "",
          paymentMethod: "bank_transfer",
          paymentDetails: {
            accountNumber: "",
            ifscCode: "",
            accountHolderName: "",
            bankName: "",
            paypalEmail: "",
            upiId: "",
          },
        });
        fetchEarnings();
        fetchPayoutRequests();
      }
    } catch (error) {
      console.error("Error creating payout request:", error);
      alert(error.response?.data?.message || "Failed to create payout request");
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "pending":
        return "status-pending";
      case "processing":
        return "status-processing";
      case "paid":
        return "status-paid";
      case "on_hold":
        return "status-on_hold";
      default:
        return "bg-secondary";
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="designer-earnings container my-5">
      <h2 className="mb-4">
        <i className="fas fa-wallet me-2"></i>
        Earnings Dashboard
      </h2>

      {/* Summary Cards */}
      <div className="row mb-5">
        <div className="col-md-3 mb-3">
          <div
            className="earnings-card"
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
          >
            <h3>₹{summary.totalEarned.toLocaleString()}</h3>
            <p>Total Earned</p>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div
            className="earnings-card"
            style={{
              background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            }}
          >
            <h3>₹{summary.availableBalance.toLocaleString()}</h3>
            <p>Available Balance</p>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div
            className="earnings-card"
            style={{
              background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
            }}
          >
            <h3>₹{summary.processing.toLocaleString()}</h3>
            <p>Processing</p>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div
            className="earnings-card"
            style={{
              background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
            }}
          >
            <h3>₹{summary.paid.toLocaleString()}</h3>
            <p>Paid Out</p>
          </div>
        </div>
      </div>

      {/* Commission Info Card */}
      {commissionInfo && (
        <div className="card mb-4 border-0 shadow-sm">
          <div className="card-body">
            <h5 className="card-title mb-3">
              <i className="fas fa-info-circle me-2 text-primary"></i>
              How Your Earnings Work
            </h5>
            <div className="row">
              <div className="col-md-4 text-center mb-3">
                <div className="p-3 bg-success bg-opacity-10 rounded">
                  <h2 className="text-success mb-1">
                    {commissionInfo.designerRate}%
                  </h2>
                  <p className="mb-0 text-muted">You Keep</p>
                </div>
              </div>
              <div className="col-md-4 text-center mb-3">
                <div className="p-3 bg-primary bg-opacity-10 rounded">
                  <h2 className="text-primary mb-1">
                    {commissionInfo.platformRate}%
                  </h2>
                  <p className="mb-0 text-muted">Platform Fee</p>
                </div>
              </div>
              <div className="col-md-4 text-center mb-3">
                <div className="p-3 bg-warning bg-opacity-10 rounded">
                  <h2 className="text-warning mb-1">
                    ₹{commissionInfo.minimumPayout}
                  </h2>
                  <p className="mb-0 text-muted">Min. Payout</p>
                </div>
              </div>
            </div>
            <div className="mt-3">
              <small className="text-muted">
                <i className="fas fa-chart-line me-1"></i>
                <strong>Earn More with Tiers:</strong> As you earn more, your
                commission rate increases!
                {commissionInfo.tiers &&
                  commissionInfo.tiers.map((tier, idx) => (
                    <span key={idx} className="ms-2 badge bg-light text-dark">
                      ₹{tier.minEarnings.toLocaleString()}+ →{" "}
                      {tier.designerRate}%
                    </span>
                  ))}
              </small>
            </div>
            <div className="mt-2">
              <small className="text-muted">
                <i className="fas fa-balance-scale me-1"></i>
                <strong>Industry Comparison:</strong> Fiverr (
                {commissionInfo.comparison?.fiverr?.designerRate}%), Upwork (
                {commissionInfo.comparison?.upwork?.designerRate}%), 99designs (
                {commissionInfo.comparison?.["99designs"]?.designerRate}%)
              </small>
            </div>
          </div>
        </div>
      )}

      {/* Payout Workflow Info */}
      <div className="alert alert-info d-flex align-items-start mb-4">
        <i className="fas fa-info-circle me-3 mt-1 fa-lg"></i>
        <div>
          <h6 className="mb-1">How Payouts Work</h6>
          <ol className="mb-0 ps-3 small">
            <li>
              Earnings become available <strong>7 days</strong> after delivery
            </li>
            <li>Request payout when available balance is ≥ ₹500</li>
            <li>
              Payout requests are reviewed and approved by{" "}
              <strong>Admin</strong>
            </li>
            <li>Processing typically takes 2-3 business days after approval</li>
          </ol>
        </div>
      </div>

      {/* Request Payout Button */}
      <div className="mb-4">
        <button
          className="btn btn-success btn-lg"
          onClick={() => setShowPayoutModal(true)}
          disabled={summary.availableBalance < 500}
        >
          <i className="fas fa-money-bill-wave me-2"></i>
          Request Payout
        </button>
        {summary.availableBalance < 500 && (
          <small className="text-muted ms-3">
            Minimum payout amount is ₹500
          </small>
        )}
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4" role="tablist">
        <li className="nav-item">
          <a
            className="nav-link active"
            data-bs-toggle="tab"
            href="#earnings-tab"
          >
            <i className="fas fa-chart-line me-2"></i>
            Earnings History
          </a>
        </li>
        <li className="nav-item">
          <a className="nav-link" data-bs-toggle="tab" href="#payouts-tab">
            <i className="fas fa-file-invoice-dollar me-2"></i>
            Payout Requests ({payoutRequests.length})
          </a>
        </li>
      </ul>

      <div className="tab-content">
        {/* Earnings History Tab */}
        <div id="earnings-tab" className="tab-pane fade show active">
          <div className="card shadow-sm">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Order #</th>
                      <th>Date</th>
                      <th>Order Amount</th>
                      <th>Commission %</th>
                      <th>Your Earning</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {earnings.length > 0 ? (
                      earnings.map((earning) => (
                        <tr key={earning._id}>
                          <td>
                            <strong>
                              {earning.orderId?.orderNumber || "N/A"}
                            </strong>
                          </td>
                          <td>
                            {new Date(earning.createdAt).toLocaleDateString()}
                          </td>
                          <td>₹{earning.orderAmount.toLocaleString()}</td>
                          <td>{earning.commissionRate}%</td>
                          <td className="fw-bold text-success">
                            ₹{earning.designerEarning.toLocaleString()}
                          </td>
                          <td>
                            <span
                              className={`status-badge ${getStatusBadgeClass(
                                earning.status,
                              )}`}
                            >
                              {earning.status.replace("_", " ").toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center text-muted py-4">
                          No earnings yet. Complete orders to start earning!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Payout Requests Tab */}
        <div id="payouts-tab" className="tab-pane fade">
          <div className="card shadow-sm">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Request Date</th>
                      <th>Amount</th>
                      <th>Payment Method</th>
                      <th>Status</th>
                      <th>Processed Date</th>
                      <th>Transaction ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payoutRequests.length > 0 ? (
                      payoutRequests.map((request) => (
                        <tr key={request._id}>
                          <td>
                            {new Date(request.createdAt).toLocaleDateString()}
                          </td>
                          <td className="fw-bold">
                            ₹{request.amount.toLocaleString()}
                          </td>
                          <td>
                            <span className="badge bg-info">
                              {request.paymentMethod.replace("_", " ")}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`status-badge ${
                                request.status === "completed"
                                  ? "status-paid"
                                  : request.status === "rejected"
                                    ? "status-on_hold"
                                    : request.status === "processing"
                                      ? "status-processing"
                                      : "status-pending"
                              }`}
                            >
                              {request.status.toUpperCase()}
                            </span>
                          </td>
                          <td>
                            {request.processedAt
                              ? new Date(
                                  request.processedAt,
                                ).toLocaleDateString()
                              : "-"}
                          </td>
                          <td>
                            {request.transactionId || "-"}
                            {request.status === "rejected" &&
                              request.rejectionReason && (
                                <div className="small text-danger mt-1">
                                  Reason: {request.rejectionReason}
                                </div>
                              )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center text-muted py-4">
                          No payout requests yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payout Request Modal */}
      {showPayoutModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Request Payout</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowPayoutModal(false)}
                ></button>
              </div>
              <form onSubmit={handlePayoutRequest}>
                <div className="modal-body">
                  <div className="alert alert-info">
                    <i className="fas fa-info-circle me-2"></i>
                    Available Balance:{" "}
                    <strong>
                      ₹{summary.availableBalance.toLocaleString()}
                    </strong>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Amount to Withdraw *</label>
                    <div className="input-group">
                      <span className="input-group-text">₹</span>
                      <input
                        type="number"
                        className="form-control"
                        min="500"
                        max={summary.availableBalance}
                        value={payoutForm.amount}
                        onChange={(e) =>
                          setPayoutForm((prev) => ({
                            ...prev,
                            amount: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                    <small className="text-muted">Minimum: ₹500</small>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Payment Method *</label>
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

                  {/* Bank Transfer Details */}
                  {payoutForm.paymentMethod === "bank_transfer" && (
                    <>
                      <div className="mb-3">
                        <label className="form-label">
                          Account Holder Name *
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={payoutForm.paymentDetails.accountHolderName}
                          onChange={(e) =>
                            setPayoutForm((prev) => ({
                              ...prev,
                              paymentDetails: {
                                ...prev.paymentDetails,
                                accountHolderName: e.target.value,
                              },
                            }))
                          }
                          required
                        />
                      </div>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Account Number *</label>
                          <input
                            type="text"
                            className="form-control"
                            value={payoutForm.paymentDetails.accountNumber}
                            onChange={(e) =>
                              setPayoutForm((prev) => ({
                                ...prev,
                                paymentDetails: {
                                  ...prev.paymentDetails,
                                  accountNumber: e.target.value,
                                },
                              }))
                            }
                            required
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">IFSC Code *</label>
                          <input
                            type="text"
                            className="form-control"
                            value={payoutForm.paymentDetails.ifscCode}
                            onChange={(e) =>
                              setPayoutForm((prev) => ({
                                ...prev,
                                paymentDetails: {
                                  ...prev.paymentDetails,
                                  ifscCode: e.target.value,
                                },
                              }))
                            }
                            required
                          />
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Bank Name *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={payoutForm.paymentDetails.bankName}
                          onChange={(e) =>
                            setPayoutForm((prev) => ({
                              ...prev,
                              paymentDetails: {
                                ...prev.paymentDetails,
                                bankName: e.target.value,
                              },
                            }))
                          }
                          required
                        />
                      </div>
                    </>
                  )}

                  {/* UPI Details */}
                  {payoutForm.paymentMethod === "upi" && (
                    <div className="mb-3">
                      <label className="form-label">UPI ID *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="username@upi"
                        value={payoutForm.paymentDetails.upiId}
                        onChange={(e) =>
                          setPayoutForm((prev) => ({
                            ...prev,
                            paymentDetails: {
                              ...prev.paymentDetails,
                              upiId: e.target.value,
                            },
                          }))
                        }
                        required
                      />
                    </div>
                  )}

                  {/* PayPal Details */}
                  {payoutForm.paymentMethod === "paypal" && (
                    <div className="mb-3">
                      <label className="form-label">PayPal Email *</label>
                      <input
                        type="email"
                        className="form-control"
                        value={payoutForm.paymentDetails.paypalEmail}
                        onChange={(e) =>
                          setPayoutForm((prev) => ({
                            ...prev,
                            paymentDetails: {
                              ...prev.paymentDetails,
                              paypalEmail: e.target.value,
                            },
                          }))
                        }
                        required
                      />
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowPayoutModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DesignerEarnings;
