import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { ThemeProvider } from "./context/ThemeContext";
import { FlashProvider } from "./context/FlashContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Toast from "./components/Toast";
import LoadingSpinner from "./components/LoadingSpinner";
import LogoutAnimation from "./components/LogoutAnimation";
import "./styles/cartAnimation.css";

// Public Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";

// Marketplace Pages
import DesignerMarketplace from "./pages/marketplace/DesignerMarketplace";
import DesignerProfile from "./pages/marketplace/DesignerProfile";

// Shop Pages
import ShopIndex from "./pages/shop/ShopIndex";
import ProductDetails from "./pages/shop/ProductDetails";
import Model3DShowcase from "./pages/shop/Model3DShowcase";

// Customer Pages
import CustomerDashboard from "./pages/customer/Dashboard";
import Cart from "./pages/customer/Cart";
import Checkout from "./pages/customer/Checkout";
import DesignStudio from "./pages/customer/DesignStudio";
import CustomerOrderDetails from "./pages/customer/OrderDetails";
import TrackOrder from "./pages/customer/TrackOrder";
import OrderTracking from "./pages/customer/OrderTracking";
import Wishlist from "./pages/customer/Wishlist";
import SecuritySettings from "./pages/customer/SecuritySettings";
import HelpSupport from "./pages/customer/HelpSupport";

// Designer Pages
import DesignerDashboard from "./pages/designer/Dashboard";
import DesignerProducts from "./pages/designer/Products";
import DesignerOrderDetails from "./pages/designer/OrderDetails";
import DesignerEarnings from "./pages/designer/Earnings";

// Manager Pages
import ManagerDashboard from "./pages/manager/Dashboard";
import ManagerPending from "./pages/manager/Pending";
import ManagerOrderDetails from "./pages/manager/OrderDetails";
import ManagerStockManagement from "./pages/manager/StockManagement";
import ManagerDesignerPayouts from "./pages/manager/DesignerPayouts";

// Delivery Pages
import DeliveryDashboard from "./pages/delivery/Dashboard";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminOrders from "./pages/admin/Orders";
import AdminProducts from "./pages/admin/Products";
import AdminPendingManagers from "./pages/admin/PendingManagers";
import AdminFeedbacks from "./pages/admin/Feedbacks";
import AdminOrderDetails from "./pages/admin/OrderDetails";
import AdminAnalytics from "./pages/admin/Analytics";
import AdminDesigners from "./pages/admin/Designers";

import "./styles/styles.css";

// Component to handle logout animation
const AppWrapper = ({ children }) => {
  const { showLogoutAnimation, logoutUserName, completeLogout } = useAuth();

  const handleLogoutComplete = () => {
    completeLogout();
    window.location.href = "/";
  };

  return (
    <>
      {children}
      <LogoutAnimation
        isVisible={showLogoutAnimation}
        onComplete={handleLogoutComplete}
        userName={logoutUserName}
      />
    </>
  );
};

