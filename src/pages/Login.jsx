import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useFlash } from "../context/FlashContext";
import { validateEmail } from "../utils/validation";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { success, error } = useFlash();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 2FA state
  const [requires2FA, setRequires2FA] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.valid) {
      newErrors.email = emailValidation.message;
      console.log("Email validation failed:", emailValidation.message);
    }

    if (!formData.password || formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
      console.log("Password validation failed");
    }

    setErrors(newErrors);
    console.log("Validation errors:", newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      console.log("Attempting login with:", formData.email);

      // Include 2FA code if required
      const credentials = {
        ...formData,
        ...(requires2FA && { twoFactorCode }),
      };

      const result = await login(credentials);
      console.log("Login result:", result);

      // Check if 2FA is required
      if (result.requires2FA) {
        setRequires2FA(true);
        setLoading(false);
        return;
      }

      success("Login successful!");

      // Navigate based on user role
      if (result.user?.role === "admin") {
        navigate("/admin/dashboard");
      } else if (result.user?.role === "designer") {
        navigate("/designer/dashboard");
      } else if (result.user?.role === "manager") {
        navigate("/manager/dashboard");
      } else if (result.user?.role === "delivery") {
        navigate("/delivery/dashboard");
      } else {
        navigate("/customer/dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);
      const message =
        err.response?.data?.message ||
        err.message ||
        "Login failed. Please try again.";

      // Check if 2FA is required from error response
      if (err.response?.data?.requires2FA) {
        setRequires2FA(true);
      } else if (err.response?.data?.pendingApproval) {
        // Show pending approval message with warning style
        error(`⏳ ${message}`);
      } else {
        error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setRequires2FA(false);
    setTwoFactorCode("");
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <div className="card shadow-sm">
          <div className="card-body p-4">
            <h2 className="text-center mb-4">
              {requires2FA
                ? "Two-Factor Authentication"
                : "Login to Your Account"}
            </h2>

            {/* Debug info */}
            {Object.keys(errors).length > 0 && (
              <div className="alert alert-danger" role="alert">
                <strong>Validation Errors:</strong>
                <ul className="mb-0 mt-2">
                  {Object.entries(errors).map(([field, message]) => (
                    <li key={field}>{message}</li>
                  ))}
                </ul>
              </div>
            )}

            {requires2FA ? (
              // 2FA Code Entry
              <form onSubmit={handleSubmit} noValidate>
                <div className="text-center mb-4">
                  <div
                    className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                    style={{ width: "70px", height: "70px" }}
                  >
                    <i className="fas fa-envelope fa-2x text-primary"></i>
                  </div>
                  <h5>Check Your Email</h5>
                  <p className="text-muted">
                    We've sent a verification code to your email address.
                  </p>
                </div>

                <div className="mb-3">
                  <label htmlFor="twoFactorCode" className="form-label">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-lg text-center"
                    id="twoFactorCode"
                    value={twoFactorCode}
                    onChange={(e) =>
                      setTwoFactorCode(
                        e.target.value.replace(/\D/g, "").slice(0, 6),
                      )
                    }
                    placeholder="000000"
                    maxLength={6}
                    autoComplete="one-time-code"
                    autoFocus
                    style={{ letterSpacing: "0.5em", fontSize: "1.5rem" }}
                  />
                  <div className="form-text">
                    Enter the 6-digit code sent to your email
                  </div>
                </div>

                <div className="d-grid gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading || twoFactorCode.length < 6}
                  >
                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        ></span>
                        Verifying...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-lock me-2"></i>
                        Verify & Login
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={handleBack}
                  >
                    <i className="fas fa-arrow-left me-2"></i>
                    Back to Login
                  </button>
                </div>
              </form>
            ) : (
              // Normal Login Form
              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    type="email"
                    className={`form-control ${
                      errors.email ? "is-invalid" : ""
                    }`}
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter your email"
                  />
                  {errors.email && (
                    <div className="invalid-feedback">{errors.email}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <div className="input-group">
                    <input
                      type={showPassword ? "text" : "password"}
                      className={`form-control ${
                        errors.password ? "is-invalid" : ""
                      }`}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                      style={{ borderColor: errors.password ? "#dc3545" : "" }}
                    >
                      <i
                        className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
                      ></i>
                    </button>
                    {errors.password && (
                      <div className="invalid-feedback">{errors.password}</div>
                    )}
                  </div>
                </div>

                <div className="d-grid">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        ></span>
                        Logging in...
                      </>
                    ) : (
                      "Login"
                    )}
                  </button>
                </div>
              </form>
            )}

            <div className="text-center mt-3">
              <p>
                Don&apos;t have an account? <Link to="/signup">Sign Up</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
