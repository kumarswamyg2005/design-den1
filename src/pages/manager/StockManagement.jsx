import { useState, useEffect } from "react";
import { useFlash } from "../../context/FlashContext";
import { formatPrice } from "../../utils/currency";
import api from "../../services/api";

const StockManagement = () => {
  const { showFlash } = useFlash();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    category: "Tshirt",
    gender: "Male",
    price: "",
    stockQuantity: "",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "White"],
    images: ["/images/casual-tshirt.jpeg"],
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get("/manager/api/products");
      setProducts(response.data.products || []);
    } catch (error) {
      console.error("Failed to load products:", error);
      showFlash(
        error.response?.data?.message || "Failed to load products",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const updateStock = async (productId, stockQuantity, inStock) => {
    try {
      setUpdating(productId);
      await api.put(`/manager/api/product/${productId}/stock`, {
        stockQuantity: parseInt(stockQuantity),
        inStock,
      });
      showFlash("Stock updated successfully", "success");
      fetchProducts();
    } catch (error) {
      showFlash("Failed to update stock", "error");
    } finally {
      setUpdating(null);
    }
  };

  const handleStockChange = (productId, newStock) => {
    const product = products.find((p) => p._id === productId);
    if (product) {
      updateStock(productId, newStock, newStock > 0);
    }
  };

  const toggleInStock = (productId) => {
    const product = products.find((p) => p._id === productId);
    if (product) {
      updateStock(productId, product.stockQuantity, !product.inStock);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await api.post("/manager/api/product", {
        ...newProduct,
        price: parseFloat(newProduct.price),
        stockQuantity: parseInt(newProduct.stockQuantity),
      });
      showFlash("Product added successfully", "success");
      setShowAddModal(false);
      setNewProduct({
        name: "",
        description: "",
        category: "Tshirt",
        gender: "Male",
        price: "",
        stockQuantity: "",
        sizes: ["S", "M", "L", "XL"],
        colors: ["Black", "White"],
        images: ["/images/casual-tshirt.jpeg"],
      });
      fetchProducts();
    } catch (error) {
      showFlash("Failed to add product", "error");
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await api.delete(`/manager/api/product/${productId}`);
      showFlash("Product deleted successfully", "success");
      fetchProducts();
    } catch (error) {
      showFlash("Failed to delete product", "error");
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(products.map((p) => p.category))];

  const lowStockProducts = products.filter(
    (p) => p.stockQuantity < 10 && p.inStock
  );
  const outOfStockProducts = products.filter(
    (p) => p.stockQuantity === 0 || !p.inStock
  );

  if (loading) {
    return (
      <div className="container my-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid my-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm border-0 bg-primary text-white">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <h2 className="mb-1">
                  <i className="fas fa-warehouse me-2"></i>
                  Product Stock Management
                </h2>
                <p className="mb-0">Manage inventory and stock levels</p>
              </div>
              <button
                className="btn btn-light"
                onClick={() => setShowAddModal(true)}
              >
                <i className="fas fa-plus me-2"></i>
                Add Product
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h6 className="text-muted">Total Products</h6>
              <h3 className="mb-0">{products.length}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card shadow-sm h-100 border-warning">
            <div className="card-body">
              <h6 className="text-warning">Low Stock</h6>
              <h3 className="mb-0 text-warning">{lowStockProducts.length}</h3>
              <small className="text-muted">&lt; 10 items</small>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card shadow-sm h-100 border-danger">
            <div className="card-body">
              <h6 className="text-danger">Out of Stock</h6>
              <h3 className="mb-0 text-danger">{outOfStockProducts.length}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card shadow-sm h-100 border-success">
            <div className="card-body">
              <h6 className="text-success">In Stock</h6>
              <h3 className="mb-0 text-success">
                {
                  products.filter((p) => p.inStock && p.stockQuantity > 10)
                    .length
                }
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="row mb-3">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="🔍 Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="col-md-6">
          <select
            className="form-select"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="card shadow-sm">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock Quantity</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4">
                      <i className="fas fa-box-open fa-3x text-muted mb-2"></i>
                      <p className="text-muted">No products found</p>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr
                      key={product._id}
                      className={
                        product.stockQuantity === 0 || !product.inStock
                          ? "table-danger"
                          : product.stockQuantity < 10
                          ? "table-warning"
                          : ""
                      }
                    >
                      <td>
                        <img
                          src={product.images?.[0] || "/placeholder.png"}
                          alt={product.name}
                          style={{
                            width: "50px",
                            height: "50px",
                            objectFit: "cover",
                            borderRadius: "4px",
                          }}
                        />
                      </td>
                      <td>
                        <strong>{product.name}</strong>
                      </td>
                      <td>
                        <span className="badge bg-secondary">
                          {product.category}
                        </span>
                      </td>
                      <td>
                        <strong>{formatPrice(product.price)}</strong>
                      </td>
                      <td>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          style={{ width: "100px" }}
                          value={product.stockQuantity || 0}
                          onChange={(e) =>
                            handleStockChange(product._id, e.target.value)
                          }
                          min="0"
                          disabled={updating === product._id}
                        />
                      </td>
                      <td>
                        {product.inStock && product.stockQuantity > 0 ? (
                          <span className="badge bg-success">
                            <i className="fas fa-check me-1"></i>
                            In Stock
                          </span>
                        ) : (
                          <span className="badge bg-danger">
                            <i className="fas fa-times me-1"></i>
                            Out of Stock
                          </span>
                        )}
                      </td>
                      <td>
                        <button
                          className={`btn btn-sm ${
                            product.inStock
                              ? "btn-outline-danger"
                              : "btn-outline-success"
                          } me-2`}
                          onClick={() => toggleInStock(product._id)}
                          disabled={updating === product._id}
                        >
                          {updating === product._id ? (
                            <span className="spinner-border spinner-border-sm"></span>
                          ) : (
                            <>
                              <i
                                className={`fas ${
                                  product.inStock ? "fa-ban" : "fa-check"
                                } me-1`}
                              ></i>
                              {product.inStock
                                ? "Mark Unavailable"
                                : "Mark Available"}
                            </>
                          )}
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteProduct(product._id)}
                          title="Delete Product"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Product</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAddModal(false)}
                ></button>
              </div>
              <form onSubmit={handleAddProduct}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Product Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newProduct.name}
                        onChange={(e) =>
                          setNewProduct({ ...newProduct, name: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Category *</label>
                      <select
                        className="form-select"
                        value={newProduct.category}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            category: e.target.value,
                          })
                        }
                        required
                      >
                        <option value="Tshirt">T-Shirt</option>
                        <option value="Shirt">Shirt</option>
                        <option value="Jeans">Jeans</option>
                        <option value="Trouser">Trouser</option>
                        <option value="Dress">Dress</option>
                        <option value="Jacket">Jacket</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Gender *</label>
                      <select
                        className="form-select"
                        value={newProduct.gender}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            gender: e.target.value,
                          })
                        }
                        required
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Unisex">Unisex</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Price *</label>
                      <input
                        type="number"
                        className="form-control"
                        value={newProduct.price}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            price: e.target.value,
                          })
                        }
                        required
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="col-md-12 mb-3">
                      <label className="form-label">Description</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={newProduct.description}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            description: e.target.value,
                          })
                        }
                      ></textarea>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Initial Stock Quantity *
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        value={newProduct.stockQuantity}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            stockQuantity: e.target.value,
                          })
                        }
                        required
                        min="0"
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <i className="fas fa-plus me-2"></i>
                    Add Product
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

export default StockManagement;
