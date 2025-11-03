import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { customerAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useFlash } from "../../context/FlashContext";
import { useCartAnimation } from "../../hooks/useCartAnimation";
import ModelViewer from "../../components/ModelViewer";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5174";

const DesignStudio = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { showFlash } = useFlash();
  const modelViewerRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "T-Shirt",
    gender: "Men",
    fabric: "Cotton",
    color: "#ffffff",
    pattern: "Solid",
    size: "M",
    customText: "",
    customImage: "",
    graphic: "None",
  });

  const [submitting, setSubmitting] = useState(false);

  const { animateToCart } = useCartAnimation(() => {
    const cartBadge = document.getElementById("cart-badge");
    if (cartBadge) {
      cartBadge.classList.add("cart-badge-animate");
      setTimeout(() => cartBadge.classList.remove("cart-badge-animate"), 400);
    }
  });
  const [sustainabilityScore, setSustainabilityScore] = useState(50);
  const [estimatedPrice, setEstimatedPrice] = useState(1200);
  const [shakeError, setShakeError] = useState(false);
  const [graphics, setGraphics] = useState([]);

  // Fabric sustainability scores (matching EJS)
  const fabricScores = {
    Cotton: 75,
    Linen: 85,
    Silk: 65,
    Polyester: 40,
    Wool: 70,
    Denim: 60,
  };

  // Fabric price multipliers
  const fabricMultipliers = {
    Cotton: 1.0,
    Linen: 1.3,
    Silk: 2.0,
    Polyester: 0.8,
    Wool: 1.5,
    Denim: 1.2,
  };

  // Calculate sustainability score and price when fabric changes
  useEffect(() => {
    const score = fabricScores[formData.fabric] || 50;
    setSustainabilityScore(score);

    const basePrice = 1200;
    const multiplier = fabricMultipliers[formData.fabric] || 1.0;
    setEstimatedPrice(basePrice * multiplier);
  }, [formData.fabric]);

  useEffect(() => {
    if (!user) {
      showFlash("Please login to access Design Studio", "error");
      navigate("/login");
    }
  }, [user]);

  // Fetch graphics with stock status
  useEffect(() => {
    const fetchGraphics = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/graphics/all`, {
          withCredentials: true,
        });
        if (response.data.success) {
          console.log("Graphics loaded:", response.data.graphics);
          setGraphics(response.data.graphics);
        }
      } catch (error) {
        console.error("Error fetching graphics:", error);
      }
    };
    fetchGraphics();
  }, []);

  // Load design from URL if designId is present
  useEffect(() => {
    const loadDesign = async () => {
      const designId = searchParams.get("designId");
      if (designId) {
        try {
          const response = await axios.get(
            `${API_BASE_URL}/customer/designs/${designId}`,
            { withCredentials: true }
          );
          if (response.data.success && response.data.design) {
            const design = response.data.design;
            setFormData({
              name: design.name || "",
              category: design.category || "T-Shirt",
              gender: design.gender || "Men",
              fabric: design.fabric || "Cotton",
              color: design.color || "#ffffff",
              pattern: design.pattern || "Solid",
              size: design.size || "M",
              customText: design.customText || "",
              customImage: design.customImage || "",
              graphic: design.graphic || "None",
            });
            showFlash("Design loaded successfully", "success");
          }
        } catch (error) {
          console.error("Error loading design:", error);
          showFlash("Failed to load design", "error");
        }
      }
    };
    loadDesign();
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    // Reset to default values
    setFormData((prev) => ({
      ...prev,
      color: "#ffffff",
      graphic: "None",
    }));
  };

  const validateDesign = () => {
    // Validate design name first (before showing shake animation)
    if (!formData.name || formData.name.trim().length < 3) {
      setShakeError(true);
      setTimeout(() => setShakeError(false), 600);
      showFlash("Please enter a design name (minimum 3 characters)", "error");
      return false;
    }

    // Check if graphic is selected (main requirement)
    if (formData.graphic === "None") {
      setShakeError(true);
      setTimeout(() => setShakeError(false), 600);
      showFlash(
        "🚫 Please select a graphic design to customize your clothing!",
        "danger"
      );
      return false;
    }

    // If name and graphic are provided, validation passes
    // Other customizations are optional

    // Validate category
    if (!formData.category || formData.category === "") {
      showFlash("Please select a category", "error");
      return false;
    }

    // Validate fabric
    if (!formData.fabric || formData.fabric === "") {
      showFlash("Please select a fabric", "error");
      return false;
    }

    // Validate size
    if (!formData.size || formData.size === "") {
      showFlash("Please select a size", "error");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e, action) => {
    e.preventDefault();

    // Run validation
    if (!validateDesign()) {
      return;
    }

    try {
      setSubmitting(true);

      // Add sustainability score and price to form data
      const designData = {
        ...formData,
        price: estimatedPrice,
        sustainabilityScore: sustainabilityScore,
        formAction: action,
      };

      if (action === "save") {
        // Save design and place order
        const saveResponse = await customerAPI.saveDesign(designData);
        if (saveResponse.data.success && saveResponse.data.design) {
          // Add to cart and navigate to checkout
          await customerAPI.addToCart({
            designId: saveResponse.data.design._id,
            quantity: 1,
            size: formData.size,
            color: formData.color,
          });
          showFlash("Design saved and added to cart!", "success");
          navigate("/customer/cart");
        } else {
          showFlash("Design saved successfully!", "success");
          navigate("/customer/dashboard");
        }
      } else if (action === "addToCart") {
        // First save the design, then add to cart
        const saveResponse = await customerAPI.saveDesign(designData);
        if (saveResponse.data.success && saveResponse.data.design) {
          await customerAPI.addToCart({
            designId: saveResponse.data.design._id,
            quantity: 1,
            size: formData.size,
            color: formData.color,
          });

          // Trigger animation
          if (modelViewerRef.current) {
            const canvas = modelViewerRef.current.querySelector("canvas");
            if (canvas) {
              animateToCart(canvas);
            }
          }

          showFlash("Design added to cart!", "success");
        }
      } else if (action === "wishlist") {
        // First save the design, then add to wishlist
        const saveResponse = await customerAPI.saveDesign(designData);
        if (saveResponse.data.success && saveResponse.data.design) {
          await customerAPI.addToWishlist({
            designId: saveResponse.data.design._id,
          });
          showFlash("Design added to wishlist!", "success");
          navigate("/customer/dashboard");
        }
      }
    } catch (error) {
      showFlash(
        error.response?.data?.message || "Failed to save design",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container my-4">
      <div className="row mb-4">
        <div className="col-md-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <h2 className="card-title">Design Studio</h2>
              <p className="card-text">
                Create your custom clothing design by selecting fabric, colors,
                and patterns.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-8">
          <div
            className={`card shadow-sm ${shakeError ? "shake-animation" : ""}`}
          >
            <div className="card-header">
              <h3>Design Your Clothing</h3>
            </div>
            <div className="card-body">
              <form onSubmit={(e) => handleSubmit(e, "save")}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">
                    Design Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="category" className="form-label">
                      Category
                    </label>
                    <select
                      className="form-select"
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                    >
                      <option value="T-Shirt">T-Shirt</option>
                      <option value="Shirt">Shirt</option>
                      <option value="Hoodie">Hoodie</option>
                      <option value="Kurthi">Kurthi</option>
                      <option value="Dress">Dress</option>
                      <option value="Jeans">Jeans</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="gender" className="form-label">
                      Gender
                    </label>
                    <select
                      className="form-select"
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      required
                    >
                      <option value="Men">Men</option>
                      <option value="Women">Women</option>
                      <option value="Unisex">Unisex</option>
                    </select>
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="fabric" className="form-label">
                      Fabric
                    </label>
                    <select
                      className="form-select"
                      id="fabric"
                      name="fabric"
                      value={formData.fabric}
                      onChange={handleChange}
                      required
                    >
                      <option value="Cotton">Cotton</option>
                      <option value="Linen">Linen</option>
                      <option value="Silk">Silk</option>
                      <option value="Polyester">Polyester</option>
                      <option value="Wool">Wool</option>
                      <option value="Denim">Denim</option>
                      <option value="Fleece">Fleece</option>
                      <option value="Jersey">Jersey</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="size" className="form-label">
                      Size
                    </label>
                    <select
                      className="form-select"
                      id="size"
                      name="size"
                      value={formData.size}
                      onChange={handleChange}
                      required
                    >
                      <option value="XS">XS</option>
                      <option value="S">S</option>
                      <option value="M">M</option>
                      <option value="L">L</option>
                      <option value="XL">XL</option>
                      <option value="XXL">XXL</option>
                    </select>
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="color" className="form-label">
                      Color
                    </label>
                    <input
                      type="color"
                      className="form-control form-control-color"
                      id="color"
                      name="color"
                      value={formData.color}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="pattern" className="form-label">
                      Pattern
                    </label>
                    <select
                      className="form-select"
                      id="pattern"
                      name="pattern"
                      value={formData.pattern}
                      onChange={handleChange}
                    >
                      <option value="Solid">Solid</option>
                      <option value="Striped">Striped</option>
                      <option value="Checkered">Checkered</option>
                      <option value="Floral">Floral</option>
                      <option value="Abstract">Abstract</option>
                      <option value="Polka Dot">Polka Dot</option>
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Graphics (Optional)</label>
                  <div className="row g-2">
                    <div className="col-3">
                      <div className="form-check">
                        <input
                          className="form-check-input d-none"
                          type="radio"
                          name="graphic"
                          id="graphicNone"
                          value="None"
                          checked={formData.graphic === "None"}
                          onChange={handleChange}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="graphicNone"
                          style={{ cursor: "pointer" }}
                        >
                          <div
                            className="border rounded p-2 text-center"
                            style={{
                              border:
                                formData.graphic === "None"
                                  ? "2px solid #0d6efd"
                                  : "1px solid #dee2e6",
                            }}
                          >
                            <small>None</small>
                          </div>
                        </label>
                      </div>
                    </div>
                    {graphics.map((graphic) => {
                      const isOutOfStock = graphic.inStock === false;
                      console.log(
                        `Graphic ${graphic._id}: inStock=${graphic.inStock}, isOutOfStock=${isOutOfStock}`
                      );
                      return (
                        <div key={graphic._id} className="col-3">
                          <div className="form-check">
                            <input
                              className="form-check-input d-none"
                              type="radio"
                              name="graphic"
                              id={`graphic${graphic._id}`}
                              value={graphic.filename}
                              checked={formData.graphic === graphic.filename}
                              onChange={handleChange}
                              disabled={isOutOfStock}
                            />
                            <label
                              className="form-check-label"
                              htmlFor={`graphic${graphic._id}`}
                              style={{
                                cursor: isOutOfStock
                                  ? "not-allowed"
                                  : "pointer",
                                position: "relative",
                              }}
                            >
                              <img
                                src={`${API_BASE_URL}${graphic.graphic}`}
                                alt={graphic.name}
                                className="img-fluid rounded"
                                style={{
                                  border:
                                    formData.graphic === graphic.filename
                                      ? "2px solid #0d6efd"
                                      : "1px solid #dee2e6",
                                  objectFit: "cover",
                                  width: "100%",
                                  aspectRatio: "1/1",
                                  opacity: isOutOfStock ? 0.5 : 1,
                                  filter: isOutOfStock
                                    ? "grayscale(50%)"
                                    : "none",
                                }}
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                              {isOutOfStock && (
                                <div
                                  style={{
                                    position: "absolute",
                                    top: "50%",
                                    left: "50%",
                                    transform:
                                      "translate(-50%, -50%) rotate(-15deg)",
                                    backgroundColor: "rgba(220, 53, 69, 0.9)",
                                    color: "white",
                                    padding: "4px 12px",
                                    borderRadius: "4px",
                                    fontSize: "0.75rem",
                                    fontWeight: "bold",
                                    whiteSpace: "nowrap",
                                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                                  }}
                                >
                                  OUT OF STOCK
                                </div>
                              )}
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="customText" className="form-label">
                    Custom Text (Optional)
                  </label>
                  <textarea
                    className="form-control"
                    id="customText"
                    name="customText"
                    value={formData.customText}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Add custom text to your design..."
                  />
                </div>

                <div className="d-flex gap-2 flex-wrap">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={(e) => handleSubmit(e, "save")}
                    disabled={submitting}
                  >
                    <i className="fas fa-save me-2"></i>
                    {submitting ? "Saving..." : "Save & Place Order"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={(e) => handleSubmit(e, "addToCart")}
                    disabled={submitting}
                  >
                    <i className="fas fa-shopping-cart me-2"></i>
                    Add to Cart
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={(e) => handleSubmit(e, "wishlist")}
                    disabled={submitting}
                  >
                    <i className="fas fa-heart me-2"></i>
                    Save to Wishlist
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-header">
              <h3>3D Preview</h3>
            </div>
            <div className="card-body" ref={modelViewerRef}>
              {/* 3D Model Viewer */}
              <ModelViewer
                category={formData.category}
                gender={formData.gender}
                color={formData.color}
                graphic={formData.graphic}
                onReset={handleReset}
              />

              {/* Custom Text Display */}
              {formData.customText && (
                <div className="mt-3 p-3 bg-light rounded text-center">
                  <p className="mb-0 fw-bold">{formData.customText}</p>
                </div>
              )}

              {/* Selected Options Preview */}
              <div className="mt-3">
                <h5>Selected Options:</h5>
                <ul className="list-group list-group-flush">
                  <li className="list-group-item d-flex justify-content-between">
                    <span>Category:</span>
                    <span className="fw-bold">{formData.category}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between">
                    <span>Fabric:</span>
                    <span className="fw-bold">{formData.fabric}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between">
                    <span>Color:</span>
                    <span className="fw-bold">{formData.color}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between">
                    <span>Pattern:</span>
                    <span className="fw-bold">{formData.pattern}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between">
                    <span>Size:</span>
                    <span className="fw-bold">{formData.size}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between">
                    <span>Graphic:</span>
                    <span className="fw-bold">{formData.graphic}</span>
                  </li>
                </ul>
              </div>

              {/* Sustainability Score */}
              <div className="mt-3 p-3 bg-success bg-opacity-10 rounded">
                <h6 className="text-success">
                  <i className="fas fa-leaf me-2"></i>Sustainability Score
                </h6>
                <div className="d-flex align-items-center">
                  <div
                    className="progress flex-grow-1 me-3"
                    style={{ height: "20px" }}
                  >
                    <div
                      className={`progress-bar ${
                        sustainabilityScore >= 70
                          ? "bg-success"
                          : sustainabilityScore >= 50
                          ? "bg-warning"
                          : "bg-danger"
                      }`}
                      role="progressbar"
                      style={{ width: `${sustainabilityScore}%` }}
                      aria-valuenow={sustainabilityScore}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    ></div>
                  </div>
                  <strong>{sustainabilityScore}/100</strong>
                </div>
                <small className="text-muted">
                  {sustainabilityScore >= 70
                    ? "Excellent eco-friendly choice!"
                    : sustainabilityScore >= 50
                    ? "Good sustainable option"
                    : "Consider more sustainable fabrics"}
                </small>
              </div>

              {/* Estimated Price */}
              <div className="mt-3 p-3 bg-primary bg-opacity-10 rounded">
                <h6 className="text-primary">
                  <i className="fas fa-rupee-sign me-2"></i>Estimated Price
                </h6>
                <h4 className="mb-0 text-primary">
                  ₹{estimatedPrice.toFixed(2)}
                </h4>
                <small className="text-muted">
                  Price varies based on fabric selection
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignStudio;
