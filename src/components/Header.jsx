import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";

const Header = () => {
  const {
    isAuthenticated,
    isCustomer,
    isDesigner,
    isManager,
    isAdmin,
    isDelivery,
    logout,
  } = useAuth();
  const { cartCount } = useCart();
  const { isDark, toggleTheme } = useTheme();

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await logout();
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <Link className="navbar-brand" to="/">
          <i className="fas fa-tshirt me-2"></i>DesignDen
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/shop">
                Shop
              </Link>
            </li>

            {isAuthenticated ? (
              <>
                {isCustomer && (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/customer/design-studio">
                        Design Studio
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/customer/dashboard">
                        Dashboard
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/customer/wishlist">
                        <i className="fas fa-heart"></i> Wishlist
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/customer/cart">
                        <span className="cart-icon-wrapper" data-cart-icon>
                          <i className="fas fa-shopping-cart"></i> Cart
                          {cartCount > 0 && (
                            <span
                              className="badge bg-danger ms-1"
                              id="cart-badge"
                            >
                              {cartCount}
                            </span>
                          )}
                        </span>
                      </Link>
                    </li>
                  </>
                )}

                {isDesigner && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/designer/dashboard">
                      Dashboard
                    </Link>
                  </li>
                )}

                {isManager && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/manager">
                      Manager
                    </Link>
                  </li>
                )}

                {isDelivery && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/delivery/dashboard">
                      <i className="fas fa-truck me-1"></i>
                      Deliveries
                    </Link>
                  </li>
                )}

                {isAdmin && (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/admin/dashboard">
                        Dashboard
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/feedback/all">
                        Feedbacks
                      </Link>
                    </li>
                  </>
                )}

                <li className="nav-item">
                  <a className="nav-link" href="/logout" onClick={handleLogout}>
                    Logout
                  </a>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/customer/design-studio">
                    Design Studio
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/signup">
                    Sign Up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>

        {/* Theme toggle button */}
        <div className="d-flex align-items-center ms-3">
          <button
            className="btn btn-sm btn-outline-secondary"
            aria-label="Toggle theme"
            onClick={toggleTheme}
          >
            <i className={`fas ${isDark ? "fa-moon" : "fa-sun"}`}></i>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Header;
