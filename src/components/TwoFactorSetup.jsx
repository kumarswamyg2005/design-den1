import { useState, useEffect } from "react";
import { authAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useFlash } from "../context/FlashContext";

const TwoFactorSetup = () => {
  const { user, updateUser } = useAuth();
  const { success, error } = useFlash();

  const [status, setStatus] = useState({ enabled: false });
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState("status"); // status, verify, disable
  const [verificationCode, setVerificationCode] = useState("");
  const [password, setPassword] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const response = await authAPI.get2FAStatus();
      setStatus({ enabled: response.data.enabled });
    } catch (err) {
      console.error("Failed to fetch 2FA status:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendCode = async () => {
    try {
      setLoading(true);
      const response = await authAPI.setup2FA();

      if (!response.data.success) {
        error(response.data.message || "Failed to send verification code");
        return;
      }

      setMaskedEmail(response.data.email);
      setStep("verify");
      success("Verification code sent to your email!");
    } catch (err) {
      error(err.response?.data?.message || "Failed to send verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (verificationCode.length !== 6) {
      error("Please enter the 6-digit code");
      return;
    }

    try {
      setLoading(true);
      await authAPI.verify2FA(verificationCode);
      success("Two-factor authentication enabled successfully!");
      updateUser({ twoFactorEnabled: true });
      setStatus({ enabled: true });
      setStep("status");
      setVerificationCode("");
    } catch (err) {
      error(err.response?.data?.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async (e) => {
    e.preventDefault();
    if (!password) {
      error("Password is required");
      return;
    }

    try {
      setLoading(true);
      await authAPI.disable2FA(password);
      success("Two-factor authentication disabled");
      updateUser({ twoFactorEnabled: false });
      setStatus({ enabled: false });
      setStep("status");
      setPassword("");
    } catch (err) {
      error(err.response?.data?.message || "Failed to disable 2FA");
    } finally {
      setLoading(false);
    }
  };

  if (loading && step === "status") {
    return (
      <div className="card shadow-sm">
        <div className="card-body text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-white">
        <h5 className="mb-0">
          <i className="fas fa-shield-alt me-2 text-primary"></i>
          Two-Factor Authentication (2FA)
        </h5>
      </div>
      <div className="card-body">
        {step === "status" && (
          <>
            <div className="d-flex align-items-center justify-content-between mb-4">
              <div>
                <h6 className="mb-1">Status</h6>
                {status.enabled ? (
                  <span className="badge bg-success fs-6">
                    <i className="fas fa-check-circle me-1"></i>Enabled
                  </span>
                ) : (
                  <span className="badge bg-secondary fs-6">
                    <i className="fas fa-times-circle me-1"></i>Disabled
                  </span>
                )}
              </div>
              {!status.enabled ? (
                <button
                  className="btn btn-primary"
                  onClick={handleSendCode}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Sending...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-envelope me-2"></i>Enable 2FA
                    </>
                  )}
                </button>
              ) : (
                <button
                  className="btn btn-outline-danger"
                  onClick={() => setStep("disable")}
                >
                  <i className="fas fa-times me-2"></i>Disable 2FA
                </button>
              )}
            </div>

            <div className="alert alert-info mb-0">
              <i className="fas fa-info-circle me-2"></i>
              <strong>How it works:</strong> When 2FA is enabled, you'll receive
              a verification code via email each time you log in. This adds an
              extra layer of security to your account.
            </div>

            {status.enabled && (
              <div className="mt-3 p-3 bg-light rounded">
                <div className="d-flex align-items-center">
                  <i className="fas fa-envelope fa-2x text-primary me-3"></i>
                  <div>
                    <strong>Email Verification</strong>
                    <p className="mb-0 text-muted small">
                      Verification codes are sent to:{" "}
                      <strong>{user?.email}</strong>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {step === "verify" && (
          <form onSubmit={handleVerify}>
            <div className="text-center mb-4">
              <div
                className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                style={{ width: "80px", height: "80px" }}
              >
                <i className="fas fa-envelope fa-2x text-primary"></i>
              </div>
              <h5>Check Your Email</h5>
              <p className="text-muted">
                We've sent a 6-digit verification code to
                <br />
                <strong>{maskedEmail}</strong>
              </p>
            </div>

            <div className="mb-4">
              <label className="form-label">Enter Verification Code</label>
              <input
                type="text"
                className="form-control form-control-lg text-center"
                placeholder="000000"
                value={verificationCode}
                onChange={(e) =>
                  setVerificationCode(
                    e.target.value.replace(/\D/g, "").slice(0, 6)
                  )
                }
                maxLength={6}
                style={{ letterSpacing: "0.5em", fontSize: "1.5rem" }}
                autoFocus
              />
              <div className="form-text">Code expires in 5 minutes</div>
            </div>

            <div className="d-grid gap-2">
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={loading || verificationCode.length !== 6}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Verifying...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check me-2"></i>Verify & Enable 2FA
                  </>
                )}
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handleSendCode}
                disabled={loading}
              >
                <i className="fas fa-redo me-2"></i>Resend Code
              </button>
              <button
                type="button"
                className="btn btn-link text-muted"
                onClick={() => {
                  setStep("status");
                  setVerificationCode("");
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {step === "disable" && (
          <form onSubmit={handleDisable}>
            <div className="alert alert-warning mb-4">
              <i className="fas fa-exclamation-triangle me-2"></i>
              <strong>Warning:</strong> Disabling 2FA will make your account
              less secure. You will no longer need a verification code to log
              in.
            </div>

            <div className="mb-4">
              <label className="form-label">
                Enter Your Password to Confirm
              </label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="d-grid gap-2">
              <button
                type="submit"
                className="btn btn-danger"
                disabled={loading || !password}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Disabling...
                  </>
                ) : (
                  <>
                    <i className="fas fa-shield-alt me-2"></i>Disable 2FA
                  </>
                )}
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => {
                  setStep("status");
                  setPassword("");
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default TwoFactorSetup;
