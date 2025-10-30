import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { customerAPI } from "../../services/api";
import { formatPrice } from "../../utils/currency";
import { useFlash } from "../../context/FlashContext";

const Cart = () => {
  const navigate = useNavigate();
  const { cart, updateCartItem, removeFromCart, refreshCart } = useCart();
  const { showFlash } = useFlash();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    refreshCart();
  }, []);

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      await updateCartItem(itemId, newQuantity);
      showFlash("Cart updated successfully", "success");
    } catch (error) {
      showFlash("Failed to update cart", "error");
    }
  };

  const handleRemoveItem = async (itemId) => {
    if (!window.confirm("Remove this item from cart?")) return;

    try {
      await removeFromCart(itemId);
      showFlash("Item removed from cart", "success");
    } catch (error) {
      showFlash("Failed to remove item", "error");
    }
  };

  const calculateSubtotal = () => {
    if (!cart?.items) return 0;
    return cart.items.reduce((sum, item) => {
      // For products, use product price; for custom designs, use estimatedPrice or default 1200
      const price =
        item.productId?.price || item.designId?.estimatedPrice || 1200;
      return sum + price * item.quantity;
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const tax = subtotal * 0.18; // 18% GST
  const shipping = subtotal > 0 ? 100 : 0;
  const total = subtotal + tax + shipping;

  return (
    <div className="container my-4">
      <div className="row mb-4">
        <div className="col-md-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <h2 className="card-title">Your Cart</h2>
              <p className="card-text">
                Review your saved designs and proceed to checkout.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-header">
              <h3>Saved Designs</h3>
            </div>
            <div className="card-body">
              {!cart?.items || cart.items.length === 0 ? (
                <div className="alert alert-info">
                  Your cart is empty.{" "}
                  <Link to="/customer/design-studio">Create a design</Link> or{" "}
                  <Link to="/shop">shop ready-made designs</Link> to add items
                  to your cart.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Design</th>
                        <th>Details</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.items.map((item) => {
                        const product = item.productId;
                        const design = item.designId;

                        // Skip items with neither product nor design
                        if (!product && !design) return null;

                        // Determine item details based on whether it's a product or custom design
                        const isCustomDesign = !!design;

                        // Handle image URL for custom designs
                        let imageUrl;
                        if (isCustomDesign) {
                          if (design.graphic) {
                            // If graphic path starts with /images, use it directly
                            const graphicPath = design.graphic.startsWith(
                              "/images"
                            )
                              ? design.graphic
                              : `/images/graphics/${design.graphic}`;
                            imageUrl = `http://localhost:3000${graphicPath}`;
                          } else {
                            imageUrl = "/images/custom-design.png";
                          }
                        } else {
                          imageUrl =
                            product.images?.[0] || "/images/casual-tshirt.jpeg";
                        }

                        const name = isCustomDesign
                          ? design.name || "Custom Design"
                          : product.name || "Product";
                        const price = isCustomDesign
                          ? design.estimatedPrice || 1200
                          : product.price || 0;

                        return (
                          <tr key={item._id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <img
                                  src={imageUrl}
                                  alt={name}
                                  className="me-3"
                                  style={{
                                    height: "72px",
                                    width: "72px",
                                    objectFit: "contain",
                                    borderRadius: "8px",
                                    backgroundColor: "#f8f9fa",
                                    padding: "8px",
                                  }}
                                  onError={(e) => {
                                    e.target.src = "/images/casual-tshirt.jpeg";
                                  }}
                                />
                                <div>
                                  <h6 className="mb-0">{name}</h6>
                                  {isCustomDesign && (
                                    <small className="badge bg-info text-dark">
                                      Custom Design
                                    </small>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td>
                              <small className="text-muted">
                                Size: {item.size || design?.size || "M"}
                                <br />
                                Color:{" "}
                                {item.color || design?.color || "Default"}
                              </small>
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                <input
                                  type="number"
                                  className="form-control form-control-sm"
                                  value={item.quantity}
                                  onChange={(e) =>
                                    handleUpdateQuantity(
                                      item._id,
                                      parseInt(e.target.value) || 1
                                    )
                                  }
                                  min="1"
                                  style={{ width: "60px" }}
                                />
                              </div>
                            </td>
                            <td>{formatPrice(price * item.quantity)}</td>
                            <td>
                              <button
                                onClick={() => handleRemoveItem(item._id)}
                                className="btn btn-sm btn-outline-danger"
                              >
                                <i className="fas fa-trash"></i> Remove
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-header">
              <h3>Order Summary</h3>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Tax (18% GST):</span>
                <span>{formatPrice(tax)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Shipping:</span>
                <span>{formatPrice(shipping)}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between mb-3">
                <strong>Total:</strong>
                <strong>{formatPrice(total)}</strong>
              </div>

              {cart?.items && cart.items.length > 0 && (
                <div className="d-grid gap-2">
                  <button
                    onClick={() => navigate("/customer/checkout")}
                    className="btn btn-primary btn-lg"
                  >
                    Proceed to Checkout
                  </button>
                  <Link to="/shop" className="btn btn-outline-secondary">
                    Continue Shopping
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
