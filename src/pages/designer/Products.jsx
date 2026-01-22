import { useState, useEffect } from "react";
import { designerAPI } from "../../services/api";
import { formatPrice } from "../../utils/currency";
import { useFlash } from "../../context/FlashContext";

const Products = () => {
  const { showFlash } = useFlash();
  const [products, setProducts] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [portfolioLoading, setPortfolioLoading] = useState(true);
  const [togglingStock, setTogglingStock] = useState({});
  const [activeTab, setActiveTab] = useState("portfolio");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form state for creating/editing designs
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "T-Shirt",
    style: "Casual",
    basePrice: 500,
    graphic: "",
    tags: "",
  });

  useEffect(() => {
    fetchProducts();
    fetchPortfolio();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await designerAPI.getProducts();
      setProducts(response.data.products || []);
    } catch (error) {
      showFlash("Failed to load graphics", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchPortfolio = async () => {
    try {
      setPortfolioLoading(true);
      const response = await designerAPI.getPortfolio();
      setPortfolio(response.data.portfolio || []);
    } catch (error) {
      console.error("Failed to load portfolio:", error);
    } finally {
      setPortfolioLoading(false);
    }
  };

  const handleStockToggle = async (productId, currentStatus) => {
    try {
      setTogglingStock((prev) => ({ ...prev, [productId]: true }));
      await designerAPI.updateProductStock(productId, !currentStatus);
      showFlash(
        `Graphic ${!currentStatus ? "marked as in stock" : "marked as out of stock"}`,
        "success",
      );
      fetchProducts();
    } catch (error) {
      showFlash("Failed to update stock status", "error");
    } finally {
      setTogglingStock((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "basePrice" ? Number(value) : value,
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "T-Shirt",
      style: "Casual",
      basePrice: 500,
      graphic: "",
      tags: "",
    });
    setEditingItem(null);
  };

  const handleCreateDesign = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showFlash("Please enter a design name", "error");
      return;
    }

    try {
      setCreating(true);
      const payload = {
        ...formData,
        tags: formData.tags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t),
      };

      if (editingItem) {
        await designerAPI.updatePortfolioItem(editingItem._id, payload);
        showFlash("Design updated successfully!", "success");
      } else {
        await designerAPI.createProduct(payload);
        showFlash("Design created successfully!", "success");
      }

      setShowCreateModal(false);
      resetForm();
      fetchPortfolio();
    } catch (error) {
      showFlash(
        editingItem ? "Failed to update design" : "Failed to create design",
        "error",
      );
    } finally {
      setCreating(false);
    }
  };

  const handleEditDesign = (item) => {
    setFormData({
      name: item.name || "",
      description: item.description || "",
      category: item.category || "T-Shirt",
      style: item.style || "Casual",
      basePrice: item.basePrice || 500,
      graphic: item.graphic || "",
      tags: (item.tags || []).join(", "),
    });
    setEditingItem(item);
    setShowCreateModal(true);
  };

  const handleDeleteDesign = async (id) => {
    if (!window.confirm("Are you sure you want to delete this design?")) return;

    try {
      await designerAPI.deletePortfolioItem(id);
      showFlash("Design deleted successfully!", "success");
      fetchPortfolio();
    } catch (error) {
      showFlash("Failed to delete design", "error");
    }
  };

  const handleTogglePortfolioStock = async (item) => {
    try {
      setTogglingStock((prev) => ({ ...prev, [item._id]: true }));
      await designerAPI.updatePortfolioItem(item._id, {
        inStock: !item.inStock,
      });
      showFlash(
        `Design marked as ${!item.inStock ? "in stock" : "out of stock"}`,
        "success",
      );
      fetchPortfolio();
    } catch (error) {
      showFlash("Failed to update stock status", "error");
    } finally {
      setTogglingStock((prev) => ({ ...prev, [item._id]: false }));
    }
  };

  // Available graphics for selection
  const availableGraphics = [
    { value: "/images/graphics/dragon_1.jpg", label: "Dragon 1" },
    { value: "/images/graphics/dragon_2.jpg", label: "Dragon 2" },
    { value: "/images/graphics/dragon_3.jpg", label: "Dragon 3" },
    { value: "/images/graphics/dragon_4.jpg", label: "Dragon 4" },
    { value: "/images/graphics/dragon_5.jpg", label: "Dragon 5" },
    { value: "/images/graphics/dragon_6.jpg", label: "Dragon 6" },
    { value: "/images/graphics/dragon_7.jpg", label: "Dragon 7" },
    { value: "/images/graphics/dragon_8.jpg", label: "Dragon 8" },
    { value: "/images/graphics/dragon_9.jpg", label: "Dragon 9" },
    { value: "/images/graphics/dragon_10.jpg", label: "Dragon 10" },
    { value: "/images/graphics/model.png", label: "Model" },
  ];

  return (
    <div className="container my-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-md-12">
          <div
            className="card shadow-sm"
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
          >
            <div className="card-body text-white">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h2 className="card-title mb-1">
                    <i className="fas fa-palette me-2"></i>
                    My Designs & Graphics
                  </h2>
                  <p className="card-text mb-0 opacity-75">
                    Create and manage your design portfolio for the marketplace
                  </p>
                </div>
                <button
                  className="btn btn-light btn-lg"
                  onClick={() => {
                    resetForm();
                    setShowCreateModal(true);
                  }}
                >
                  <i className="fas fa-plus me-2"></i>
                  Create Design
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "portfolio" ? "active" : ""}`}
            onClick={() => setActiveTab("portfolio")}
          >
            <i className="fas fa-paint-brush me-2"></i>
            My Portfolio ({portfolio.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "graphics" ? "active" : ""}`}
            onClick={() => setActiveTab("graphics")}
          >
            <i className="fas fa-images me-2"></i>
            Manage Graphics ({products.length})
          </button>
        </li>
      </ul>

      {/* Portfolio Tab */}
      {activeTab === "portfolio" && (
        <div className="row">
          {portfolioLoading ? (
            <div className="col-12 text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : portfolio.length === 0 ? (
            <div className="col-12">
              <div className="alert alert-info d-flex align-items-center">
                <i className="fas fa-info-circle me-3 fa-2x"></i>
                <div>
                  <h5 className="mb-1">No designs yet</h5>
                  <p className="mb-0">
                    Create your first design to showcase in the marketplace.
                    Click the "Create Design" button above to get started!
                  </p>
                </div>
              </div>
            </div>
          ) : (
            portfolio.map((item) => (
              <div className="col-md-4 mb-4" key={item._id}>
                <div className="card h-100 shadow-sm">
                  <div
                    style={{
                      height: "200px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#f8f9fa",
                      padding: "20px",
                      position: "relative",
                    }}
                  >
                    {item.graphic ? (
                      <img
                        src={`http://localhost:5174${item.graphic}`}
                        alt={item.name}
                        style={{
                          maxWidth: "100%",
                          maxHeight: "100%",
                          objectFit: "contain",
                        }}
                        onError={(e) => {
                          e.target.src =
                            "http://localhost:5174/images/graphics/dragon_1.jpg";
                        }}
                      />
                    ) : (
                      <div className="text-center text-muted">
                        <i className="fas fa-image fa-3x mb-2"></i>
                        <p className="mb-0">No image</p>
                      </div>
                    )}
                    {!item.inStock && (
                      <div
                        style={{
                          position: "absolute",
                          top: "10px",
                          right: "10px",
                          background: "#dc3545",
                          color: "white",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                        }}
                      >
                        Out of Stock
                      </div>
                    )}
                  </div>
                  <div className="card-body">
                    <h5 className="card-title">{item.name}</h5>
                    <p className="card-text text-muted small">
                      {item.description || "No description"}
                    </p>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="badge bg-secondary">
                        {item.category}
                      </span>
                      <span className="h5 mb-0 text-primary">
                        {formatPrice(item.basePrice)}
                      </span>
                    </div>
                    {item.tags && item.tags.length > 0 && (
                      <div className="mb-3">
                        {item.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="badge bg-light text-dark me-1"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="btn-group w-100">
                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => handleEditDesign(item)}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className={`btn btn-sm ${item.inStock ? "btn-outline-warning" : "btn-outline-success"}`}
                        onClick={() => handleTogglePortfolioStock(item)}
                        disabled={togglingStock[item._id]}
                      >
                        {togglingStock[item._id] ? (
                          <span className="spinner-border spinner-border-sm"></span>
                        ) : item.inStock ? (
                          <i className="fas fa-toggle-on"></i>
                        ) : (
                          <i className="fas fa-toggle-off"></i>
                        )}
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleDeleteDesign(item._id)}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Graphics Tab */}
      {activeTab === "graphics" && (
        <div className="row">
          {loading ? (
            <div className="col-12 text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="col-12">
              <div className="alert alert-info">No graphics found.</div>
            </div>
          ) : (
            products.map((product) => (
              <div className="col-md-4 mb-4" key={product._id}>
                <div className="card h-100 shadow-sm">
                  <div
                    style={{
                      height: "200px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#f8f9fa",
                      padding: "20px",
                    }}
                  >
                    <img
                      src={`http://localhost:5174${product.graphic}`}
                      alt={product.name || "Graphic"}
                      style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        objectFit: "contain",
                      }}
                      onError={(e) => {
                        e.target.src =
                          "http://localhost:5174/images/graphics/dragon_1.jpg";
                      }}
                    />
                  </div>
                  <div className="card-body">
                    <h5 className="card-title">
                      {product.name || "Graphic Design"}
                    </h5>
                    <p className="card-text text-muted">
                      {product.category || "Custom"}
                    </p>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className="h5 mb-0">
                        {formatPrice(
                          product.basePrice || product.estimatedPrice || 500,
                        )}
                      </span>
                      <span
                        className={`badge ${product.inStock !== false ? "bg-success" : "bg-danger"}`}
                      >
                        {product.inStock !== false
                          ? "In Stock"
                          : "Out of Stock"}
                      </span>
                    </div>
                    <button
                      className={`btn w-100 ${product.inStock !== false ? "btn-outline-danger" : "btn-outline-success"}`}
                      onClick={() =>
                        handleStockToggle(
                          product._id,
                          product.inStock !== false,
                        )
                      }
                      disabled={togglingStock[product._id]}
                    >
                      {togglingStock[product._id] ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Updating...
                        </>
                      ) : product.inStock !== false ? (
                        <>
                          <i className="fas fa-times-circle me-2"></i>
                          Mark Out of Stock
                        </>
                      ) : (
                        <>
                          <i className="fas fa-check-circle me-2"></i>
                          Mark In Stock
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div
                className="modal-header"
                style={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                }}
              >
                <h5 className="modal-title text-white">
                  <i
                    className={`fas ${editingItem ? "fa-edit" : "fa-plus-circle"} me-2`}
                  ></i>
                  {editingItem ? "Edit Design" : "Create New Design"}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                ></button>
              </div>
              <form onSubmit={handleCreateDesign}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Design Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="e.g., Vintage Dragon Tee"
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Base Price (₹)</label>
                      <input
                        type="number"
                        className="form-control"
                        name="basePrice"
                        value={formData.basePrice}
                        onChange={handleInputChange}
                        min="100"
                        step="50"
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Describe your design..."
                    ></textarea>
                  </div>
                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Category</label>
                      <select
                        className="form-select"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                      >
                        <option value="T-Shirt">T-Shirt</option>
                        <option value="Hoodie">Hoodie</option>
                        <option value="Polo">Polo</option>
                        <option value="Sweatshirt">Sweatshirt</option>
                        <option value="Tank Top">Tank Top</option>
                      </select>
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Style</label>
                      <select
                        className="form-select"
                        name="style"
                        value={formData.style}
                        onChange={handleInputChange}
                      >
                        <option value="Casual">Casual</option>
                        <option value="Streetwear">Streetwear</option>
                        <option value="Minimalist">Minimalist</option>
                        <option value="Vintage">Vintage</option>
                        <option value="Bold">Bold</option>
                        <option value="Artistic">Artistic</option>
                      </select>
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Graphic</label>
                      <select
                        className="form-select"
                        name="graphic"
                        value={formData.graphic}
                        onChange={handleInputChange}
                      >
                        <option value="">Select a graphic...</option>
                        {availableGraphics.map((g) => (
                          <option key={g.value} value={g.value}>
                            {g.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Tags (comma separated)</label>
                    <input
                      type="text"
                      className="form-control"
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      placeholder="e.g., dragon, fantasy, cool, trending"
                    />
                  </div>
                  {formData.graphic && (
                    <div className="mb-3">
                      <label className="form-label">Preview</label>
                      <div
                        className="border rounded p-3 text-center"
                        style={{ backgroundColor: "#f8f9fa" }}
                      >
                        <img
                          src={`http://localhost:5174${formData.graphic}`}
                          alt="Preview"
                          style={{ maxHeight: "150px", objectFit: "contain" }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={creating}
                  >
                    {creating ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        {editingItem ? "Updating..." : "Creating..."}
                      </>
                    ) : (
                      <>
                        <i
                          className={`fas ${editingItem ? "fa-save" : "fa-plus"} me-2`}
                        ></i>
                        {editingItem ? "Update Design" : "Create Design"}
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

export default Products;
