import { useState } from "react";
import ModelViewer from "../../components/ModelViewer";
import "../../styles/Model3DShowcase.css";

const Model3DShowcase = () => {
  const [activeTab, setActiveTab] = useState("glb"); // 'glb' or 'procedural'
  const [selectedCategory, setSelectedCategory] = useState("T-Shirt");
  const [selectedGender, setSelectedGender] = useState("Men");
  const [selectedColor, setSelectedColor] = useState("#4a90e2");
  const [selectedPattern, setSelectedPattern] = useState("Solid");
  const [selectedGraphic, setSelectedGraphic] = useState("None");

  const categories = ["T-Shirt", "Shirt", "Hoodie", "Dress", "Kurthi", "Jeans"];
  const genders = ["Men", "Women", "Unisex"];
  const patterns = ["Solid", "Checkered", "Striped", "Polka Dot", "Floral"];
  const graphics = ["None", "logo.png", "skull.png", "model.png", "star.png"];

  const colorPresets = [
    { name: "White", value: "#ffffff" },
    { name: "Black", value: "#000000" },
    { name: "Red", value: "#e74c3c" },
    { name: "Blue", value: "#4a90e2" },
    { name: "Green", value: "#2ecc71" },
    { name: "Yellow", value: "#f39c12" },
    { name: "Purple", value: "#9b59b6" },
    { name: "Pink", value: "#e91e63" },
  ];

  const handleReset = () => {
    setSelectedColor("#4a90e2");
    setSelectedPattern("Solid");
    setSelectedGraphic("None");
  };

  return (
    <div className="model-showcase-container">
      <div className="container py-5">
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold mb-3">
            <i className="fas fa-cube me-3"></i>
            3D Model Showcase
          </h1>
          <p className="lead text-muted">
            Explore our clothing models in interactive 3D. Try both GLB models
            and procedurally generated designs.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="model-tabs mb-4">
          <div className="btn-group w-100" role="group">
            <button
              type="button"
              className={`btn btn-lg ${
                activeTab === "glb" ? "btn-primary" : "btn-outline-primary"
              }`}
              onClick={() => setActiveTab("glb")}
            >
              <i className="fas fa-file-download me-2"></i>
              GLB Models
            </button>
            <button
              type="button"
              className={`btn btn-lg ${
                activeTab === "procedural"
                  ? "btn-primary"
                  : "btn-outline-primary"
              }`}
              onClick={() => setActiveTab("procedural")}
            >
              <i className="fas fa-code me-2"></i>
              Procedural Models
            </button>
          </div>
        </div>

        <div className="row">
          {/* Controls Panel */}
          <div className="col-lg-4 mb-4">
            <div className="card shadow-sm">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                  <i className="fas fa-sliders-h me-2"></i>
                  Customization Options
                </h5>
              </div>
              <div className="card-body">
                {/* Category Selection */}
                <div className="mb-4">
                  <label className="form-label fw-bold">
                    <i className="fas fa-tag me-2"></i>Category
                  </label>
                  <select
                    className="form-select"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Gender Selection */}
                <div className="mb-4">
                  <label className="form-label fw-bold">
                    <i className="fas fa-venus-mars me-2"></i>Gender
                  </label>
                  <select
                    className="form-select"
                    value={selectedGender}
                    onChange={(e) => setSelectedGender(e.target.value)}
                  >
                    {genders.map((gen) => (
                      <option key={gen} value={gen}>
                        {gen}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Color Selection */}
                <div className="mb-4">
                  <label className="form-label fw-bold">
                    <i className="fas fa-palette me-2"></i>Color
                  </label>
                  <div className="color-presets mb-2">
                    {colorPresets.map((preset) => (
                      <button
                        key={preset.value}
                        type="button"
                        className={`color-preset-btn ${
                          selectedColor === preset.value ? "active" : ""
                        }`}
                        style={{ backgroundColor: preset.value }}
                        onClick={() => setSelectedColor(preset.value)}
                        title={preset.name}
                      />
                    ))}
                  </div>
                  <input
                    type="color"
                    className="form-control form-control-color w-100"
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                  />
                </div>

                {/* Pattern Selection (for procedural models) */}
                {activeTab === "procedural" && (
                  <div className="mb-4">
                    <label className="form-label fw-bold">
                      <i className="fas fa-th me-2"></i>Pattern
                    </label>
                    <select
                      className="form-select"
                      value={selectedPattern}
                      onChange={(e) => setSelectedPattern(e.target.value)}
                    >
                      {patterns.map((pattern) => (
                        <option key={pattern} value={pattern}>
                          {pattern}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Graphic Selection */}
                <div className="mb-4">
                  <label className="form-label fw-bold">
                    <i className="fas fa-image me-2"></i>Graphic
                  </label>
                  <select
                    className="form-select"
                    value={selectedGraphic}
                    onChange={(e) => setSelectedGraphic(e.target.value)}
                  >
                    {graphics.map((graphic) => (
                      <option key={graphic} value={graphic}>
                        {graphic === "None" ? "No Graphic" : graphic}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Reset Button */}
                <button
                  type="button"
                  className="btn btn-outline-secondary w-100"
                  onClick={handleReset}
                >
                  <i className="fas fa-undo me-2"></i>
                  Reset Customization
                </button>
              </div>
            </div>

            {/* Info Card */}
            <div className="card shadow-sm mt-4">
              <div className="card-body">
                <h6 className="card-title fw-bold">
                  <i className="fas fa-info-circle me-2"></i>
                  About {activeTab === "glb" ? "GLB" : "Procedural"} Models
                </h6>
                {activeTab === "glb" ? (
                  <p className="card-text small text-muted">
                    GLB models are high-quality 3D assets loaded from external
                    files. They offer realistic details and textures, perfect
                    for production-ready visualizations.
                  </p>
                ) : (
                  <p className="card-text small text-muted">
                    Procedural models are generated using Three.js primitives.
                    They're lightweight, customizable, and great for rapid
                    prototyping and pattern demonstrations.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 3D Viewer Panel */}
          <div className="col-lg-8">
            <div className="card shadow-sm">
              <div className="card-header bg-light">
                <h5 className="mb-0">
                  <i className="fas fa-eye me-2"></i>
                  3D Preview - {selectedCategory} ({selectedGender})
                </h5>
              </div>
              <div className="card-body p-0">
                <ModelViewer
                  category={selectedCategory}
                  gender={selectedGender}
                  color={selectedColor}
                  pattern={selectedPattern}
                  graphic={selectedGraphic}
                  useProceduralModel={activeTab === "procedural"}
                  onReset={handleReset}
                />
              </div>
            </div>

            {/* Instructions Card */}
            <div className="card shadow-sm mt-4">
              <div className="card-body">
                <h6 className="card-title fw-bold">
                  <i className="fas fa-hand-pointer me-2"></i>
                  How to Interact
                </h6>
                <ul className="list-unstyled small mb-0">
                  <li className="mb-2">
                    <i className="fas fa-mouse text-primary me-2"></i>
                    <strong>Left Click + Drag:</strong> Rotate the model
                  </li>
                  <li className="mb-2">
                    <i className="fas fa-scroll text-primary me-2"></i>
                    <strong>Scroll:</strong> Zoom in/out
                  </li>
                  <li className="mb-2">
                    <i className="fas fa-arrows-alt text-primary me-2"></i>
                    <strong>Right Click + Drag:</strong> Pan the view
                  </li>
                  <li>
                    <i className="fas fa-sync-alt text-primary me-2"></i>
                    <strong>Reset Button:</strong> Return to default view
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="row mt-5">
          <div className="col-12">
            <h3 className="text-center mb-4">Why 3D Models?</h3>
          </div>
          <div className="col-md-4 mb-3">
            <div className="card h-100 shadow-sm">
              <div className="card-body text-center">
                <i className="fas fa-eye fa-3x text-primary mb-3"></i>
                <h5 className="card-title">Realistic Visualization</h5>
                <p className="card-text text-muted">
                  View products from every angle before making a purchase
                  decision.
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="card h-100 shadow-sm">
              <div className="card-body text-center">
                <i className="fas fa-paint-brush fa-3x text-success mb-3"></i>
                <h5 className="card-title">Live Customization</h5>
                <p className="card-text text-muted">
                  See your color, pattern, and graphic choices in real-time.
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="card h-100 shadow-sm">
              <div className="card-body text-center">
                <i className="fas fa-mobile-alt fa-3x text-info mb-3"></i>
                <h5 className="card-title">Cross-Platform</h5>
                <p className="card-text text-muted">
                  Works seamlessly on desktop, tablet, and mobile devices.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Model3DShowcase;
