import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useFlash } from "../context/FlashContext";
import {
  validateEmail,
  validatePassword,
  validateIndianPhoneNumber,
} from "../utils/validation";

const Signup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signup } = useAuth();
  const { error: showError, success: showSuccess } = useFlash();

  // Check if role is specified in URL
  const initialRole = searchParams.get("role") === "designer" ? "designer" : "";

  const [step, setStep] = useState(initialRole ? 2 : 1); // Start at role selection if no role specified
  const [selectedRole, setSelectedRole] = useState(initialRole);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    contactNumber: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    // Designer-specific fields
    bio: "",
    specializations: [],
    experience: "",
    portfolioUrl: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const specializations = [
    "T-Shirts",
    "Formal Wear",
    "Casual Wear",
    "Ethnic Wear",
    "Streetwear",
    "Sustainable Fashion",
    "Kids Wear",
    "Hoodies",
    "Party Wear",
    "Bridal",
    "Business Attire",
    "Dresses",
  ];

  useEffect(() => {
    // If role changes from URL, update the state
    if (searchParams.get("role") === "designer" && !selectedRole) {
      setSelectedRole("designer");
      setStep(2);
    }
  }, [searchParams, selectedRole]);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setStep(2);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox" && name === "specializations") {
      setFormData((prev) => ({
        ...prev,
        specializations: checked
          ? [...prev.specializations, value]
          : prev.specializations.filter((s) => s !== value),
      }));
    } else if (name === "contactNumber") {
      const cleaned = value.replace(/[^0-9]/g, "").slice(0, 10);
      setFormData((prev) => ({ ...prev, [name]: cleaned }));
    } else if (name === "pincode") {
      const cleaned = value.replace(/[^0-9]/g, "").slice(0, 6);
      setFormData((prev) => ({ ...prev, [name]: cleaned }));
    } else if (name === "firstName" || name === "lastName") {
      const cleaned = value.replace(/[^a-zA-Z\s]/g, "");
      setFormData((prev) => ({ ...prev, [name]: cleaned }));
    } else if (name === "experience") {
      const cleaned = value.replace(/[^0-9]/g, "").slice(0, 2);
      setFormData((prev) => ({ ...prev, [name]: cleaned }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    // Basic validations
    const firstName = formData.firstName.trim();
    if (!firstName) {
      newErrors.firstName = "First name is required";
    } else if (!/^[a-zA-Z\s]+$/.test(firstName)) {
      newErrors.firstName = "First name can only contain alphabets";
    } else if (firstName.length < 2 || firstName.length > 50) {
      newErrors.firstName = "First name must be between 2 and 50 characters";
    }

    const lastName = formData.lastName.trim();
    if (!lastName) {
      newErrors.lastName = "Last name is required";
    } else if (!/^[a-zA-Z\s]+$/.test(lastName)) {
      newErrors.lastName = "Last name can only contain alphabets";
    } else if (lastName.length < 2 || lastName.length > 50) {
      newErrors.lastName = "Last name must be between 2 and 50 characters";
    }

    const username = formData.username.trim();
    if (username.length < 3 || username.length > 50) {
      newErrors.username = "Username must be between 3 and 50 characters";
    }

    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.valid) {
      newErrors.email = emailValidation.message;
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.valid) {
      newErrors.password = passwordValidation.message;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    const phoneValidation = validateIndianPhoneNumber(formData.contactNumber);
    if (!phoneValidation.valid) {
      newErrors.contactNumber = phoneValidation.message;
    }

    // Address validation (for customers) or optional for designers
    if (selectedRole === "customer") {
      if (!formData.street.trim())
        newErrors.street = "Street address is required";
      if (!formData.city.trim()) newErrors.city = "City is required";
      if (!formData.state.trim()) newErrors.state = "State is required";
      if (!formData.pincode.trim()) {
        newErrors.pincode = "Pincode is required";
      } else if (!/^[0-9]{6}$/.test(formData.pincode)) {
        newErrors.pincode = "Pincode must be 6 digits";
      }
    }

    // Designer-specific validations
    if (selectedRole === "designer") {
      if (!formData.bio.trim() || formData.bio.length < 50) {
        newErrors.bio = "Please write at least 50 characters about yourself";
      }
      if (formData.specializations.length === 0) {
        newErrors.specializations = "Please select at least one specialization";
      }
      if (!formData.experience) {
        newErrors.experience = "Please enter your years of experience";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const signupData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        contactNumber: formData.contactNumber,
        role: selectedRole,
      };

      if (selectedRole === "customer") {
        signupData.address = {
          street: formData.street.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          pincode: formData.pincode.trim(),
        };
      }

      if (selectedRole === "designer") {
        signupData.designerProfile = {
          bio: formData.bio.trim(),
          specializations: formData.specializations,
          experience: parseInt(formData.experience) || 0,
          portfolioUrl: formData.portfolioUrl.trim(),
          portfolio: [],
          rating: 0,
          totalRatings: 0,
          completedOrders: 0,
          isAvailable: true,
          priceRange: { min: 500, max: 5000 },
          turnaroundDays: 7,
          badges: ["New Designer"],
        };
        signupData.approved = false; // Designers need admin approval
      }

      await signup(signupData);

      if (selectedRole === "designer") {
        showSuccess(
          "Application submitted! Your account will be reviewed within 24-48 hours.",
        );
      } else {
        showSuccess("Account created successfully! Welcome to DesignDen!");
      }
      navigate("/");
    } catch (err) {
      const message =
        err.response?.data?.message || "Signup failed. Please try again.";
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Role Selection
  if (step === 1) {
    return (
      <div className="container py-5">
        <div className="text-center mb-5">
          <h1 className="display-5 fw-bold">Join DesignDen</h1>
          <p className="lead text-muted">
            Choose how you want to use our platform
          </p>
        </div>

        <div className="row justify-content-center g-4">
          {/* Customer Card */}
          <div className="col-md-5">
            <div
              className="card h-100 shadow-lg border-0 cursor-pointer role-card"
              onClick={() => handleRoleSelect("customer")}
              style={{
                cursor: "pointer",
                transition: "transform 0.3s, box-shadow 0.3s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-10px)";
                e.currentTarget.style.boxShadow =
                  "0 20px 40px rgba(0,0,0,0.15)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "";
              }}
            >
              <div className="card-body p-5 text-center">
                <div
                  className="rounded-circle bg-primary bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-4"
                  style={{ width: "100px", height: "100px" }}
                >
                  <i className="fas fa-shopping-bag fa-3x text-primary"></i>
                </div>
                <h2 className="card-title h3 mb-3">I&apos;m a Customer</h2>
                <p className="card-text text-muted mb-4">
                  I want to order custom clothing, browse designer portfolios,
                  and get unique fashion pieces made for me.
                </p>
                <ul className="list-unstyled text-start mb-4">
                  <li className="mb-2">
                    <i className="fas fa-check text-success me-2"></i>
                    Browse talented designers
                  </li>
                  <li className="mb-2">
                    <i className="fas fa-check text-success me-2"></i>
                    Order custom clothing
                  </li>
                  <li className="mb-2">
                    <i className="fas fa-check text-success me-2"></i>
                    Use interactive design studio
                  </li>
                  <li className="mb-2">
                    <i className="fas fa-check text-success me-2"></i>
                    Track orders in real-time
                  </li>
                  <li className="mb-2">
                    <i className="fas fa-check text-success me-2"></i>
                    Shop ready-made designs
                  </li>
                </ul>
                <button className="btn btn-primary btn-lg w-100">
                  <i className="fas fa-arrow-right me-2"></i>
                  Continue as Customer
                </button>
              </div>
            </div>
          </div>

          {/* Designer Card */}
          <div className="col-md-5">
            <div
              className="card h-100 shadow-lg border-0"
              onClick={() => handleRoleSelect("designer")}
              style={{
                cursor: "pointer",
                transition: "transform 0.3s, box-shadow 0.3s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-10px)";
                e.currentTarget.style.boxShadow =
                  "0 20px 40px rgba(102, 126, 234, 0.3)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "";
              }}
            >
              <div
                className="card-body p-5 text-center"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)",
                }}
              >
                <div
                  className="rounded-circle d-inline-flex align-items-center justify-content-center mb-4"
                  style={{
                    width: "100px",
                    height: "100px",
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  }}
                >
                  <i className="fas fa-paint-brush fa-3x text-white"></i>
                </div>
                <h2 className="card-title h3 mb-3">I&apos;m a Designer</h2>
                <p className="card-text text-muted mb-4">
                  I want to showcase my designs, take custom orders from
                  customers, and earn money doing what I love.
                </p>
                <ul className="list-unstyled text-start mb-4">
                  <li className="mb-2">
                    <i className="fas fa-check text-success me-2"></i>
                    Showcase your portfolio
                  </li>
                  <li className="mb-2">
                    <i className="fas fa-check text-success me-2"></i>
                    Receive custom orders
                  </li>
                  <li className="mb-2">
                    <i className="fas fa-check text-success me-2"></i>
                    Earn <strong>80% commission</strong>
                  </li>
                  <li className="mb-2">
                    <i className="fas fa-check text-success me-2"></i>
                    Fast & secure payouts
                  </li>
                  <li className="mb-2">
                    <i className="fas fa-check text-success me-2"></i>
                    Build your reputation
                  </li>
                </ul>
                <button
                  className="btn btn-lg w-100 text-white"
                  style={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  }}
                >
                  <i className="fas fa-rocket me-2"></i>
                  Join as Designer
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-5">
          <p className="text-muted">
            Already have an account?{" "}
            <Link to="/login" className="text-primary fw-bold">
              Log in
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // Step 2: Registration Form
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          {/* Header */}
          <div className="text-center mb-4">
            <button
              className="btn btn-link text-muted mb-3"
              onClick={() => {
                setStep(1);
                setSelectedRole("");
              }}
            >
              <i className="fas fa-arrow-left me-2"></i>
              Change account type
            </button>
            <div
              className={`d-inline-flex align-items-center justify-content-center rounded-circle mb-3 ${
                selectedRole === "designer" ? "" : "bg-primary bg-opacity-10"
              }`}
              style={{
                width: "80px",
                height: "80px",
                background:
                  selectedRole === "designer"
                    ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    : undefined,
              }}
            >
              <i
                className={`fas ${selectedRole === "designer" ? "fa-paint-brush text-white" : "fa-shopping-bag text-primary"} fa-2x`}
              ></i>
            </div>
            <h2 className="mb-1">
              {selectedRole === "designer"
                ? "Join as a Designer"
                : "Create Your Account"}
            </h2>
            <p className="text-muted">
              {selectedRole === "designer"
                ? "Share your talent with thousands of customers"
                : "Start ordering custom clothing today"}
            </p>
          </div>

          <div className="card shadow-sm border-0">
            <div className="card-body p-4 p-md-5">
              <form onSubmit={handleSubmit} noValidate>
                {/* Personal Information */}
                <h5 className="mb-4 pb-2 border-bottom">
                  <i className="fas fa-user me-2 text-primary"></i>
                  Personal Information
                </h5>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="firstName" className="form-label">
                      First Name *
                    </label>
                    <input
                      type="text"
                      className={`form-control ${errors.firstName ? "is-invalid" : ""}`}
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Enter first name"
                    />
                    {errors.firstName && (
                      <div className="invalid-feedback">{errors.firstName}</div>
                    )}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="lastName" className="form-label">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      className={`form-control ${errors.lastName ? "is-invalid" : ""}`}
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Enter last name"
                    />
                    {errors.lastName && (
                      <div className="invalid-feedback">{errors.lastName}</div>
                    )}
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="username" className="form-label">
                    Username *
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">@</span>
                    <input
                      type="text"
                      className={`form-control ${errors.username ? "is-invalid" : ""}`}
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Choose a unique username"
                    />
                    {errors.username && (
                      <div className="invalid-feedback">{errors.username}</div>
                    )}
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="email" className="form-label">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      className={`form-control ${errors.email ? "is-invalid" : ""}`}
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                    />
                    {errors.email && (
                      <div className="invalid-feedback">{errors.email}</div>
                    )}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="contactNumber" className="form-label">
                      Phone Number *
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">+91</span>
                      <input
                        type="tel"
                        className={`form-control ${errors.contactNumber ? "is-invalid" : ""}`}
                        id="contactNumber"
                        name="contactNumber"
                        value={formData.contactNumber}
                        onChange={handleChange}
                        placeholder="10-digit number"
                        maxLength="10"
                      />
                      {errors.contactNumber && (
                        <div className="invalid-feedback">
                          {errors.contactNumber}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="password" className="form-label">
                      Password *
                    </label>
                    <div className="input-group">
                      <input
                        type={showPassword ? "text" : "password"}
                        className={`form-control ${errors.password ? "is-invalid" : ""}`}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Create a strong password"
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                        style={{
                          borderColor: errors.password ? "#dc3545" : "",
                        }}
                      >
                        <i
                          className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
                        ></i>
                      </button>
                      {errors.password && (
                        <div className="invalid-feedback">
                          {errors.password}
                        </div>
                      )}
                    </div>
                    <small className="text-muted">
                      Min 8 chars with uppercase, lowercase, number, special
                      char
                    </small>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="confirmPassword" className="form-label">
                      Confirm Password *
                    </label>
                    <div className="input-group">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Re-enter your password"
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        tabIndex={-1}
                        style={{
                          borderColor: errors.confirmPassword ? "#dc3545" : "",
                        }}
                      >
                        <i
                          className={`fas ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"}`}
                        ></i>
                      </button>
                      {errors.confirmPassword && (
                        <div className="invalid-feedback">
                          {errors.confirmPassword}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Customer: Delivery Address */}
                {selectedRole === "customer" && (
                  <>
                    <h5 className="mb-4 mt-4 pb-2 border-bottom">
                      <i className="fas fa-map-marker-alt me-2 text-primary"></i>
                      Delivery Address
                    </h5>

                    <div className="mb-3">
                      <label htmlFor="street" className="form-label">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.street ? "is-invalid" : ""}`}
                        id="street"
                        name="street"
                        value={formData.street}
                        onChange={handleChange}
                        placeholder="House/Flat no., Street name, Landmark"
                      />
                      {errors.street && (
                        <div className="invalid-feedback">{errors.street}</div>
                      )}
                    </div>

                    <div className="row">
                      <div className="col-md-4 mb-3">
                        <label htmlFor="city" className="form-label">
                          City *
                        </label>
                        <input
                          type="text"
                          className={`form-control ${errors.city ? "is-invalid" : ""}`}
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          placeholder="City"
                        />
                        {errors.city && (
                          <div className="invalid-feedback">{errors.city}</div>
                        )}
                      </div>
                      <div className="col-md-4 mb-3">
                        <label htmlFor="state" className="form-label">
                          State *
                        </label>
                        <input
                          type="text"
                          className={`form-control ${errors.state ? "is-invalid" : ""}`}
                          id="state"
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          placeholder="State"
                        />
                        {errors.state && (
                          <div className="invalid-feedback">{errors.state}</div>
                        )}
                      </div>
                      <div className="col-md-4 mb-3">
                        <label htmlFor="pincode" className="form-label">
                          Pincode *
                        </label>
                        <input
                          type="text"
                          className={`form-control ${errors.pincode ? "is-invalid" : ""}`}
                          id="pincode"
                          name="pincode"
                          value={formData.pincode}
                          onChange={handleChange}
                          placeholder="6 digits"
                          maxLength="6"
                        />
                        {errors.pincode && (
                          <div className="invalid-feedback">
                            {errors.pincode}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Designer: Professional Info */}
                {selectedRole === "designer" && (
                  <>
                    <h5 className="mb-4 mt-4 pb-2 border-bottom">
                      <i className="fas fa-palette me-2 text-primary"></i>
                      Professional Information
                    </h5>

                    <div className="mb-3">
                      <label htmlFor="bio" className="form-label">
                        About You *
                      </label>
                      <textarea
                        className={`form-control ${errors.bio ? "is-invalid" : ""}`}
                        id="bio"
                        name="bio"
                        rows="4"
                        value={formData.bio}
                        onChange={handleChange}
                        placeholder="Tell customers about your design style, experience, and what makes you unique. This will appear on your profile. (Min 50 characters)"
                      ></textarea>
                      {errors.bio && (
                        <div className="invalid-feedback">{errors.bio}</div>
                      )}
                      <small className="text-muted">
                        {formData.bio.length}/50 characters minimum
                      </small>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">
                        Specializations *{" "}
                        <small className="text-muted">
                          (Select all that apply)
                        </small>
                      </label>
                      <div
                        className={`p-3 border rounded ${errors.specializations ? "border-danger" : ""}`}
                      >
                        <div className="row">
                          {specializations.map((spec) => (
                            <div className="col-md-4 col-6 mb-2" key={spec}>
                              <div className="form-check">
                                <input
                                  type="checkbox"
                                  className="form-check-input"
                                  id={`spec-${spec}`}
                                  name="specializations"
                                  value={spec}
                                  checked={formData.specializations.includes(
                                    spec,
                                  )}
                                  onChange={handleChange}
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor={`spec-${spec}`}
                                >
                                  {spec}
                                </label>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      {errors.specializations && (
                        <div className="text-danger small mt-1">
                          {errors.specializations}
                        </div>
                      )}
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="experience" className="form-label">
                          Years of Experience *
                        </label>
                        <div className="input-group">
                          <input
                            type="text"
                            className={`form-control ${errors.experience ? "is-invalid" : ""}`}
                            id="experience"
                            name="experience"
                            value={formData.experience}
                            onChange={handleChange}
                            placeholder="e.g., 5"
                            maxLength="2"
                          />
                          <span className="input-group-text">years</span>
                          {errors.experience && (
                            <div className="invalid-feedback">
                              {errors.experience}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="portfolioUrl" className="form-label">
                          Portfolio Link{" "}
                          <small className="text-muted">(Optional)</small>
                        </label>
                        <input
                          type="url"
                          className="form-control"
                          id="portfolioUrl"
                          name="portfolioUrl"
                          value={formData.portfolioUrl}
                          onChange={handleChange}
                          placeholder="https://your-portfolio.com"
                        />
                      </div>
                    </div>

                    {/* Designer Info Box */}
                    <div className="alert alert-info mt-4">
                      <h6 className="alert-heading">
                        <i className="fas fa-info-circle me-2"></i>
                        What happens next?
                      </h6>
                      <ul className="mb-0 small">
                        <li>
                          Your application will be reviewed within 24-48 hours
                        </li>
                        <li>Once approved, you can start receiving orders</li>
                        <li>
                          You&apos;ll earn <strong>80% commission</strong> on
                          every order
                        </li>
                        <li>Minimum payout is ₹500, processed within 3 days</li>
                      </ul>
                    </div>
                  </>
                )}

                {/* Submit Button */}
                <div className="d-grid mt-4">
                  <button
                    type="submit"
                    className={`btn btn-lg ${selectedRole === "designer" ? "" : "btn-primary"}`}
                    style={
                      selectedRole === "designer"
                        ? {
                            background:
                              "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            color: "white",
                          }
                        : {}
                    }
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        {selectedRole === "designer"
                          ? "Submitting Application..."
                          : "Creating Account..."}
                      </>
                    ) : (
                      <>
                        <i
                          className={`fas ${selectedRole === "designer" ? "fa-paper-plane" : "fa-user-plus"} me-2`}
                        ></i>
                        {selectedRole === "designer"
                          ? "Submit Application"
                          : "Create Account"}
                      </>
                    )}
                  </button>
                </div>

                {/* Terms */}
                <p className="text-center text-muted small mt-3">
                  By creating an account, you agree to our{" "}
                  <Link to="/terms">Terms of Service</Link> and{" "}
                  <Link to="/privacy">Privacy Policy</Link>
                </p>
              </form>
            </div>
          </div>

          <div className="text-center mt-4">
            <p>
              Already have an account?{" "}
              <Link to="/login" className="fw-bold">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
