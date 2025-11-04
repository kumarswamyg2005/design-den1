import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { customerAPI } from "../../services/api";
import { useFlash } from "../../context/FlashContext";
import { useCart } from "../../context/CartContext";
import { formatPrice } from "../../utils/currency";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showFlash } = useFlash();
  const { addToCart } = useCart();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await customerAPI.getWishlist();
      setWishlist(response.data.wishlist || []);
    } catch (error) {
      showFlash("Failed to load wishlist", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (itemId) => {
    try {
      await customerAPI.removeFromWishlist(itemId);
      setWishlist(wishlist.filter((item) => item._id !== itemId));
      showFlash("Removed from wishlist", "success");
    } catch (error) {
      showFlash("Failed to remove item", "error");
    }
  };

  const handleMoveToCart = async (item) => {
    try {
      await addToCart({
        productId: item.productId._id,
        quantity: 1,
        size: "M", // Default size
        color: item.productId.colors?.[0] || "Default",
      });
      await handleRemoveFromWishlist(item._id);
      showFlash("Moved to cart successfully", "success");
    } catch (error) {
      showFlash("Failed to move to cart", "error");
    }
  };

  if (loading) {
    return (
      <div className="container my-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-4">
      <div className="row mb-4">
        <div className="col-md-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <h2 className="card-title mb-0">
                  <i className="fas fa-heart me-2 text-danger"></i>
                  My Wishlist ({wishlist.length})
                </h2>
                <Link to="/shop" className="btn btn-outline-primary">
                  <i className="fas fa-shopping-bag me-2"></i>
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {wishlist.length === 0 ? (
        <div className="card shadow-sm">
          <div className="card-body text-center py-5">
            <i className="fas fa-heart fa-4x text-muted mb-3"></i>
            <h4>Your wishlist is empty</h4>
            <p className="text-muted">Save items you love for later!</p>
            <Link to="/shop" className="btn btn-primary mt-3">
              Browse Products
            </Link>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {wishlist.map((item) => (
            <div key={item._id} className="col-md-4 col-sm-6">
              <div className="card h-100 shadow-sm">
                <div className="position-relative">
                  <img
                    src={
                      item.productId?.images?.[0] || "/images/placeholder.jpg"
                    }
                    className="card-img-top"
                    alt={item.productId?.name}
                    style={{ height: "250px", objectFit: "cover" }}
                  />
                  <button
                    className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2"
                    onClick={() => handleRemoveFromWishlist(item._id)}
                    title="Remove from wishlist"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                  {!item.productId?.inStock && (
                    <span className="badge bg-danger position-absolute top-0 start-0 m-2">
                      Out of Stock
                    </span>
                  )}
                </div>
                <div className="card-body">
                  <h5 className="card-title">{item.productId?.name}</h5>
                  <p className="card-text text-muted small">
                    {item.productId?.description?.substring(0, 100)}...
                  </p>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="h5 mb-0 text-primary">
                      {formatPrice(item.productId?.price)}
                    </span>
                    {item.productId?.category && (
                      <span className="badge bg-secondary">
                        {item.productId.category}
                      </span>
                    )}
                  </div>
                  <div className="d-grid gap-2">
                    <button
                      className="btn btn-primary"
                      onClick={() => handleMoveToCart(item)}
                      disabled={!item.productId?.inStock}
                    >
                      <i className="fas fa-shopping-cart me-2"></i>
                      {item.productId?.inStock
                        ? "Move to Cart"
                        : "Out of Stock"}
                    </button>
                    <Link
                      to={`/shop/product/${item.productId?._id}`}
                      className="btn btn-outline-secondary"
                    >
                      <i className="fas fa-eye me-2"></i>
                      View Details
                    </Link>
                  </div>
                </div>
                <div className="card-footer text-muted small">
                  <i className="fas fa-clock me-1"></i>
                  Added {new Date(item.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
