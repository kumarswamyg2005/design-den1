import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";
import LogoutConfirmModal from "./LogoutConfirmModal";
import EditProfileModal from "./EditProfileModal";

const Header = () => {
  const {
    user,
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
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async (e) => {
    e.preventDefault();
    setShowLogoutConfirm(true);
  };

  const confirmLogout = async () => {
    setShowLogoutConfirm(false);
    try {
      await logout();
      // Navigation will happen after animation completes
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
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

                {/* User Profile Dropdown */}
                <li
                  className="nav-item dropdown position-relative"
                  ref={dropdownRef}
                >
                  <button
                    className="nav-link btn btn-link d-flex align-items-center px-2"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    aria-expanded={showUserMenu}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontWeight: "bold",
                        fontSize: "14px",
                        border: "2px solid #fff",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                      }}
                    >
                      {(user?.name || user?.username || "U")
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  </button>
                  {showUserMenu && (
                    <div
                      className="dropdown-menu dropdown-menu-end show"
                      style={{
                        minWidth: "280px",
                        backgroundColor: isDark ? "#242526" : "#ffffff",
                        border: "none",
                        borderRadius: "12px",
                        boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                        position: "absolute",
                        right: 0,
                        top: "calc(100% + 8px)",
                        zIndex: 1050,
                        padding: "8px",
                      }}
                    >
                      {/* Profile Header */}
                      <div
                        style={{
                          padding: "12px",
                          borderRadius: "8px",
                          backgroundColor: isDark ? "#3a3b3c" : "#f0f2f5",
                          marginBottom: "8px",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          setShowUserMenu(false);
                          window.location.href = "/customer/dashboard";
                        }}
                      >
                        <div className="d-flex align-items-center">
                          <div
                            style={{
                              width: "50px",
                              height: "50px",
                              borderRadius: "50%",
                              background:
                                "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "white",
                              fontWeight: "bold",
                              fontSize: "20px",
                              marginRight: "12px",
                            }}
                          >
                            {(user?.name || user?.username || "U")
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                          <div>
                            <div
                              style={{
                                fontWeight: "600",
                                fontSize: "16px",
                                color: isDark ? "#e4e6eb" : "#1c1e21",
                              }}
                            >
                              {user?.name || user?.username}
                            </div>
                            <div
                              style={{
                                fontSize: "13px",
                                color: isDark ? "#b0b3b8" : "#65676b",
                              }}
                            >
                              {user?.email}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          setShowEditProfile(true);
                        }}
                        className="d-flex align-items-center justify-content-between w-100"
                        style={{
                          padding: "10px 12px",
                          borderRadius: "8px",
                          textDecoration: "none",
                          color: isDark ? "#e4e6eb" : "#1c1e21",
                          transition: "background 0.2s",
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) =>
                          (e.target.style.backgroundColor = isDark
                            ? "#3a3b3c"
                            : "#f0f2f5")
                        }
                        onMouseLeave={(e) =>
                          (e.target.style.backgroundColor = "transparent")
                        }
                      >
                        <div className="d-flex align-items-center">
                          <div
                            style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "50%",
                              backgroundColor: isDark ? "#3a3b3c" : "#e4e6eb",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              marginRight: "12px",
                            }}
                          >
                            <i
                              className="fas fa-user"
                              style={{ color: isDark ? "#e4e6eb" : "#1c1e21" }}
                            ></i>
                          </div>
                          <span>Edit Profile</span>
                        </div>
                        <i
                          className="fas fa-chevron-right"
                          style={{
                            fontSize: "12px",
                            color: isDark ? "#b0b3b8" : "#65676b",
                          }}
                        ></i>
                      </button>

                      <Link
                        to="/security"
                        onClick={() => setShowUserMenu(false)}
                        className="d-flex align-items-center justify-content-between"
                        style={{
                          padding: "10px 12px",
                          borderRadius: "8px",
                          textDecoration: "none",
                          color: isDark ? "#e4e6eb" : "#1c1e21",
                          transition: "background 0.2s",
                        }}
                        onMouseEnter={(e) =>
                          (e.target.style.backgroundColor = isDark
                            ? "#3a3b3c"
                            : "#f0f2f5")
                        }
                        onMouseLeave={(e) =>
                          (e.target.style.backgroundColor = "transparent")
                        }
                      >
                        <div className="d-flex align-items-center">
                          <div
                            style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "50%",
                              backgroundColor: isDark ? "#3a3b3c" : "#e4e6eb",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              marginRight: "12px",
                            }}
                          >
                            <i
                              className="fas fa-cog"
                              style={{ color: isDark ? "#e4e6eb" : "#1c1e21" }}
                            ></i>
                          </div>
                          <span>Settings & Privacy</span>
                        </div>
                        <i
                          className="fas fa-chevron-right"
                          style={{
                            fontSize: "12px",
                            color: isDark ? "#b0b3b8" : "#65676b",
                          }}
                        ></i>
                      </Link>

                      <Link
                        to="/help"
                        onClick={() => setShowUserMenu(false)}
                        className="d-flex align-items-center justify-content-between"
                        style={{
                          padding: "10px 12px",
                          borderRadius: "8px",
                          textDecoration: "none",
                          color: isDark ? "#e4e6eb" : "#1c1e21",
                          transition: "background 0.2s",
                        }}
                        onMouseEnter={(e) =>
                          (e.target.style.backgroundColor = isDark
                            ? "#3a3b3c"
                            : "#f0f2f5")
                        }
                        onMouseLeave={(e) =>
                          (e.target.style.backgroundColor = "transparent")
                        }
                      >
                        <div className="d-flex align-items-center">
                          <div
                            style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "50%",
                              backgroundColor: isDark ? "#3a3b3c" : "#e4e6eb",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              marginRight: "12px",
                            }}
                          >
                            <i
                              className="fas fa-question-circle"
                              style={{ color: isDark ? "#e4e6eb" : "#1c1e21" }}
                            ></i>
                          </div>
                          <span>Help & Support</span>
                        </div>
                        <i
                          className="fas fa-chevron-right"
                          style={{
                            fontSize: "12px",
                            color: isDark ? "#b0b3b8" : "#65676b",
                          }}
                        ></i>
                      </Link>

                      <div
                        onClick={toggleTheme}
                        className="d-flex align-items-center justify-content-between"
                        style={{
                          padding: "10px 12px",
                          borderRadius: "8px",
                          cursor: "pointer",
                          color: isDark ? "#e4e6eb" : "#1c1e21",
                          transition: "background 0.2s",
                        }}
                        onMouseEnter={(e) =>
                          (e.target.style.backgroundColor = isDark
                            ? "#3a3b3c"
                            : "#f0f2f5")
                        }
                        onMouseLeave={(e) =>
                          (e.target.style.backgroundColor = "transparent")
                        }
                      >
                        <div className="d-flex align-items-center">
                          <div
                            style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "50%",
                              backgroundColor: isDark ? "#3a3b3c" : "#e4e6eb",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              marginRight: "12px",
                            }}
                          >
                            <i
                              className={`fas ${isDark ? "fa-sun" : "fa-moon"}`}
                              style={{ color: isDark ? "#e4e6eb" : "#1c1e21" }}
                            ></i>
                          </div>
                          <span>Display & Accessibility</span>
                        </div>
                        <i
                          className="fas fa-chevron-right"
                          style={{
                            fontSize: "12px",
                            color: isDark ? "#b0b3b8" : "#65676b",
                          }}
                        ></i>
                      </div>

                      <div
                        style={{
                          height: "1px",
                          backgroundColor: isDark ? "#3a3b3c" : "#e4e6eb",
                          margin: "8px 0",
                        }}
                      ></div>

                      <div
                        onClick={handleLogout}
                        className="d-flex align-items-center justify-content-between"
                        style={{
                          padding: "10px 12px",
                          borderRadius: "8px",
                          cursor: "pointer",
                          color: isDark ? "#e4e6eb" : "#1c1e21",
                          transition: "background 0.2s",
                        }}
                        onMouseEnter={(e) =>
                          (e.target.style.backgroundColor = isDark
                            ? "#3a3b3c"
                            : "#f0f2f5")
                        }
                        onMouseLeave={(e) =>
                          (e.target.style.backgroundColor = "transparent")
                        }
                      >
                        <div className="d-flex align-items-center">
                          <div
                            style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "50%",
                              backgroundColor: isDark ? "#3a3b3c" : "#e4e6eb",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              marginRight: "12px",
                            }}
                          >
                            <i
                              className="fas fa-sign-out-alt"
                              style={{ color: isDark ? "#e4e6eb" : "#1c1e21" }}
                            ></i>
                          </div>
                          <span>Logout</span>
                        </div>
                        <i
                          className="fas fa-chevron-right"
                          style={{
                            fontSize: "12px",
                            color: isDark ? "#b0b3b8" : "#65676b",
                          }}
                        ></i>
                      </div>
                    </div>
                  )}
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

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={showLogoutConfirm}
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
        userName={user?.name || user?.username || "User"}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        onSuccess={() => {
          // Optionally refresh or show success message
        }}
      />
    </nav>
  );
};

export default Header;
