import { useState, useEffect } from "react";
import { adminAPI } from "../../services/api";
import { formatPrice } from "../../utils/currency";
import { useFlash } from "../../context/FlashContext";
import { Link } from "react-router-dom";

const Products = () => {
  const { showFlash } = useFlash();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingStock, setTogglingStock] = useState({});

  useEffect(() => {
    fetchProducts();

    // Auto-refresh every 10 seconds to show stock updates
    const interval = setInterval(() => {
      fetchProducts();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getProducts();
      setProducts(response.data.products || []);
    } catch (error) {
      showFlash("Failed to load products", "error");
    } finally {
      setLoading(false);
    }
  };

  // Admin can only view products, not modify stock
  // Stock management is handled by designers

  return (
    <div className="container my-4">
      <div className="row mb-4">
        <div className="col-md-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h2 className="card-title mb-1">Product Stock Overview</h2>
                  <p className="text-muted small mb-0">
                    View-only access. Stock is managed by designers.
                  </p>
                </div>
                <Link to="/admin/dashboard" className="btn btn-outline-primary">
                  Back to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {loading ? (
          <div className="col-12 text-center py-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="col-12">
            <div className="alert alert-info">No products found.</div>
          </div>
        ) : (
          products.map((product) => (
            <div className="col-md-4 mb-4" key={product._id}>
              <div className="card h-100 shadow-sm">
                <img
                  src={`http://localhost:3000${
                    product.images?.[0] || "/images/casual-tshirt.jpeg"
                  }`}
                  className="card-img-top"
                  alt={product.name}
                  style={{ height: "250px", objectFit: "cover" }}
                  onError={(e) => {
                    e.target.src =
                      "http://localhost:3000/images/casual-tshirt.jpeg";
                  }}
                />
                <div className="card-body">
                  <h5 className="card-title">{product.name}</h5>
                  <p className="card-text text-muted small">
                    {product.category} - {product.gender}
                  </p>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="h5 mb-0">
                      {formatPrice(product.price)}
                    </span>
                    <span
                      className={`badge ${
                        product.inStock ? "bg-success" : "bg-danger"
                      }`}
                    >
                      {product.inStock ? "In Stock" : "Out of Stock"}
                    </span>
                  </div>
                  <div className="alert alert-info small mb-0" role="alert">
                    <i className="fas fa-info-circle me-2"></i>
                    Stock is managed by designers
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Products;
