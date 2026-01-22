import { useState, useEffect } from "react";
import { adminAPI } from "../../services/api";
import { formatPrice } from "../../utils/currency";
import { useFlash } from "../../context/FlashContext";
import LoadingSpinner from "../../components/LoadingSpinner";

const AdminDesigners = () => {
  const { showFlash } = useFlash();
  const [designers, setDesigners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDesigner, setSelectedDesigner] = useState(null);
  const [designerProfile, setDesignerProfile] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [editForm, setEditForm] = useState({
    approved: false,
    bio: "",
    experience: 0,
    specializations: [],
  });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchDesigners();
  }, []);

  const fetchDesigners = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getDesigners();
      setDesigners(res.data.designers || []);
    } catch (error) {
      console.error("Error fetching designers:", error);
      showFlash("Failed to load designers", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = async (designer) => {
    try {
      const res = await adminAPI.getDesignerProfile(designer._id);
      setDesignerProfile(res.data);
      setShowProfileModal(true);
    } catch (error) {
      showFlash("Failed to load designer profile", "error");
    }
  };

  const handleEditDesigner = (designer) => {
    setSelectedDesigner(designer);
    setEditForm({
      approved: designer.approved || false,
      bio: designer.designerProfile?.bio || "",
      experience: designer.designerProfile?.experience || 0,
      specializations: designer.designerProfile?.specializations || [],
    });
    setShowEditModal(true);
  };

  const handleToggleApproval = async (designer) => {
    try {
      await adminAPI.approveDesigner(designer._id, !designer.approved);
      showFlash(
        `Designer ${!designer.approved ? "approved" : "unapproved"} successfully`,
        "success",
      );
      fetchDesigners();
    } catch (error) {
      showFlash("Failed to update designer status", "error");
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!selectedDesigner) return;

    try {
      setProcessing(true);
      await adminAPI.updateDesigner(selectedDesigner._id, {
        approved: editForm.approved,
        designerProfile: {
          bio: editForm.bio,
          experience: Number(editForm.experience),
          specializations: editForm.specializations,
        },
      });
      showFlash("Designer updated successfully", "success");
      setShowEditModal(false);
      fetchDesigners();
    } catch (error) {
      showFlash("Failed to update designer", "error");
    } finally {
      setProcessing(false);
    }
  };

  const handleSpecializationChange = (spec) => {
    setEditForm((prev) => {
      const current = prev.specializations;
      if (current.includes(spec)) {
        return { ...prev, specializations: current.filter((s) => s !== spec) };
      } else {
        return { ...prev, specializations: [...current, spec] };
      }
    });
  };

  const filteredDesigners = designers.filter((d) => {
    const matchesSearch =
      (d.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (d.username?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (d.email?.toLowerCase() || "").includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "approved" && d.approved) ||
      (filterStatus === "pending" && !d.approved);

    return matchesSearch && matchesStatus;
  });

  const specializations = [
    "Sarees",
    "Kurtas",
    "Lehengas",
    "Sherwanis",
    "Indo-Western",
    "Ethnic Wear",
    "Bridal",
    "Casual",
    "Formal",
    "Traditional",
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container my-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div
            className="card shadow-sm"
            style={{
              background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
            }}
          >
            <div className="card-body text-white">
              <h2 className="mb-1">
                <i className="fas fa-palette me-2"></i>
                Designer Management
              </h2>
              <p className="mb-0 opacity-75">
                View, approve, and manage all designers
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
              <p className="mb-0">Approved</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning text-dark">
            <div className="card-body text-center">
              <h3>{designers.filter((d) => !d.approved).length}</h3>
              <p className="mb-0">Pending Approval</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info text-white">
            <div className="card-body text-center">
              <h3>
                {(
                  designers.reduce(
                    (sum, d) => sum + (d.designerProfile?.rating || 0),
                    0,
                  ) / (designers.length || 1)
                ).toFixed(1)}
              </h3>
              <p className="mb-0">Avg. Rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fas fa-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Designers</option>
                <option value="approved">Approved Only</option>
                <option value="pending">Pending Only</option>
              </select>
            </div>
            <div className="col-md-2">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={fetchDesigners}
              >
                <i className="fas fa-sync-alt me-1"></i> Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Designers Table */}
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
                  <th>Specializations</th>
                  <th>Experience</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDesigners.map((designer) => (
                  <tr key={designer._id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div
                          className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2"
                          style={{ width: 40, height: 40 }}
                        >
                          {(designer.name ||
                            designer.username ||
                            "D")[0].toUpperCase()}
                        </div>
                        <div>
                          <strong>{designer.name || designer.username}</strong>
                          <br />
                          <small className="text-muted">{designer.email}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          designer.approved ? "bg-success" : "bg-warning"
                        }`}
                      >
                        {designer.approved ? "Approved" : "Pending"}
                      </span>
                    </td>
                    <td>
                      {designer.designerProfile?.availabilityStatus ===
                        "available" && (
                        <span className="badge bg-success">Available</span>
                      )}
                      {designer.designerProfile?.availabilityStatus ===
                        "busy" && (
                        <span className="badge bg-warning text-dark">Busy</span>
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
                      {designer.designerProfile?.rating?.toFixed(1) || "N/A"}
                    </td>
                    <td>
                      <div style={{ maxWidth: 150 }}>
                        {(designer.designerProfile?.specializations || [])
                          .slice(0, 2)
                          .map((s, i) => (
                            <span
                              key={i}
                              className="badge bg-secondary me-1 mb-1"
                            >
                              {s}
                            </span>
                          ))}
                        {(designer.designerProfile?.specializations || [])
                          .length > 2 && (
                          <span className="badge bg-light text-dark">
                            +
                            {designer.designerProfile.specializations.length -
                              2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>{designer.designerProfile?.experience || 0} yrs</td>
                    <td>{new Date(designer.createdAt).toLocaleDateString()}</td>
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
                          className="btn btn-outline-secondary"
                          onClick={() => handleEditDesigner(designer)}
                          title="Edit"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className={`btn ${
                            designer.approved
                              ? "btn-outline-danger"
                              : "btn-outline-success"
                          }`}
                          onClick={() => handleToggleApproval(designer)}
                          title={designer.approved ? "Unapprove" : "Approve"}
                        >
                          <i
                            className={`fas ${designer.approved ? "fa-times" : "fa-check"}`}
                          ></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredDesigners.length === 0 && (
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

      {/* Profile Modal */}
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
                    <h6>Basic Information</h6>
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
                        className={`badge ms-2 ${
                          designerProfile.designer?.approved
                            ? "bg-success"
                            : "bg-warning"
                        }`}
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
                    <p>
                      <strong>Joined:</strong>{" "}
                      {new Date(
                        designerProfile.designer?.createdAt,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <h6>Designer Details</h6>
                    <p>
                      <strong>Bio:</strong>{" "}
                      {designerProfile.designer?.designerProfile?.bio ||
                        "No bio available"}
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
                        <span key={i} className="badge bg-info me-1 mb-1">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <hr />
                <h6>
                  Portfolio ({designerProfile.portfolio?.length || 0} items)
                </h6>
                <div
                  className="row g-2 mb-3"
                  style={{ maxHeight: "150px", overflowY: "auto" }}
                >
                  {(designerProfile.portfolio || []).map((item, i) => (
                    <div key={i} className="col-4 col-md-3">
                      <div className="card">
                        <div className="card-body p-2 text-center">
                          <i className="fas fa-image fa-2x text-muted"></i>
                          <small className="d-block text-truncate">
                            {item.title}
                          </small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <hr />
                <h6>Recent Orders ({designerProfile.orders?.length || 0})</h6>
                <div
                  className="table-responsive"
                  style={{ maxHeight: "150px" }}
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
                        .slice(0, 5)
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

      {/* Edit Modal */}
      {showEditModal && selectedDesigner && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-warning">
                <h5 className="modal-title">
                  <i className="fas fa-edit me-2"></i>
                  Edit Designer
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSaveEdit}>
                <div className="modal-body">
                  <div className="alert alert-info">
                    <strong>Designer:</strong>{" "}
                    {selectedDesigner.name || selectedDesigner.username}
                    <br />
                    <strong>Email:</strong> {selectedDesigner.email}
                  </div>
                  <div className="mb-3">
                    <div className="form-check form-switch">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="approvedSwitch"
                        checked={editForm.approved}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            approved: e.target.checked,
                          }))
                        }
                      />
                      <label
                        className="form-check-label"
                        htmlFor="approvedSwitch"
                      >
                        Approved Status
                      </label>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Bio</label>
                    <textarea
                      className="form-control"
                      value={editForm.bio}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          bio: e.target.value,
                        }))
                      }
                      rows="3"
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Experience (years)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={editForm.experience}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          experience: e.target.value,
                        }))
                      }
                      min="0"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Specializations</label>
                    <div className="d-flex flex-wrap gap-2">
                      {specializations.map((spec) => (
                        <div key={spec} className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id={`spec-${spec}`}
                            checked={editForm.specializations.includes(spec)}
                            onChange={() => handleSpecializationChange(spec)}
                          />
                          <label
                            className="form-check-label"
                            htmlFor={`spec-${spec}`}
                          >
                            {spec}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={processing}
                  >
                    {processing ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save me-2"></i>
                        Save Changes
                      </>
                    )}
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

export default AdminDesigners;
