import axios from "axios";

// Create axios instance with default config
const API_URL =
  import.meta.env.VITE_API_URL || "https://backend-gw9o.onrender.com";
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
  withCredentials: true, // Important for session cookies
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if it's a network error (backend not running)
    if (!error.response) {
      console.error("❌ Cannot connect to backend server");
      return Promise.reject(
        new Error("Cannot connect to backend server. Please try again later."),
      );
    }

    // Don't auto-redirect on 401 - let the ProtectedRoute handle it
    // This prevents back button from going to login
    return Promise.reject(error);
  },
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post("/api/auth/login", credentials),
  signup: (data) => api.post("/api/auth/signup", data),
  logout: () => api.post("/api/auth/logout"),
  checkSession: () => api.get("/api/auth/session"),
  // 2FA endpoints (email-based)
  setup2FA: () => api.post("/api/auth/2fa/setup"),
  verify2FA: (token) => api.post("/api/auth/2fa/verify", { token }),
  disable2FA: (password) => api.post("/api/auth/2fa/disable", { password }),
  get2FAStatus: () => api.get("/api/auth/2fa/status"),
  sendLoginCode: (email) =>
    api.post("/api/auth/2fa/send-login-code", { email }),
};

// Customer API
export const customerAPI = {
  getDashboard: () => api.get("/customer/dashboard"),
  getOrders: () => api.get("/customer/api/orders"),
  getOrderDetails: (id) => api.get(`/customer/order/${id}`),
  getOrderById: (id) => api.get(`/customer/orders/${id}`),
  getCart: () => api.get("/api/customer/cart"),
  addToCart: (data) => api.post("/api/customer/cart", data),
  updateCartItem: (itemId, quantity) =>
    api.put(`/api/customer/cart/${itemId}`, { quantity }),
  removeFromCart: (itemId) => api.delete(`/api/customer/cart/${itemId}`),
  checkout: (data) => api.post("/customer/checkout", data),
  processCheckout: (data) => api.post("/customer/api/process-checkout", data),
  placeOrder: (data) => api.post("/customer/place-order", data),
  saveDesign: (data) => api.post("/customer/save-design", data),
  createDesign: (data) => api.post("/customer/design-studio", data),
  getDesigns: () => api.get("/customer/designs"),
  addToWishlist: (data) => api.post("/customer/wishlist/add", data),
  getWishlist: () => api.get("/customer/wishlist/list"),
  removeFromWishlist: (id) => api.delete(`/customer/wishlist/remove/${id}`),
  payOrder: (id, data) => api.post(`/customer/pay/${id}`, data),
  submitFeedback: (data) => api.post("/feedback/submit", data),
  cancelOrder: (id) => api.post(`/customer/order/${id}/cancel`),
  getAddresses: () => api.get("/api/customer/addresses"),
  addAddress: (data) => api.post("/api/customer/addresses", data),
  updateAddress: (id, data) => api.put(`/api/customer/addresses/${id}`, data),
  deleteAddress: (id) => api.delete(`/api/customer/addresses/${id}`),
  updateProfile: (data) => api.put("/api/customer/profile", data),
};

// Pincode API
export const pincodeAPI = {
  lookup: (pincode) => api.get(`/api/pincode/${pincode}`),
};

// Designer API
export const designerAPI = {
  getDashboard: () => api.get("/designer/dashboard"),
  getOrders: () => api.get("/designer/api/orders"),
  getOrderDetails: (id) => api.get(`/designer/order/${id}`),
  getOrderById: (id) => api.get(`/designer/orders/${id}`),
  updateOrderStatus: (id, status) =>
    api.put(`/designer/order/${id}/status`, { status }),
  startProduction: (id) => api.post(`/designer/orders/${id}/start`),
  updateProgress: (id, progress) =>
    api.post(`/designer/orders/${id}/progress`, {
      progressPercentage: progress,
    }),
  completeOrder: (id) => api.post(`/designer/orders/${id}/complete`),
  getProducts: () => api.get("/api/designer/products"),
  createProduct: (data) => api.post("/designer/products", data),
  updateProductStock: (id, inStock) =>
    api.put(`/api/designer/products/${id}/stock`, { inStock }),
};

// Manager API
export const managerAPI = {
  getDashboard: () => api.get("/manager/dashboard"),
  getPendingOrders: () => api.get("/manager/pending"),
  getOrders: () => api.get("/manager/api/orders"),
  getOrderDetails: (id) => api.get(`/manager/order/${id}`),
  getOrderById: (id) => api.get(`/manager/orders/${id}`),
  updateOrderStatus: (id, status) =>
    api.put(`/manager/order/${id}/status`, { status }),
  getDesigners: () => api.get("/manager/designers"),
  assignToDesigner: (id, designerId) =>
    api.post(`/manager/order/${id}/assign`, { designerId }),
  startProduction: (id) => api.post(`/manager/orders/${id}/start-production`),
  markComplete: (id) => api.post(`/manager/orders/${id}/mark-complete`),
  shipOrder: (id, trackingNumber) =>
    api.post(`/manager/order/${id}/ship`, { trackingNumber }),
  deliverOrder: (id) => api.post(`/manager/order/${id}/deliver`),
  completeOrder: (id) => api.post(`/manager/orders/${id}/complete`),
  getProducts: () => api.get("/manager/api/products"),
  createProduct: (data) => api.post("/manager/api/product", data),
  updateStock: (id, data) => api.put(`/manager/api/product/${id}/stock`, data),
  deleteProduct: (id) => api.delete(`/manager/api/product/${id}`),
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get("/admin/dashboard"),
  getOrders: () => api.get("/admin/api/orders"),
  getOrderDetails: (id) => api.get(`/admin/order/${id}`),
  updateOrderStatus: (id, status) =>
    api.put(`/admin/order/${id}/status`, { status }),
  getProducts: () => api.get("/api/admin/products"),
  createProduct: (data) => api.post("/admin/products", data),
  updateProduct: (id, data) => api.put(`/admin/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
  updateProductStock: (id, inStock) =>
    api.put(`/api/admin/products/${id}/stock`, { inStock }),
  getPendingManagers: () => api.get("/admin/pending-managers"),
  approveManager: (id) => api.post(`/admin/approve-manager/${id}`),
  rejectManager: (id) => api.post(`/admin/reject-manager/${id}`),
  getFeedbacks: () => api.get("/admin/feedbacks"),
};

// Shop API
export const shopAPI = {
  getProducts: (filters) => api.get("/api/shop/products", { params: filters }),
  getProductById: (id) => api.get(`/api/shop/products/${id}`),
  getProductDetails: (id) => api.get(`/api/shop/products/${id}`),
  getFabrics: () => api.get("/shop/fabrics"),
  getFilters: () => api.get("/api/shop/filters"),
};

// Feedback API
export const feedbackAPI = {
  submitFeedback: (data) => api.post("/feedback/submit", data),
  getAllFeedbacks: () => api.get("/feedback/all"),
};

// Review API
export const reviewAPI = {
  getProductReviews: (productId, params) =>
    api.get(`/api/products/${productId}/reviews`, { params }),
  canReview: (productId) => api.get(`/api/products/${productId}/can-review`),
  createReview: (productId, data) =>
    api.post(`/api/products/${productId}/reviews`, data),
  updateReview: (reviewId, data) => api.put(`/api/reviews/${reviewId}`, data),
  deleteReview: (reviewId) => api.delete(`/api/reviews/${reviewId}`),
  markHelpful: (reviewId) => api.post(`/api/reviews/${reviewId}/helpful`),
};

export default api;
