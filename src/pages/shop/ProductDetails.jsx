import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { shopAPI } from "../../services/api";
import { formatPrice } from "../../utils/currency";
import { useFlash } from "../../context/FlashContext";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useCartAnimation } from "../../hooks/useCartAnimation";
import ProductReviews from "../../components/ProductReviews";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5174";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isCustomer } = useAuth();
  const { addToCart } = useCart();
  const { showFlash } = useFlash();
  const productImageRef = useRef(null);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const { animateToCart } = useCartAnimation(() => {
    // Animate cart badge
    const cartBadge = document.getElementById("cart-badge");
    if (cartBadge) {
      cartBadge.classList.add("cart-badge-animate");
      setTimeout(() => cartBadge.classList.remove("cart-badge-animate"), 400);
    }
  });

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      const response = await shopAPI.getProductById(id);

      if (response.data.success) {
        setProduct(response.data.product);
        // Set default size if available
        if (
          response.data.product.sizes &&
          response.data.product.sizes.length > 0
        ) {
          setSelectedSize(response.data.product.sizes[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      showFlash("Error loading product", "danger");
      navigate("/shop");
    } finally {
      setLoading(false);
    }
  }, [id, showFlash, navigate]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleAddToCart = async (e) => {
    e.preventDefault();

    if (!user) {
      showFlash("Please login to add items to cart", "warning");
      navigate("/login");
      return;
    }

    if (!isCustomer) {
      showFlash("Only customers can add items to cart", "warning");
      return;
    }

    if (!selectedSize) {
      showFlash("Please select a size", "warning");
      return;
    }

    if (quantity < 1) {
      showFlash("Please enter a valid quantity", "warning");
      return;
    }

    try {
      setAddingToCart(true);
      await addToCart({
        productId: product._id,
        quantity: quantity,
        size: selectedSize,
        color: product.colors?.[0] || "Default",
      });

      // Trigger animation after successful add to cart
      if (productImageRef.current) {
        animateToCart(productImageRef.current);
      }

      // Update local product stock immediately (optimistic update)
      setProduct((prev) => ({
        ...prev,
        stockQuantity: prev.stockQuantity - quantity,
        inStock: prev.stockQuantity - quantity > 0,
      }));

      setJustAdded(true);
      showFlash("Product added to cart!", "success");

      // Reset success state after 2 seconds
      setTimeout(() => {
        setJustAdded(false);
      }, 2000);
    } catch (error) {
      console.error("Error adding to cart:", error);
      showFlash(
        error.response?.data?.message || "Error adding to cart",
        "danger"
      );
    } finally {
      setAddingToCart(false);
    }
  };

  const nextImage = () => {
    if (product && product.images) {
      setCurrentImageIndex((prev) =>
        prev === product.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (product && product.images) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? product.images.length - 1 : prev - 1
      );
    }
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="d-flex justify-content-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning">Product not found</div>
        <Link to="/shop" className="btn btn-primary">
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/">Home</Link>
          </li>
          <li className="breadcrumb-item">
            <Link to="/shop">Shop</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="row">
        {/* Product Images */}
        <div className="col-lg-6 mb-4">
          <div className="card shadow-sm">
            <div className="position-relative">
              {product.images && product.images.length > 0 ? (
                <>
                  <img
                    ref={productImageRef}
                    src={`${API_BASE_URL}${product.images[currentImageIndex]}`}
                    alt={product.name}
                    className="card-img-top"
                    style={{ height: "500px", objectFit: "cover" }}
                    onError={(e) => {
                      e.target.src = `${API_BASE_URL}/images/placeholder.png`;
                    }}
                  />
                  {product.images.length > 1 && (
                    <>
                      <button
                        className="btn btn-dark position-absolute top-50 start-0 translate-middle-y ms-2"
                        onClick={prevImage}
                        style={{ opacity: 0.8 }}
                      >
                        <i className="bi bi-chevron-left"></i>
                      </button>
                      <button
                        className="btn btn-dark position-absolute top-50 end-0 translate-middle-y me-2"
                        onClick={nextImage}
                        style={{ opacity: 0.8 }}
                      >
                        <i className="bi bi-chevron-right"></i>
                      </button>
                    </>
                  )}
                </>
              ) : (
                <img
                  src={`${API_BASE_URL}/images/placeholder.png`}
                  alt="No image"
                  className="card-img-top"
                  style={{ height: "500px", objectFit: "cover" }}
                />
              )}
            </div>

            {/* Thumbnail Navigation */}
            {product.images && product.images.length > 1 && (
              <div className="card-body">
                <div className="d-flex gap-2 overflow-auto">
                  {product.images.map((image, index) => (
                    <img
                      key={index}
                      src={`${API_BASE_URL}${image}`}
                      alt={`${product.name} ${index + 1}`}
                      className={`img-thumbnail cursor-pointer ${
                        currentImageIndex === index ? "border-primary" : ""
                      }`}
                      style={{
                        width: "80px",
                        height: "80px",
                        objectFit: "cover",
                        cursor: "pointer",
                      }}
                      onClick={() => setCurrentImageIndex(index)}
                      onError={(e) => {
                        e.target.src = `${API_BASE_URL}/images/placeholder.png`;
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="col-lg-6">
          <div className="card shadow-sm">
            <div className="card-body">
              <h1 className="card-title h2 mb-3">{product.name}</h1>

              {/* Category and Gender */}
              <div className="mb-3">
                <span className="badge bg-secondary me-2">
                  {product.category}
                </span>
                <span className="badge bg-info">{product.gender}</span>
              </div>

              {/* Price */}
              <h3 className="text-primary mb-3">
                {formatPrice(product.price)}
              </h3>

              {/* Description */}
              <p className="mb-4">{product.description}</p>

              {/* Add to Cart Form - Only for Customers */}
              {isCustomer ? (
                <form onSubmit={handleAddToCart}>
                  <div className="row mb-3">
                    {/* Size Selection */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Size</label>
                      <select
                        className="form-select"
                        value={selectedSize}
                        onChange={(e) => setSelectedSize(e.target.value)}
                        required
                      >
                        <option value="">Select Size</option>
                        {product.sizes &&
                          product.sizes.map((size) => (
                            <option key={size} value={size}>
                              {size}
                            </option>
                          ))}
                      </select>
                    </div>

                    {/* Quantity */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Quantity</label>
                      <input
                        type="number"
                        className="form-control"
                        min="1"
                        max={product.stockQuantity || 10}
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value))}
                        required
                      />
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="d-grid gap-2">
                    <button
                      type="submit"
                      className={`btn btn-lg add-to-cart-btn ${
                        justAdded
                          ? "btn-success success"
                          : addingToCart
                          ? "btn-primary adding"
                          : "btn-primary"
                      }`}
                      disabled={!product.inStock || addingToCart}
                    >
                      {addingToCart ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Adding to Cart...
                        </>
                      ) : justAdded ? (
                        <>
                          <i className="bi bi-check-circle-fill me-2"></i>
                          Added to Cart!
                        </>
                      ) : (
                        <>
                          <i className="bi bi-cart-plus me-2"></i>
                          {!product.inStock ? "Out of Stock" : "Add to Cart"}
                        </>
                      )}
                    </button>
                    <Link to="/shop" className="btn btn-outline-secondary">
                      Continue Shopping
                    </Link>
                  </div>

                  {/* Stock Availability */}
                  <div className="mt-3">
                    {product.inStock && product.stockQuantity > 0 ? (
                      <p className="text-success fw-bold mb-0">
                        <i className="bi bi-check-circle-fill me-2"></i>
                        In Stock ({product.stockQuantity} available)
                      </p>
                    ) : (
                      <p className="text-danger fw-bold mb-0">
                        <i className="bi bi-x-circle-fill me-2"></i>
                        Out of Stock
                      </p>
                    )}
                  </div>
                </form>
              ) : (
                <div className="alert alert-info">
                  <i className="bi bi-info-circle me-2"></i>
                  {user ? (
                    <>
                      Only customers can purchase products. Please login with a
                      customer account.
                    </>
                  ) : (
                    <>
                      Please <Link to="/login">login</Link> as a customer to
                      purchase products.
                    </>
                  )}
                </div>
              )}

              {/* Stock Info */}
              {product.inStock !== undefined && (
                <div className="mt-3">
                  {product.inStock ? (
                    <span className="text-success">
                      <i className="bi bi-check-circle me-1"></i>
                      In Stock{" "}
                      {product.stockQuantity > 0
                        ? `(${product.stockQuantity} available)`
                        : ""}
                    </span>
                  ) : (
                    <span className="text-danger">
                      <i className="bi bi-x-circle me-1"></i>
                      Out of Stock
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Additional Details */}
          <div className="card shadow-sm mt-3">
            <div className="card-body">
              <h5 className="card-title">Product Details</h5>
              <ul className="list-unstyled mb-0">
                <li className="mb-2">
                  <strong>Category:</strong> {product.category}
                </li>
                <li className="mb-2">
                  <strong>Gender:</strong> {product.gender}
                </li>
                {product.material && (
                  <li className="mb-2">
                    <strong>Material:</strong> {product.material}
                  </li>
                )}
                {product.brand && (
                  <li className="mb-2">
                    <strong>Brand:</strong> {product.brand}
                  </li>
                )}
                {product.colors && product.colors.length > 0 && (
                  <li className="mb-2">
                    <strong>Available Colors:</strong>{" "}
                    {product.colors.join(", ")}
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="row mt-5">
          <div className="col-12">
            <ProductReviews productId={id} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