function App() {
  return (
    <Router>
      <ThemeProvider>
        <FlashProvider>
          <AuthProvider>
            <AppWrapper>
              <CartProvider>
                <Layout>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />

                    {/* Marketplace Routes - Blocked for Designers only */}
                    <Route
                      path="/marketplace"
                      element={
                        <ProtectedRoute
                          blockedRoles={["designer"]}
                          redirectTo="/designer"
                        >
                          <DesignerMarketplace />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/marketplace/designer/:designerId"
                      element={
                        <ProtectedRoute
                          blockedRoles={["designer"]}
                          redirectTo="/designer"
                        >
                          <DesignerProfile />
                        </ProtectedRoute>
                      }
                    />

                    {/* Security Settings - Available to all authenticated users */}
                    <Route
                      path="/security"
                      element={
                        <ProtectedRoute
                          allowedRoles={[
                            "customer",
                            "designer",
                            "manager",
                            "admin",
                            "delivery",
                          ]}
                        >
                          <SecuritySettings />
                        </ProtectedRoute>
                      }
                    />

                    {/* Help & Support - Available to all authenticated users */}
                    <Route
                      path="/help"
                      element={
                        <ProtectedRoute
                          allowedRoles={[
                            "customer",
                            "designer",
                            "manager",
                            "admin",
                            "delivery",
                          ]}
                        >
                          <HelpSupport />
                        </ProtectedRoute>
                      }
                    />

                    {/* Shop Routes */}
                    <Route path="/shop" element={<ShopIndex />} />
                    <Route
                      path="/shop/product/:id"
                      element={<ProductDetails />}
                    />
                    <Route
                      path="/shop/3d-showcase"
                      element={<Model3DShowcase />}
                    />

                    {/* Customer Routes */}
                    <Route
                      path="/customer/dashboard"
                      element={
                        <ProtectedRoute allowedRoles={["customer"]}>
                          <CustomerDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/customer/cart"
                      element={
                        <ProtectedRoute allowedRoles={["customer"]}>
                          <Cart />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/customer/checkout"
                      element={
                        <ProtectedRoute allowedRoles={["customer"]}>
                          <Checkout />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/customer/design-studio"
                      element={
                        <ProtectedRoute allowedRoles={["customer"]}>
                          <DesignStudio />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/customer/order/:id"
                      element={
                        <ProtectedRoute allowedRoles={["customer"]}>
                          <CustomerOrderDetails />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/customer/track/:id"
                      element={
                        <ProtectedRoute allowedRoles={["customer"]}>
                          <TrackOrder />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/customer/tracking/:id"
                      element={
                        <ProtectedRoute allowedRoles={["customer"]}>
                          <OrderTracking />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/customer/wishlist"
                      element={
                        <ProtectedRoute allowedRoles={["customer"]}>
                          <Wishlist />
                        </ProtectedRoute>
                      }
                    />

                    {/* Designer Routes */}
                    <Route
                      path="/designer/dashboard"
                      element={
                        <ProtectedRoute allowedRoles={["designer"]}>
                          <DesignerDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/designer/products"
                      element={
                        <ProtectedRoute allowedRoles={["designer"]}>
                          <DesignerProducts />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/designer/order/:id"
                      element={
                        <ProtectedRoute allowedRoles={["designer"]}>
                          <DesignerOrderDetails />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/designer/earnings"
                      element={
                        <ProtectedRoute allowedRoles={["designer"]}>
                          <DesignerEarnings />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/designer/orders/:id"
                      element={
                        <ProtectedRoute allowedRoles={["designer"]}>
                          <DesignerOrderDetails />
                        </ProtectedRoute>
                      }
                    />

                    {/* Manager Routes */}
                    <Route
                      path="/manager"
                      element={
                        <ProtectedRoute allowedRoles={["manager"]}>
                          <ManagerDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/manager/dashboard"
                      element={
                        <ProtectedRoute allowedRoles={["manager"]}>
                          <ManagerDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/manager/pending"
                      element={
                        <ProtectedRoute allowedRoles={["manager"]}>
                          <ManagerPending />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/manager/order/:id"
                      element={
                        <ProtectedRoute allowedRoles={["manager"]}>
                          <ManagerOrderDetails />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/manager/orders/:id"
                      element={
                        <ProtectedRoute allowedRoles={["manager"]}>
                          <ManagerOrderDetails />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/manager/stock"
                      element={
                        <ProtectedRoute allowedRoles={["manager"]}>
                          <ManagerStockManagement />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/manager/designers"
                      element={
                        <ProtectedRoute allowedRoles={["manager"]}>
                          <ManagerDesignerPayouts />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/manager/payouts"
                      element={
                        <ProtectedRoute allowedRoles={["manager"]}>
                          <ManagerDesignerPayouts />
                        </ProtectedRoute>
                      }
                    />

                    {/* Delivery Routes */}
                    <Route
                      path="/delivery"
                      element={
                        <ProtectedRoute allowedRoles={["delivery"]}>
                          <DeliveryDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/delivery/dashboard"
                      element={
                        <ProtectedRoute allowedRoles={["delivery"]}>
                          <DeliveryDashboard />
                        </ProtectedRoute>
                      }
                    />

                    {/* Admin Routes - Admin only views analytics and product stock */}
                    <Route
                      path="/admin/dashboard"
                      element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                          <AdminDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/orders"
                      element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                          <AdminOrders />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/products"
                      element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                          <AdminProducts />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/pending-managers"
                      element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                          <AdminPendingManagers />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/feedbacks"
                      element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                          <AdminFeedbacks />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/order/:id"
                      element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                          <AdminOrderDetails />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/analytics"
                      element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                          <AdminAnalytics />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/designers"
                      element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                          <AdminDesigners />
                        </ProtectedRoute>
                      }
                    />

                    {/* 404 Page */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Layout>
                {/* Redux Toast Notifications */}
                <Toast />
                {/* Global Loading Spinner */}
                <LoadingSpinner />
              </CartProvider>
            </AppWrapper>
          </AuthProvider>
        </FlashProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
