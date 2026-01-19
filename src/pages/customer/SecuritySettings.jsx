import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useFlash } from "../../context/FlashContext";
import TwoFactorSetup from "../../components/TwoFactorSetup";

const SecuritySettings = () => {
  const { user } = useAuth();
  const { success, error } = useFlash();

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      error("New passwords don't match");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      error("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      success("Password changed successfully!");
      setShowPasswordModal(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      error("Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container my-4">
      <div className="row mb-4">
        <div className="col-12">
          <h2>
            <i className="fas fa-shield-alt me-2"></i>
            Security Settings
          </h2>
          <p className="text-muted">Manage your account security settings</p>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-8">
          {/* Two-Factor Authentication */}
          <TwoFactorSetup />

          {/* Account Info Card */}
          <div className="card shadow-sm mt-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-user me-2"></i>
                Account Information
              </h5>
            </div>
            <div className="card-body">
              <table className="table table-borderless mb-0">
                <tbody>
                  <tr>
                    <td className="text-muted" style={{ width: "150px" }}>
                      Username
                    </td>
                    <td>{user?.username}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Email</td>
                    <td>{user?.email}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Role</td>
                    <td>
                      <span className="badge bg-primary text-capitalize">
                        {user?.role}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="text-muted">2FA Status</td>
                    <td>
                      {user?.twoFactorEnabled ? (
                        <span className="badge bg-success">
                          <i className="fas fa-check me-1"></i>Enabled
                        </span>
                      ) : (
                        <span className="badge bg-secondary">
                          <i className="fas fa-times me-1"></i>Disabled
                        </span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Security Tips */}
          <div className="card shadow-sm mt-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-lightbulb me-2"></i>
                Security Tips
              </h5>
            </div>
            <div className="card-body">
              <ul className="mb-0">
                <li className="mb-2">
                  <strong>Enable 2FA:</strong> Two-factor authentication adds an
                  extra layer of security to your account.
                </li>
                <li className="mb-2">
                  <strong>Use a strong password:</strong> Make sure your
                  password is at least 8 characters long and includes a mix of
                  letters, numbers, and symbols.
                </li>
                <li className="mb-2">
                  <strong>Keep backup codes safe:</strong> Store your 2FA backup
                  codes in a secure location in case you lose access to your
                  authenticator app.
                </li>
                <li className="mb-2">
                  <strong>Verify login alerts:</strong> If you receive
                  unexpected login notifications, change your password
                  immediately.
                </li>
                <li>
                  <strong>Log out on shared devices:</strong> Always log out of
                  your account when using public or shared computers.
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-lg-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h6 className="mb-3">Quick Links</h6>
              <div className="list-group list-group-flush">
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="list-group-item list-group-item-action border-0"
                >
                  <i className="fas fa-key me-2"></i>Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-key me-2"></i>Change Password
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowPasswordModal(false)}
                ></button>
              </div>
              <form onSubmit={handlePasswordChange}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Current Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          currentPassword: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          newPassword: e.target.value,
                        })
                      }
                      required
                      minLength={8}
                    />
                    <small className="text-muted">At least 8 characters</small>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Confirm New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          confirmPassword: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowPasswordModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Changing...
                      </>
                    ) : (
                      "Change Password"
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

export default SecuritySettings;
