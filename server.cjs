const express = require("express");
const cors = require("cors");
const session = require("express-session");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const path = require("path");

const app = express();
const PORT = 5174;

// MongoDB Connection
mongoose
  .connect("mongodb://localhost:27017/designden")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// User Schema
const userSchema = new mongoose.Schema({
  username: String,
  name: String, // Full name for display
  email: String,
  password: String,
  contactNumber: String,
  role: String,
  approved: { type: Boolean, default: true },
  addresses: [
    {
      street: String,
      city: String,
      state: String,
      pincode: String,
      isDefault: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now },
    },
  ],
});

const User = mongoose.model("User", userSchema);

// Product Schema
const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  category: String,
  gender: String,
  price: Number,
  sizes: [String],
  colors: [String],
  patterns: [String],
  fabrics: [String],
  images: [String],
  inStock: Boolean,
  stockQuantity: Number,
  featured: Boolean,
  customizable: Boolean,
  modelPath: String,
  createdAt: { type: Date, default: Date.now },
});

const Product = mongoose.model("Product", productSchema);

// Cart Schema
const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      designId: { type: mongoose.Schema.Types.ObjectId, ref: "Design" },
      customizationId: { type: mongoose.Schema.Types.ObjectId },
      quantity: Number,
      size: String,
      color: String,
      addedAt: { type: Date, default: Date.now },
    },
  ],
  updatedAt: { type: Date, default: Date.now },
});

const Cart = mongoose.model("Cart", cartSchema);

// Feedback Schema
const feedbackSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Feedback = mongoose.model("Feedback", feedbackSchema);

// ============================================
// DELIVERY PARTNER SCHEMA (Like Ekart/Delhivery)
// ============================================
const deliveryPartnerSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "DesignDen Express", "Swift Delivery"
  code: { type: String, required: true, unique: true }, // e.g., "DDE", "SWD"
  logo: String,
  contactNumber: String,
  email: String,
  trackingUrlTemplate: String, // e.g., "https://track.dde.com/{trackingNumber}"
  avgDeliveryDays: { type: Number, default: 3 },
  rating: { type: Number, default: 4.5 },
  isActive: { type: Boolean, default: true },
  serviceablePincodes: [String],
  createdAt: { type: Date, default: Date.now },
});

const DeliveryPartner = mongoose.model(
  "DeliveryPartner",
  deliveryPartnerSchema
);

// ============================================
// CHAT/MESSAGE SCHEMA (Customer-Designer Communication)
// ============================================
const messageSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  senderRole: {
    type: String,
    enum: ["customer", "designer", "manager"],
    required: true,
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receiverRole: {
    type: String,
    enum: ["customer", "designer", "manager"],
    required: true,
  },
  message: { type: String, required: true },
  attachments: [
    {
      type: { type: String, enum: ["image", "file"] },
      url: String,
      name: String,
    },
  ],
  read: { type: Boolean, default: false },
  readAt: Date,
  createdAt: { type: Date, default: Date.now },
});

messageSchema.index({ orderId: 1, createdAt: -1 });
const Message = mongoose.model("Message", messageSchema);

// ============================================
// PRODUCTION MILESTONE SCHEMA (Designer Progress Tracking)
// ============================================
const productionMilestoneSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  designerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  milestone: {
    type: String,
    enum: [
      "design_review", // Reviewing customer's design requirements
      "fabric_selection", // Selecting and preparing fabric
      "cutting", // Cutting fabric pieces
      "stitching", // Main stitching work
      "embroidery", // Adding embroidery/prints if any
      "finishing", // Final touches and finishing
      "quality_check", // Quality inspection
      "packaging", // Packing the finished product
      "ready_for_pickup", // Ready to hand over to delivery
    ],
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "in_progress", "completed"],
    default: "pending",
  },
  notes: String,
  images: [String], // Progress images
  estimatedCompletion: Date,
  completedAt: Date,
  createdAt: { type: Date, default: Date.now },
});

const ProductionMilestone = mongoose.model(
  "ProductionMilestone",
  productionMilestoneSchema
);

// ============================================
// ENHANCED ORDER SCHEMA (Real-world Tracking)
// ============================================
const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  orderNumber: { type: String, unique: true }, // Human-readable order number like "DD-20231201-001"
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      designId: { type: mongoose.Schema.Types.ObjectId, ref: "Design" },
      quantity: { type: Number, required: true },
      size: String,
      color: String,
      price: Number,
    },
  ],
  totalAmount: { type: Number, required: true },

  // Order Type Detection
  orderType: { type: String, enum: ["shop", "custom"], default: "shop" },

  // Status with detailed workflow
  status: {
    type: String,
    enum: [
      // ===== COMMON STATUSES =====
      "pending", // Order placed, payment pending/completed
      "assigned_to_manager", // Auto-assigned to manager
      "confirmed", // Order confirmed, assigned to manager
      "processing", // Manager processing the order

      // ===== CUSTOM ORDER ONLY =====
      "assigned_to_designer", // Manager assigned to designer
      "designer_accepted", // Designer accepted the order
      "in_production", // Designer is working
      "production_milestone", // Designer sharing progress
      "production_completed", // Designer finished, QC passed

      // ===== DELIVERY FLOW =====
      "ready_for_pickup", // Ready for delivery partner pickup
      "picked_up", // Delivery partner picked up
      "in_transit", // In transit to delivery hub
      "out_for_delivery", // Out for final delivery
      "delivered", // Successfully delivered

      // ===== OTHER STATUSES =====
      "cancelled", // Order cancelled
      "return_requested", // Customer requested return
      "returned", // Order returned
    ],
    default: "pending",
  },

  // Payment Details
  paymentMethod: {
    type: String,
    enum: ["card", "upi", "netbanking", "cod", "wallet"],
    default: "card",
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "completed", "failed", "refunded"],
    default: "pending",
  },
  paymentDetails: {
    transactionId: String,
    paidAt: Date,
    amount: Number,
  },

  // Shipping Address
  shippingAddress: {
    name: String,
    email: String,
    phone: String,
    alternativePhone: String,
    street: String,
    landmark: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: "India" },
    addressType: {
      type: String,
      enum: ["home", "work", "other"],
      default: "home",
    },
  },

  // ===== DELIVERY PARTNER INTEGRATION (Like Ekart) =====
  deliveryPartner: {
    partnerId: { type: mongoose.Schema.Types.ObjectId, ref: "DeliveryPartner" },
    partnerName: String,
    trackingNumber: String,
    trackingUrl: String,
    awbNumber: String, // Air Waybill Number
  },

  // Delivery Scheduling
  deliverySlot: {
    date: Date,
    timeSlot: String, // e.g., "9AM-12PM", "12PM-3PM", "3PM-6PM", "6PM-9PM"
  },
  estimatedDelivery: {
    from: Date,
    to: Date,
  },
  actualDelivery: Date,

  // Delivery OTP (Like Flipkart)
  deliveryOTP: {
    code: String, // 4-digit OTP
    generatedAt: Date,
    verified: { type: Boolean, default: false },
    verifiedAt: Date,
  },

  // Proof of Delivery
  proofOfDelivery: {
    signature: String, // Base64 signature image
    photo: String, // Delivery photo
    receivedBy: String, // Name of person who received
    relationship: String, // e.g., "Self", "Family", "Security"
    notes: String,
  },

  // Real-time Tracking (Simulated GPS)
  liveTracking: {
    isActive: { type: Boolean, default: false },
    currentLocation: {
      lat: Number,
      lng: Number,
      address: String,
      updatedAt: Date,
    },
    deliveryPersonLocation: {
      lat: Number,
      lng: Number,
      updatedAt: Date,
    },
  },

  // Personnel Assignment
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  designerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  deliveryPersonId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  // Assignment Timestamps
  managerAssignedAt: Date,
  designerAssignedAt: Date,
  designerAcceptedAt: Date,
  deliveryAssignedAt: Date,
  productionStartedAt: Date,
  productionCompletedAt: Date,
  pickedUpAt: Date,
  deliveredAt: Date,

  // Custom Order Progress
  progressPercentage: { type: Number, default: 0, min: 0, max: 100 },
  currentMilestone: String,
  milestones: [
    {
      name: String,
      status: { type: String, enum: ["pending", "in_progress", "completed"] },
      completedAt: Date,
      notes: String,
    },
  ],

  // Communication
  chatEnabled: { type: Boolean, default: false },
  unreadMessages: { type: Number, default: 0 },

  // Feedback & Rating
  hasFeedback: { type: Boolean, default: false },
  rating: {
    overall: Number,
    delivery: Number,
    product: Number,
    service: Number,
    review: String,
    ratedAt: Date,
  },

  // Timeline (Comprehensive Event Log)
  timeline: [
    {
      status: String,
      note: String,
      location: String,
      by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      byRole: String,
      at: { type: Date, default: Date.now },
    },
  ],

  // Metadata
  source: { type: String, enum: ["web", "mobile", "admin"], default: "web" },
  ipAddress: String,
  userAgent: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Helper method to determine order type
orderSchema.methods.isCustomOrder = function () {
  return (
    this.orderType === "custom" ||
    this.items.some((item) => item.designId && !item.productId)
  );
};

orderSchema.methods.isShopOrder = function () {
  return (
    this.orderType === "shop" || this.items.every((item) => item.productId)
  );
};

// Generate order number
orderSchema.pre("save", async function (next) {
  if (!this.orderNumber) {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
    const count = await Order.countDocuments({
      createdAt: {
        $gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
        $lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
      },
    });
    this.orderNumber = `DD-${dateStr}-${String(count + 1).padStart(4, "0")}`;
  }

  // Set order type based on items
  if (!this.orderType) {
    this.orderType = this.items.some((item) => item.designId && !item.productId)
      ? "custom"
      : "shop";
  }

  // Enable chat for custom orders
  if (this.orderType === "custom") {
    this.chatEnabled = true;
  }

  this.updatedAt = new Date();
  next();
});

const Order = mongoose.model("Order", orderSchema);

// Design Schema (Custom Designs)
const designSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: String,
  category: String,
  fabric: String,
  color: String,
  pattern: String,
  size: String,
  graphic: String,
  customText: String,
  estimatedPrice: Number,
  basePrice: { type: Number, default: 500 },
  sustainabilityScore: Number,
  inStock: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const Design = mongoose.model("Design", designSchema);

// Wishlist Schema
const wishlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  designId: { type: mongoose.Schema.Types.ObjectId, ref: "Design" },
  addedAt: { type: Date, default: Date.now },
});

const Wishlist = mongoose.model("Wishlist", wishlistSchema);

// Notification Schema
const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  message: { type: String, required: true },
  type: { type: String, default: "info" }, // info, success, warning, error
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const Notification = mongoose.model("Notification", notificationSchema);

// Review Schema
const reviewSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, required: true },
  comment: { type: String, required: true },
  verified: { type: Boolean, default: false }, // Verified purchase
  helpful: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Users who found it helpful
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Index for efficient queries
reviewSchema.index({ productId: 1, createdAt: -1 });
reviewSchema.index({ userId: 1 });

const Review = mongoose.model("Review", reviewSchema);

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use("/images", express.static(path.join(__dirname, "public/images")));
app.use("/models", express.static(path.join(__dirname, "public/models")));

app.use(
  session({
    secret: "designden_secret_key_12345",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "lax",
    },
  })
);

// Routes
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt:", email);

    const user = await User.findOne({
      $or: [{ email: email }, { username: email }],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Compare password with bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    req.session.user = {
      id: user._id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      contactNumber: user.contactNumber,
    };

    req.session.save((err) => {
      if (err) {
        return res
          .status(500)
          .json({ success: false, message: "Session error" });
      }

      res.json({
        success: true,
        message: "Login successful",
        user: req.session.user,
      });
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.post("/api/auth/signup", async (req, res) => {
  try {
    const { username, name, email, password, contactNumber, role, address } =
      req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const user = new User({
      username,
      name: name || username, // Use username as fallback if name not provided
      email,
      password,
      contactNumber,
      role: role || "customer",
      approved: true,
      addresses: address
        ? [
            {
              street: address.street,
              city: address.city,
              state: address.state,
              pincode: address.pincode,
              isDefault: true,
            },
          ]
        : [],
    });

    await user.save();

    req.session.user = {
      id: user._id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      contactNumber: user.contactNumber,
    };

    res.json({
      success: true,
      message: "Account created successfully",
      user: req.session.user,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.get("/api/auth/session", (req, res) => {
  if (req.session.user) {
    res.json({ success: true, user: req.session.user });
  } else {
    res.json({ success: false, user: null });
  }
});

app.post("/api/auth/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Logout failed" });
    }
    res.json({ success: true, message: "Logged out successfully" });
  });
});

// Product Routes
app.get("/api/shop/products", async (req, res) => {
  try {
    const {
      category,
      gender,
      size,
      minPrice,
      maxPrice,
      sort,
      search,
      featured,
    } = req.query;

    let query = {};

    if (category) query.category = category;
    if (gender) query.gender = gender;
    if (size) query.sizes = { $in: [size] };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    if (featured === "true") query.featured = true;

    let sortOption = {};
    switch (sort) {
      case "price-low-high":
      case "price-asc":
        sortOption = { price: 1 };
        break;
      case "price-high-low":
      case "price-desc":
        sortOption = { price: -1 };
        break;
      case "name":
        sortOption = { name: 1 };
        break;
      case "newest":
      default:
        sortOption = { createdAt: -1 };
    }

    const products = await Product.find(query).sort(sortOption);
    res.json({ success: true, products });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.get("/api/shop/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, product });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.get("/api/shop/featured", async (req, res) => {
  try {
    const products = await Product.find({ featured: true }).limit(6);
    res.json({ success: true, products });
  } catch (error) {
    console.error("Error fetching featured products:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Review Routes
// Get reviews for a product
app.get("/api/products/:productId/reviews", async (req, res) => {
  try {
    const { sort = "-createdAt", limit = 20 } = req.query;
    const reviews = await Review.find({ productId: req.params.productId })
      .populate("userId", "username")
      .sort(sort)
      .limit(parseInt(limit));

    // Calculate average rating
    const stats = await Review.aggregate([
      {
        $match: {
          productId: new mongoose.Types.ObjectId(req.params.productId),
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
          ratings: {
            $push: "$rating",
          },
        },
      },
    ]);

    const ratingDistribution =
      stats.length > 0
        ? {
            5: stats[0].ratings.filter((r) => r === 5).length,
            4: stats[0].ratings.filter((r) => r === 4).length,
            3: stats[0].ratings.filter((r) => r === 3).length,
            2: stats[0].ratings.filter((r) => r === 2).length,
            1: stats[0].ratings.filter((r) => r === 1).length,
          }
        : { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    res.json({
      success: true,
      reviews,
      stats:
        stats.length > 0
          ? {
              averageRating: stats[0].averageRating,
              totalReviews: stats[0].totalReviews,
              distribution: ratingDistribution,
            }
          : {
              averageRating: 0,
              totalReviews: 0,
              distribution: ratingDistribution,
            },
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Check if user can review a product (has delivered order with this product)
app.get("/api/products/:productId/can-review", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.json({
        success: true,
        canReview: false,
        reason: "not_logged_in",
      });
    }

    if (req.session.user.role !== "customer") {
      return res.json({
        success: true,
        canReview: false,
        reason: "not_customer",
      });
    }

    const productId = req.params.productId;
    const userId = req.session.user.id;

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({ productId, userId });
    if (existingReview) {
      return res.json({
        success: true,
        canReview: false,
        reason: "already_reviewed",
      });
    }

    // Check if user has a DELIVERED order containing this product
    const deliveredOrder = await Order.findOne({
      userId,
      "items.productId": new mongoose.Types.ObjectId(productId),
      status: "delivered",
    });

    if (deliveredOrder) {
      return res.json({
        success: true,
        canReview: true,
        orderId: deliveredOrder._id,
        reason: "eligible",
      });
    }

    // Check if user has any pending/processing order with this product
    const pendingOrder = await Order.findOne({
      userId,
      "items.productId": new mongoose.Types.ObjectId(productId),
      status: {
        $in: [
          "pending",
          "processing",
          "confirmed",
          "shipped",
          "out_for_delivery",
        ],
      },
    });

    if (pendingOrder) {
      return res.json({
        success: true,
        canReview: false,
        reason: "order_not_delivered",
        orderStatus: pendingOrder.status,
      });
    }

    // User hasn't ordered this product
    return res.json({ success: true, canReview: false, reason: "not_ordered" });
  } catch (error) {
    console.error("Error checking review eligibility:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Create a review (customer only)
app.post("/api/products/:productId/reviews", async (req, res) => {
  try {
    if (!req.session.user) {
      return res
        .status(401)
        .json({ success: false, message: "Please login to review" });
    }

    const { rating, title, comment, orderId } = req.body;
    const productId = req.params.productId;
    const userId = req.session.user.id;

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({ productId, userId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this product",
      });
    }

    // Verify order if orderId is provided
    let verified = false;
    if (orderId) {
      const order = await Order.findOne({
        _id: orderId,
        userId,
        "items.productId": productId,
        status: "delivered",
      });
      verified = !!order;
    }

    const review = new Review({
      productId,
      userId,
      orderId,
      rating,
      title,
      comment,
      verified,
    });

    await review.save();
    await review.populate("userId", "username");

    res.json({ success: true, review });
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Update a review (own review only)
app.put("/api/reviews/:reviewId", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { rating, title, comment } = req.body;
    const review = await Review.findOne({
      _id: req.params.reviewId,
      userId: req.session.user.id,
    });

    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }

    review.rating = rating;
    review.title = title;
    review.comment = comment;
    review.updatedAt = Date.now();

    await review.save();
    await review.populate("userId", "username");

    res.json({ success: true, review });
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Delete a review (own review or admin)
app.delete("/api/reviews/:reviewId", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const query = { _id: req.params.reviewId };
    if (req.session.user.role !== "admin") {
      query.userId = req.session.user.id;
    }

    const review = await Review.findOneAndDelete(query);

    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }

    res.json({ success: true, message: "Review deleted" });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Mark review as helpful
app.post("/api/reviews/:reviewId/helpful", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ success: false, message: "Please login" });
    }

    const review = await Review.findById(req.params.reviewId);
    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }

    const userId = req.session.user.id;
    const index = review.helpful.indexOf(userId);

    if (index > -1) {
      // Remove helpful
      review.helpful.splice(index, 1);
    } else {
      // Add helpful
      review.helpful.push(userId);
    }

    await review.save();
    res.json({ success: true, helpfulCount: review.helpful.length });
  } catch (error) {
    console.error("Error marking review helpful:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Admin Routes
app.get("/api/admin/products", async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }
    const products = await Product.find().sort({ createdAt: -1 });
    res.json({ success: true, products });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.put("/api/admin/products/:id/stock", async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }
    const { inStock } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { inStock, stockQuantity: inStock ? 100 : 0 },
      { new: true }
    );
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    res.json({
      success: true,
      message: `Product marked as ${inStock ? "in stock" : "out of stock"}`,
      product,
    });
  } catch (error) {
    console.error("Error updating product stock:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Admin - Dashboard
app.get("/admin/dashboard", async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: "pending" });
    const completedOrders = await Order.countDocuments({
      status: { $in: ["completed", "delivered", "shipped"] },
    });

    // Calculate total revenue from completed and delivered orders
    const totalRevenue = await Order.aggregate([
      { $match: { status: { $in: ["completed", "delivered", "shipped"] } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    // Calculate completed revenue (delivered orders only)
    const completedRevenue = await Order.aggregate([
      { $match: { status: "delivered" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    // Get recent orders
    const recentOrders = await Order.find({})
      .populate("userId", "username email")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    res.json({
      success: true,
      stats: {
        totalOrders,
        pendingOrders,
        completedOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        completedRevenue: completedRevenue[0]?.total || 0,
      },
      recentOrders,
    });
  } catch (error) {
    console.error("Error fetching admin dashboard:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Admin - Get all orders
app.get("/admin/api/orders", async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const orders = await Order.find({})
      .populate("userId", "username email")
      .populate("items.productId", "name images price")
      .populate("items.designId", "name graphic basePrice estimatedPrice")
      .populate("managerId", "username email")
      .populate("designerId", "username email")
      .populate("deliveryPersonId", "username email")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Admin - Get order details
app.get("/admin/order/:id", async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const order = await Order.findById(req.params.id)
      .populate("userId", "username email contactNumber")
      .populate("items.productId", "name images price")
      .populate("items.designId", "name graphic basePrice estimatedPrice")
      .populate("managerId", "username email")
      .populate("designerId", "username email")
      .populate("deliveryPersonId", "username email")
      .lean();

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error("Error fetching order details:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Admin - Update order status
app.put("/admin/order/:id/status", async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    order.status = status;

    // Auto-mark payment as paid when order is delivered
    if (status === "delivered") {
      order.paymentStatus = "paid";
    }

    order.updatedAt = new Date();
    await order.save();

    res.json({ success: true, message: "Order status updated", order });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Admin - Get all feedbacks
app.get("/admin/feedbacks", async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }
    const feedbacks = await Feedback.find({})
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, feedbacks });
  } catch (error) {
    console.error("Error fetching feedbacks:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Customer - Submit feedback
app.post("/feedback/submit", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ success: false, message: "Not logged in" });
    }
    const { rating, comment, orderId } = req.body;

    if (!rating || !comment) {
      return res
        .status(400)
        .json({ success: false, message: "Rating and comment are required" });
    }

    const feedback = new Feedback({
      userId: req.session.user.id,
      orderId,
      rating,
      comment,
    });

    await feedback.save();

    // Update order to mark that feedback has been submitted
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, { hasFeedback: true });
    }

    res.json({
      success: true,
      message: "Feedback submitted successfully",
      feedback,
    });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Cancel order endpoint (customer only)
app.post("/customer/order/:id/cancel", async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== "customer") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Check if order belongs to the customer
    if (order.userId.toString() !== req.session.user.id) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    // Only allow cancellation if order is pending
    if (order.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Order can only be cancelled when status is pending",
      });
    }

    order.status = "cancelled";
    order.updatedAt = new Date();
    await order.save();

    res.json({ success: true, message: "Order cancelled successfully", order });
  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Pincode lookup endpoint
app.get("/api/pincode/:pincode", async (req, res) => {
  try {
    const { pincode } = req.params;

    // Validate pincode format
    if (!/^[1-9][0-9]{5}$/.test(pincode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pincode format",
      });
    }

    // Use India Post API
    const axios = require("axios");
    try {
      const response = await axios.get(
        `https://api.postalpincode.in/pincode/${pincode}`,
        { timeout: 5000 }
      );

      if (
        response.data &&
        response.data[0] &&
        response.data[0].Status === "Success" &&
        response.data[0].PostOffice &&
        response.data[0].PostOffice.length > 0
      ) {
        const postOffice = response.data[0].PostOffice[0];
        res.json({
          success: true,
          data: {
            city: postOffice.District,
            state: postOffice.State,
            area: postOffice.Name,
          },
        });
      } else {
        // Pincode not found - return success but no data to avoid blocking checkout
        res.json({
          success: false,
          message: "Pincode not found. Please enter city and state manually.",
        });
      }
    } catch (apiError) {
      // API error - allow user to continue with manual entry
      console.log("Pincode API error:", apiError.message);
      res.json({
        success: false,
        message:
          "Unable to lookup pincode. Please enter city and state manually.",
      });
    }
  } catch (error) {
    console.error("Error looking up pincode:", error);
    res.json({
      success: false,
      message:
        "Unable to lookup pincode. Please enter city and state manually.",
    });
  }
});

// Get all feedbacks (public or for specific role)
app.get("/feedback/all", async (req, res) => {
  try {
    const feedbacks = await Feedback.find({})
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    res.json({ success: true, feedbacks });
  } catch (error) {
    console.error("Error fetching feedbacks:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Admin - Get all feedbacks
app.get("/admin/feedbacks", async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const feedbacks = await Feedback.find({})
      .populate("userId", "username email")
      .populate("orderId")
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, feedbacks });
  } catch (error) {
    console.error("Error fetching feedbacks:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Designer Routes
// Designer - Dashboard
app.get("/designer/dashboard", async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== "designer") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const assignedOrders = await Order.find({
      designerId: req.session.user.id,
    }).countDocuments();

    const pendingOrders = await Order.find({
      designerId: req.session.user.id,
      status: "assigned_to_designer",
    }).countDocuments();

    const inProductionOrders = await Order.find({
      designerId: req.session.user.id,
      status: "in_production",
    }).countDocuments();

    const completedOrders = await Order.find({
      designerId: req.session.user.id,
      status: "production_completed",
    }).countDocuments();

    // Get recent orders assigned to this designer
    const orders = await Order.find({
      designerId: req.session.user.id,
    })
      .populate("userId", "username email")
      .populate("designerId", "username email")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    res.json({
      success: true,
      stats: {
        assignedOrders,
        pendingOrders,
        activeOrders: inProductionOrders,
        inProductionOrders,
        completedOrders,
      },
      orders,
    });
  } catch (error) {
    console.error("Error fetching designer dashboard:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Designer - Get order details
app.get("/designer/order/:id", async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== "designer") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const order = await Order.findById(req.params.id)
      .populate("userId", "username email contactNumber")
      .populate("items.productId", "name images price description")
      .populate(
        "items.designId",
        "name graphic basePrice estimatedPrice category fabric color size customText"
      )
      .populate("designerId", "username email")
      .lean();

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Designers can only view orders assigned to them
    if (
      order.designerId &&
      order.designerId._id.toString() !== req.session.user.id
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized to view this order" });
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error("Error fetching order details:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Designer - Get all assigned orders (API endpoint for Redux)
app.get("/designer/api/orders", async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== "designer") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const orders = await Order.find({
      designerId: req.session.user.id,
    })
      .populate("userId", "username email contactNumber")
      .populate("items.productId", "name images price")
      .populate(
        "items.designId",
        "name graphic basePrice estimatedPrice category fabric color size customText"
      )
      .populate("managerId", "username email")
      .populate("designerId", "username email")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching designer orders:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// In-memory store for graphic stock status
const graphicStockStatus = {
  graphic_1: true,
  graphic_2: true,
  graphic_3: true,
  graphic_4: true,
  graphic_5: true,
  graphic_6: true,
  graphic_7: true,
  graphic_8: true,
  graphic_9: true,
  graphic_10: true,
  graphic_11: true,
};

app.get("/api/designer/products", async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== "designer") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    // Return the 11 static graphics that designers can manage
    const staticGraphics = [
      {
        _id: "graphic_1",
        name: "Dragon Graphic 1",
        graphic: "/images/graphics/dragon_1.jpg",
        category: "T-Shirt",
        basePrice: 500,
        inStock: graphicStockStatus.graphic_1,
        createdAt: new Date("2025-11-26"),
      },
      {
        _id: "graphic_2",
        name: "Dragon Graphic 2",
        graphic: "/images/graphics/dragon_2.jpg",
        category: "T-Shirt",
        basePrice: 500,
        inStock: graphicStockStatus.graphic_2,
        createdAt: new Date("2025-11-26"),
      },
      {
        _id: "graphic_3",
        name: "Dragon Graphic 3",
        graphic: "/images/graphics/dragon_3.jpg",
        category: "T-Shirt",
        basePrice: 500,
        inStock: graphicStockStatus.graphic_3,
        createdAt: new Date("2025-11-26"),
      },
      {
        _id: "graphic_4",
        name: "Dragon Graphic 4",
        graphic: "/images/graphics/dragon_4.jpg",
        category: "T-Shirt",
        basePrice: 500,
        inStock: graphicStockStatus.graphic_4,
        createdAt: new Date("2025-11-26"),
      },
      {
        _id: "graphic_5",
        name: "Dragon Graphic 5",
        graphic: "/images/graphics/dragon_5.jpg",
        category: "T-Shirt",
        basePrice: 500,
        inStock: graphicStockStatus.graphic_5,
        createdAt: new Date("2025-11-26"),
      },
      {
        _id: "graphic_6",
        name: "Dragon Graphic 6",
        graphic: "/images/graphics/dragon_6.jpg",
        category: "T-Shirt",
        basePrice: 500,
        inStock: graphicStockStatus.graphic_6,
        createdAt: new Date("2025-11-26"),
      },
      {
        _id: "graphic_7",
        name: "Dragon Graphic 7",
        graphic: "/images/graphics/dragon_7.jpg",
        category: "T-Shirt",
        basePrice: 500,
        inStock: graphicStockStatus.graphic_7,
        createdAt: new Date("2025-11-26"),
      },
      {
        _id: "graphic_8",
        name: "Dragon Graphic 8",
        graphic: "/images/graphics/dragon_8.jpg",
        category: "T-Shirt",
        basePrice: 500,
        inStock: graphicStockStatus.graphic_8,
        createdAt: new Date("2025-11-26"),
      },
      {
        _id: "graphic_9",
        name: "Dragon Graphic 9",
        graphic: "/images/graphics/dragon_9.jpg",
        category: "T-Shirt",
        basePrice: 500,
        inStock: graphicStockStatus.graphic_9,
        createdAt: new Date("2025-11-26"),
      },
      {
        _id: "graphic_10",
        name: "Dragon Graphic 10",
        graphic: "/images/graphics/dragon_10.jpg",
        category: "T-Shirt",
        basePrice: 500,
        inStock: graphicStockStatus.graphic_10,
        createdAt: new Date("2025-11-26"),
      },
      {
        _id: "graphic_11",
        name: "Model Graphic",
        graphic: "/images/graphics/model.png",
        category: "T-Shirt",
        basePrice: 500,
        inStock: graphicStockStatus.graphic_11,
        createdAt: new Date("2025-11-26"),
      },
    ];

    res.json({ success: true, products: staticGraphics });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Designer - Update design/graphic stock status
app.put("/api/designer/products/:id/stock", async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== "designer") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }
    const { inStock } = req.body;
    const graphicId = req.params.id;

    // Update in-memory stock status
    if (graphicStockStatus.hasOwnProperty(graphicId)) {
      graphicStockStatus[graphicId] = inStock;
      res.json({
        success: true,
        message: `Graphic marked as ${inStock ? "in stock" : "out of stock"}`,
      });
    } else {
      res.status(404).json({ success: false, message: "Graphic not found" });
    }
  } catch (error) {
    console.error("Error updating graphic stock:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get all graphics with stock status for design studio
app.get("/api/graphics/all", async (req, res) => {
  try {
    // Return the same 11 static graphics with their stock status
    const staticGraphics = [
      {
        _id: "graphic_1",
        name: "Dragon Graphic 1",
        graphic: "/images/graphics/dragon_1.jpg",
        filename: "dragon_1.jpg",
        inStock: graphicStockStatus.graphic_1,
      },
      {
        _id: "graphic_2",
        name: "Dragon Graphic 2",
        graphic: "/images/graphics/dragon_2.jpg",
        filename: "dragon_2.jpg",
        inStock: graphicStockStatus.graphic_2,
      },
      {
        _id: "graphic_3",
        name: "Dragon Graphic 3",
        graphic: "/images/graphics/dragon_3.jpg",
        filename: "dragon_3.jpg",
        inStock: graphicStockStatus.graphic_3,
      },
      {
        _id: "graphic_4",
        name: "Dragon Graphic 4",
        graphic: "/images/graphics/dragon_4.jpg",
        filename: "dragon_4.jpg",
        inStock: graphicStockStatus.graphic_4,
      },
      {
        _id: "graphic_5",
        name: "Dragon Graphic 5",
        graphic: "/images/graphics/dragon_5.jpg",
        filename: "dragon_5.jpg",
        inStock: graphicStockStatus.graphic_5,
      },
      {
        _id: "graphic_6",
        name: "Dragon Graphic 6",
        graphic: "/images/graphics/dragon_6.jpg",
        filename: "dragon_6.jpg",
        inStock: graphicStockStatus.graphic_6,
      },
      {
        _id: "graphic_7",
        name: "Dragon Graphic 7",
        graphic: "/images/graphics/dragon_7.jpg",
        filename: "dragon_7.jpg",
        inStock: graphicStockStatus.graphic_7,
      },
      {
        _id: "graphic_8",
        name: "Dragon Graphic 8",
        graphic: "/images/graphics/dragon_8.jpg",
        filename: "dragon_8.jpg",
        inStock: graphicStockStatus.graphic_8,
      },
      {
        _id: "graphic_9",
        name: "Dragon Graphic 9",
        graphic: "/images/graphics/dragon_9.jpg",
        filename: "dragon_9.jpg",
        inStock: graphicStockStatus.graphic_9,
      },
      {
        _id: "graphic_10",
        name: "Dragon Graphic 10",
        graphic: "/images/graphics/dragon_10.jpg",
        filename: "dragon_10.jpg",
        inStock: graphicStockStatus.graphic_10,
      },
      {
        _id: "graphic_11",
        name: "Model Graphic",
        graphic: "/images/graphics/model.png",
        filename: "model.png",
        inStock: graphicStockStatus.graphic_11,
      },
    ];

    res.json({ success: true, graphics: staticGraphics });
  } catch (error) {
    console.error("Error fetching graphics:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get available graphics for design studio (only in-stock items)
app.get("/api/graphics/available", async (req, res) => {
  try {
    const designs = await Design.find({ inStock: { $ne: false } })
      .select("graphic name category basePrice")
      .sort({ createdAt: -1 });
    res.json({ success: true, graphics: designs });
  } catch (error) {
    console.error("Error fetching available graphics:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Manager Routes
// Manager - Dashboard
app.get("/manager/dashboard", async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== "manager") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: "pending" });
    const inProductionOrders = await Order.countDocuments({
      status: "in-production",
    });
    const completedOrders = await Order.countDocuments({ status: "completed" });

    res.json({
      success: true,
      stats: {
        totalOrders,
        pendingOrders,
        inProductionOrders,
        completedOrders,
      },
    });
  } catch (error) {
    console.error("Error fetching manager dashboard:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Manager - Get list of designers
app.get("/manager/designers", async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== "manager") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const designers = await User.find({ role: "designer" })
      .select("username email")
      .lean();

    res.json({ success: true, designers });
  } catch (error) {
    console.error("Error fetching designers:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Manager - Get all orders
app.get("/manager/api/orders", async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== "manager") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const orders = await Order.find({})
      .populate("userId", "username email")
      .populate("items.productId", "name images price")
      .populate("items.designId", "name graphic basePrice estimatedPrice")
      .populate("managerId", "username email")
      .populate("designerId", "username email")
      .populate("deliveryPersonId", "username email")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Manager - Get pending orders
app.get("/manager/pending", async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== "manager") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const orders = await Order.find({ status: "pending" })
      .populate("userId", "username email")
      .populate("items.productId", "name images price")
      .populate("items.designId", "name graphic basePrice estimatedPrice")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching pending orders:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Manager - Get order details
app.get("/manager/order/:id", async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== "manager") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const order = await Order.findById(req.params.id)
      .populate("userId", "username email contactNumber")
      .populate("items.productId", "name images price description")
      .populate(
        "items.designId",
        "name graphic basePrice estimatedPrice category fabric color size customText"
      )
      .populate("managerId", "username email")
      .populate("designerId", "username email")
      .populate("deliveryPersonId", "username email")
      .lean();

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error("Error fetching order details:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Manager - Update order status
app.put("/manager/order/:id/status", async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== "manager") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    order.status = status;
    order.updatedAt = new Date();
    await order.save();

    res.json({ success: true, message: "Order status updated", order });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Manager - Assign order to designer
app.post("/manager/order/:id/assign", async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== "manager") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const { designerId } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // ⚠️ CRITICAL RESTRICTION: Only designer@designden.com can be assigned
    const designer = await User.findOne({ _id: designerId, role: "designer" });
    if (!designer || designer.email !== "designer@designden.com") {
      return res.status(403).json({
        success: false,
        message: "Only designer@designden.com can be assigned to orders",
      });
    }

    // Update order with designer assignment
    order.designerId = designerId;
    order.status = "assigned_to_designer";
    order.designerAssignedAt = new Date();
    order.updatedAt = new Date();

    // Add to timeline
    if (!order.timeline) order.timeline = [];
    order.timeline.push({
      status: "assigned_to_designer",
      note: `Assigned to designer ${designer.email}`,
      at: new Date(),
    });

    await order.save();
    await order.populate("designerId", "username email");

    // Create notifications
    // 1. Notify designer
    await Notification.create({
      userId: designerId,
      orderId: order._id,
      message: `You have been assigned order #${order._id
        .toString()
        .substring(0, 8)}`,
      type: "info",
    });

    // 2. Notify customer
    await Notification.create({
      userId: order.userId,
      orderId: order._id,
      message: `Your order has been assigned to a designer`,
      type: "success",
    });

    res.json({
      success: true,
      message: "Designer assigned successfully",
      order,
    });
  } catch (error) {
    console.error("Error assigning designer:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Manager - Ship order
app.post("/manager/order/:id/ship", async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== "manager") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const { trackingNumber } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    order.status = "shipped";
    order.trackingNumber = trackingNumber;
    order.updatedAt = new Date();
    await order.save();

    res.json({ success: true, message: "Order marked as shipped", order });
  } catch (error) {
    console.error("Error shipping order:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Manager - Deliver order
app.post("/manager/order/:id/deliver", async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== "manager") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    order.status = "delivered";
    order.paymentStatus = "paid"; // Auto-mark payment as paid on delivery
    order.updatedAt = new Date();
    await order.save();

    res.json({ success: true, message: "Order marked as delivered", order });
  } catch (error) {
    console.error("Error delivering order:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Manager - Assign delivery person
app.post("/manager/order/:id/assign-delivery", async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== "manager") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const { deliveryPerson } = req.body;
    const order = await Order.findById(req.params.id)
      .populate("userId", "username email")
      .populate("designerId", "username email");

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (!deliveryPerson || !deliveryPerson.trim()) {
      return res.status(400).json({
        success: false,
        message: "Delivery person name is required",
      });
    }

    // Determine order type
    const isCustomOrder = await order.isCustomOrder();
    const isShopOrder = await order.isShopOrder();

    // Update order with delivery person
    order.deliveryPerson = deliveryPerson.trim();
    order.deliveryAssignedAt = new Date();
    order.status = "shipped"; // Both types move to "shipped" when delivery is assigned
    order.updatedAt = new Date();

    // Add to timeline
    if (!order.timeline) order.timeline = [];
    order.timeline.push({
      status: "shipped",
      note: `Delivery assigned to ${deliveryPerson.trim()}${
        isCustomOrder
          ? " (Custom order ready from designer)"
          : " (Shop order ready from warehouse)"
      }`,
      at: new Date(),
    });

    await order.save();

    // Create notification for customer
    await Notification.create({
      userId: order.userId._id,
      orderId: order._id,
      message: `🚚 Delivery Assigned - Your ${
        isCustomOrder ? "custom design" : ""
      } order will be delivered by ${deliveryPerson.trim()}`,
      type: "info",
    });

    // Notify designer if it's a custom order
    if (isCustomOrder && order.designerId) {
      await Notification.create({
        userId: order.designerId._id,
        orderId: order._id,
        message: `📦 Your completed design for Order #${order._id
          .toString()
          .substring(0, 8)} has been dispatched for delivery`,
        type: "success",
      });
    }

    res.json({
      success: true,
      message: `Delivery assigned to ${deliveryPerson.trim()}`,
      order,
    });
  } catch (error) {
    console.error("Error assigning delivery:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Designer - Update order status
app.put("/designer/order/:id/status", async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== "designer") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Designers can only update orders assigned to them
    if (
      !order.designerId ||
      order.designerId.toString() !== req.session.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this order",
      });
    }

    order.status = status;
    order.updatedAt = new Date();
    await order.save();

    res.json({ success: true, message: "Order status updated", order });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Designer - Start production on order
app.post("/designer/order/:id/start-production", async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== "designer") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const order = await Order.findById(req.params.id).populate(
      "userId",
      "username email"
    );

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Verify designer owns this order
    if (
      !order.designerId ||
      order.designerId.toString() !== req.session.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this order",
      });
    }

    // Can only start production if status is "assigned_to_designer" or "designer_accepted"
    if (
      order.status !== "assigned_to_designer" &&
      order.status !== "designer_accepted"
    ) {
      return res.status(400).json({
        success: false,
        message: "Order must be assigned to you to start production",
      });
    }

    // Update order to in_production
    order.status = "in_production";
    order.updatedAt = new Date();

    // Add to timeline
    if (!order.timeline) order.timeline = [];
    order.timeline.push({
      status: "in_production",
      note: `Designer has started working on the custom design`,
      at: new Date(),
    });

    await order.save();

    // Notify customer
    await Notification.create({
      userId: order.userId._id,
      orderId: order._id,
      message: `🎨 Production Started! Designer has started working on your custom design.`,
      type: "info",
    });

    res.json({
      success: true,
      message: "Production started",
      order,
    });
  } catch (error) {
    console.error("Error starting production:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Designer - Mark order as ready/completed
app.post("/designer/order/:id/mark-ready", async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== "designer") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const { completionNote } = req.body;
    const order = await Order.findById(req.params.id).populate(
      "userId",
      "username email"
    );

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Verify designer owns this order
    if (
      !order.designerId ||
      order.designerId.toString() !== req.session.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this order",
      });
    }

    // Update order to production completed
    order.status = "production_completed";
    order.productionCompletedAt = new Date();
    order.progressPercentage = 100;
    order.currentMilestone = "Ready for Delivery";
    order.updatedAt = new Date();

    // Add to timeline
    if (!order.timeline) order.timeline = [];
    order.timeline.push({
      status: "production_completed",
      note: `Design work completed${
        completionNote ? ": " + completionNote : ""
      }`,
      at: new Date(),
    });

    await order.save();

    // Create notifications
    // 1. Notify customer
    await Notification.create({
      userId: order.userId._id,
      orderId: order._id,
      message: `🎊 Your Custom Design is Complete! Order #${order._id
        .toString()
        .substring(0, 8)}${completionNote ? ": " + completionNote : ""}`,
      type: "success",
    });

    // 2. Notify all managers
    const managers = await User.find({ role: "manager" });
    for (const manager of managers) {
      await Notification.create({
        userId: manager._id,
        orderId: order._id,
        message: `📦 Order #${order._id
          .toString()
          .substring(
            0,
            8
          )} ready for shipping - Designer has completed production`,
        type: "info",
      });
    }

    res.json({
      success: true,
      message: "Order marked as completed",
      order,
      redirect: `/designer/order/${order._id}`,
    });
  } catch (error) {
    console.error("Error marking order ready:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Delivery Boy Routes (UPDATED to use deliveryPersonId)
// Delivery Boy - Dashboard
app.get("/delivery/dashboard", async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== "delivery") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    // Get orders assigned to this delivery person using deliveryPersonId
    const assignedOrders = await Order.find({
      deliveryPersonId: req.session.user.id,
      status: {
        $in: [
          "ready_for_pickup",
          "picked_up",
          "in_transit",
          "out_for_delivery",
        ],
      },
    })
      .populate("userId", "username email")
      .populate("designerId", "username email")
      .sort({ deliveryAssignedAt: -1 });

    res.json({
      success: true,
      orders: assignedOrders,
      stats: {
        pending: assignedOrders.filter((o) => o.status === "ready_for_pickup")
          .length,
        pickedUp: assignedOrders.filter((o) => o.status === "picked_up").length,
        inTransit: assignedOrders.filter(
          (o) => o.status === "in_transit" || o.status === "out_for_delivery"
        ).length,
      },
    });
  } catch (error) {
    console.error("Error fetching delivery orders:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Delivery Boy - Update delivery status
app.post("/delivery/order/:id/update-status", async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== "delivery") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const { status, note } = req.body;
    const order = await Order.findById(req.params.id)
      .populate("userId", "username email")
      .populate("designerId", "username email");

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Verify this delivery person is assigned to this order
    if (order.deliveryPersonId?.toString() !== req.session.user.id) {
      return res.status(403).json({
        success: false,
        message: "You are not assigned to this order",
      });
    }

    // Validate status transition
    if (
      !["picked_up", "in_transit", "out_for_delivery", "delivered"].includes(
        status
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status. Use 'picked_up', 'in_transit', 'out_for_delivery' or 'delivered'",
      });
    }

    // Determine order type for better messaging
    const isCustomOrder = await order.isCustomOrder();

    // Update order status
    const oldStatus = order.status;
    order.status = status;
    order.updatedAt = new Date();

    if (status === "delivered") {
      order.deliveredAt = new Date();
      order.paymentStatus = "completed"; // Mark payment as completed on delivery
    }

    // Generate OTP if not already present and status is out_for_delivery
    if (status === "out_for_delivery" && !order.deliveryOTP?.code) {
      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      order.deliveryOTP = {
        code: otp,
        generatedAt: new Date(),
        verified: false,
      };
      console.log("Generated OTP for delivery:", otp);
    }

    // Add to timeline
    if (!order.timeline) order.timeline = [];
    order.timeline.push({
      status: status,
      note:
        note ||
        `Status updated by delivery person: ${req.session.user.username}`,
      at: new Date(),
    });

    await order.save();

    // Create notifications based on status
    if (status === "out_for_delivery") {
      // Notify customer with OTP info
      await Notification.create({
        userId: order.userId._id,
        orderId: order._id,
        message: `🚚 Your ${
          isCustomOrder ? "custom design " : ""
        }order is on the way! Your delivery OTP is: ${
          order.deliveryOTP?.code
        }. Delivery person: ${req.session.user.username}`,
        type: "info",
      });
    } else if (status === "delivered") {
      // Notify customer
      await Notification.create({
        userId: order.userId._id,
        orderId: order._id,
        message: `✅ Your ${
          isCustomOrder ? "custom design " : ""
        }order has been delivered! Please provide feedback.`,
        type: "success",
      });

      // Notify managers
      const managers = await User.find({ role: "manager" });
      for (const manager of managers) {
        await Notification.create({
          userId: manager._id,
          orderId: order._id,
          message: `📦 Order #${order._id
            .toString()
            .substring(0, 8)} delivered successfully by ${
            req.session.user.username
          }`,
          type: "success",
        });
      }

      // Notify designer if it's a custom order
      if (isCustomOrder && order.designerId) {
        await Notification.create({
          userId: order.designerId._id,
          orderId: order._id,
          message: `🎉 Your custom design for Order #${order._id
            .toString()
            .substring(0, 8)} was successfully delivered!`,
          type: "success",
        });
      }
    }

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      order,
    });
  } catch (error) {
    console.error("Error updating delivery status:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Delivery Boy - Get assigned orders (UPDATED to use deliveryPersonId)
app.get("/delivery/orders", async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== "delivery") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const orders = await Order.find({
      deliveryPersonId: req.session.user.id,
    })
      .populate("userId", "username email")
      .populate("designerId", "username email")
      .sort({ deliveryAssignedAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching delivery orders:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Delivery Boy - Get order details
app.get("/delivery/order/:id", async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== "delivery") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const order = await Order.findById(req.params.id)
      .populate("userId", "username email contactNumber")
      .populate("designerId", "username email")
      .populate("items.productId")
      .populate("items.designId");

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Verify this delivery person is assigned
    if (order.deliveryPersonId?.toString() !== req.session.user.id) {
      return res.status(403).json({
        success: false,
        message: "You are not assigned to this order",
      });
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error("Error fetching order details:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Customer Routes
// Customer - Dashboard
app.get("/customer/dashboard", async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== "customer") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const totalOrders = await Order.countDocuments({
      userId: req.session.user.id,
    });
    const pendingOrders = await Order.countDocuments({
      userId: req.session.user.id,
      status: "pending",
    });
    const completedOrders = await Order.countDocuments({
      userId: req.session.user.id,
      status: "completed",
    });

    res.json({
      success: true,
      stats: {
        totalOrders,
        pendingOrders,
        completedOrders,
      },
    });
  } catch (error) {
    console.error("Error fetching customer dashboard:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Customer - Get orders
app.get("/customer/api/orders", async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== "customer") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const orders = await Order.find({ userId: req.session.user.id })
      .populate("items.productId", "name images price")
      .populate("items.designId", "name graphic basePrice estimatedPrice")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching customer orders:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Customer - Get order details
app.get("/customer/order/:id", async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== "customer") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.session.user.id,
    })
      .populate("items.productId", "name images price description")
      .populate(
        "items.designId",
        "name graphic basePrice estimatedPrice category fabric color size customText"
      )
      .populate("deliveryPersonId", "name contactNumber")
      .lean();

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Debug OTP
    console.log("=== Customer Order Details ===");
    console.log("Order ID:", order._id);
    console.log("Order Status:", order.status);
    console.log("Delivery OTP object:", order.deliveryOTP);
    console.log("Delivery OTP code:", order.deliveryOTP?.code);

    // Add OTP to response if order is out for delivery
    const deliveryStatuses = [
      "out_for_delivery",
      "picked_up",
      "in_transit",
      "ready_for_pickup",
    ];
    const shouldShowOTP =
      order.deliveryOTP?.code && deliveryStatuses.includes(order.status);

    console.log("Should show OTP:", shouldShowOTP);
    console.log("==============================");

    const orderWithOTP = {
      ...order,
      // Show OTP only when order is being delivered
      deliveryOTPCode: shouldShowOTP ? order.deliveryOTP.code : null,
    };

    res.json({ success: true, order: orderWithOTP });
  } catch (error) {
    console.error("Error fetching order details:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Customer - Save design
app.post("/customer/save-design", async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== "customer") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const design = new Design({
      userId: req.session.user.id,
      ...req.body,
    });

    await design.save();
    res.json({ success: true, message: "Design saved successfully", design });
  } catch (error) {
    console.error("Error saving design:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Customer - Get designs
app.get("/customer/designs", async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== "customer") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const designs = await Design.find({ userId: req.session.user.id })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, designs });
  } catch (error) {
    console.error("Error fetching designs:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Customer - Get single design by ID
app.get("/customer/designs/:id", async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== "customer") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const design = await Design.findOne({
      _id: req.params.id,
      userId: req.session.user.id,
    }).lean();

    if (!design) {
      return res
        .status(404)
        .json({ success: false, message: "Design not found" });
    }

    res.json({ success: true, design });
  } catch (error) {
    console.error("Error fetching design:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Customer - Add to wishlist
app.post("/customer/wishlist/add", async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== "customer") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const { productId, designId } = req.body;

    // Check if already in wishlist
    const existing = await Wishlist.findOne({
      userId: req.session.user.id,
      ...(productId && { productId }),
      ...(designId && { designId }),
    });

    if (existing) {
      return res.json({ success: true, message: "Already in wishlist" });
    }

    const wishlistItem = new Wishlist({
      userId: req.session.user.id,
      productId,
      designId,
    });

    await wishlistItem.save();
    res.json({ success: true, message: "Added to wishlist" });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Customer - Get wishlist
app.get("/customer/wishlist/list", async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== "customer") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const wishlist = await Wishlist.find({ userId: req.session.user.id })
      .populate("productId")
      .populate("designId")
      .sort({ addedAt: -1 })
      .lean();

    res.json({ success: true, wishlist });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Customer - Remove from wishlist
app.delete("/customer/wishlist/remove/:id", async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== "customer") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    await Wishlist.findOneAndDelete({
      _id: req.params.id,
      userId: req.session.user.id,
    });

    res.json({ success: true, message: "Removed from wishlist" });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Cart Routes
app.get("/api/customer/cart", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ success: false, message: "Not logged in" });
    }
    let cart = await Cart.findOne({ userId: req.session.user.id })
      .populate("items.productId")
      .populate("items.designId");

    console.log("=== BACKEND CART DEBUG ===");
    console.log("User ID:", req.session.user.id);
    console.log("Cart found:", !!cart);
    if (cart) {
      console.log("Raw cart items count:", cart.items.length);
      cart.items.forEach((item, index) => {
        console.log(`Item ${index}:`, {
          _id: item._id,
          productId: item.productId?._id || "NOT POPULATED",
          quantity: item.quantity,
          size: item.size,
          color: item.color,
        });
      });
    }
    console.log("=========================");

    if (!cart) {
      cart = new Cart({ userId: req.session.user.id, items: [] });
      await cart.save();
    }
    res.json({ success: true, cart });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.post("/api/customer/cart", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ success: false, message: "Not logged in" });
    }

    // Only customers can add to cart
    if (req.session.user.role !== "customer") {
      return res.status(403).json({
        success: false,
        message: "Only customers can add items to cart",
      });
    }

    const { productId, designId, quantity, size, color } = req.body;

    if (!productId && !designId) {
      return res.status(400).json({
        success: false,
        message: "Product ID or Design ID is required",
      });
    }

    // If adding a product (not a custom design), check stock
    if (productId) {
      const product = await Product.findById(productId);
      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      }

      if (!product.inStock || product.stockQuantity < quantity) {
        return res.status(400).json({
          success: false,
          message: "Insufficient stock available",
        });
      }
    }

    // If adding a custom design, verify it exists
    if (designId) {
      const design = await Design.findById(designId);
      if (!design) {
        return res
          .status(404)
          .json({ success: false, message: "Design not found" });
      }
    }

    let cart = await Cart.findOne({ userId: req.session.user.id });
    if (!cart) {
      cart = new Cart({ userId: req.session.user.id, items: [] });
    }

    const existingItem = cart.items.find((item) => {
      if (productId && item.productId) {
        return (
          item.productId.toString() === productId &&
          item.size === size &&
          item.color === color
        );
      }
      if (designId && item.designId) {
        return item.designId.toString() === designId;
      }
      return false;
    });

    let addedQuantity = quantity;
    if (existingItem) {
      addedQuantity = quantity;
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ productId, designId, quantity, size, color });
    }

    // Reduce stock quantity only for products (not custom designs)
    if (productId) {
      const product = await Product.findById(productId);
      product.stockQuantity -= addedQuantity;
      if (product.stockQuantity <= 0) {
        product.inStock = false;
        product.stockQuantity = 0;
      }
      await product.save();
    }

    cart.updatedAt = new Date();
    await cart.save();
    res.json({ success: true, message: "Item added to cart", cart });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Update cart item quantity
app.put("/api/customer/cart/:itemId", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ success: false, message: "Not logged in" });
    }

    const { itemId } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid quantity" });
    }

    const cart = await Cart.findOne({ userId: req.session.user.id });
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found in cart" });
    }

    const product = await Product.findById(item.productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Calculate stock change
    const quantityDifference = quantity - item.quantity;

    if (quantityDifference > 0) {
      // Increasing quantity - check stock availability
      if (product.stockQuantity < quantityDifference) {
        return res.status(400).json({
          success: false,
          message: "Insufficient stock available",
        });
      }
      product.stockQuantity -= quantityDifference;
    } else if (quantityDifference < 0) {
      // Decreasing quantity - return stock
      product.stockQuantity += Math.abs(quantityDifference);
      product.inStock = true;
    }

    await product.save();
    item.quantity = quantity;
    cart.updatedAt = new Date();
    await cart.save();

    res.json({ success: true, message: "Cart updated", cart });
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Remove item from cart
app.delete("/api/customer/cart/:itemId", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ success: false, message: "Not logged in" });
    }

    const { itemId } = req.params;

    const cart = await Cart.findOne({ userId: req.session.user.id });
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found in cart" });
    }

    // Return stock to product
    const product = await Product.findById(item.productId);
    if (product) {
      product.stockQuantity += item.quantity;
      product.inStock = true;
      await product.save();
    }

    item.deleteOne();
    cart.updatedAt = new Date();
    await cart.save();

    res.json({ success: true, message: "Item removed from cart", cart });
  } catch (error) {
    console.error("Error removing from cart:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Customer - Get all saved addresses
app.get("/api/customer/addresses", async (req, res) => {
  try {
    console.log("=== Fetch Addresses Request ===");
    console.log("Session user:", req.session.user);

    if (!req.session.user || req.session.user.role !== "customer") {
      console.log("Unauthorized - no session or not customer");
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const user = await User.findById(req.session.user.id).select("addresses");
    console.log("User found:", user ? "Yes" : "No");
    console.log("User addresses:", user?.addresses);

    res.json({ success: true, addresses: user.addresses || [] });
  } catch (error) {
    console.error("Error fetching addresses:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Customer - Add new address
app.post("/api/customer/addresses", async (req, res) => {
  try {
    console.log("=== Add Address Request ===");
    console.log("Session user:", req.session.user);
    console.log("Request body:", req.body);

    if (!req.session.user || req.session.user.role !== "customer") {
      console.log("Unauthorized - no session or not customer");
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const { street, city, state, pincode, isDefault } = req.body;
    const user = await User.findById(req.session.user.id);

    if (!user) {
      console.log("User not found:", req.session.user.id);
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    console.log("Current user addresses:", user.addresses);

    // If this is set as default, unset all other defaults
    if (isDefault) {
      user.addresses.forEach((addr) => (addr.isDefault = false));
    }

    user.addresses.push({ street, city, state, pincode, isDefault });
    await user.save();

    console.log("Address saved. New addresses array:", user.addresses);

    res.json({
      success: true,
      message: "Address added successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("Error adding address:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
});

// Customer - Update address
app.put("/api/customer/addresses/:id", async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== "customer") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const { street, city, state, pincode, isDefault } = req.body;
    const user = await User.findById(req.session.user.id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const address = user.addresses.id(req.params.id);
    if (!address) {
      return res
        .status(404)
        .json({ success: false, message: "Address not found" });
    }

    // If this is set as default, unset all other defaults
    if (isDefault) {
      user.addresses.forEach((addr) => (addr.isDefault = false));
    }

    address.street = street;
    address.city = city;
    address.state = state;
    address.pincode = pincode;
    address.isDefault = isDefault;

    await user.save();

    res.json({
      success: true,
      message: "Address updated successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("Error updating address:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Customer - Delete address
app.delete("/api/customer/addresses/:id", async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== "customer") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const user = await User.findById(req.session.user.id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const address = user.addresses.id(req.params.id);
    if (!address) {
      return res
        .status(404)
        .json({ success: false, message: "Address not found" });
    }

    address.deleteOne();
    await user.save();

    res.json({
      success: true,
      message: "Address deleted successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("Error deleting address:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Update customer profile (e.g., contact number)
app.put("/api/customer/profile", async (req, res) => {
  try {
    console.log("=== Update Profile Request ===");
    console.log("Session user:", req.session.user);
    console.log("Request body:", req.body);

    if (!req.session.user) {
      return res.status(401).json({ success: false, message: "Not logged in" });
    }

    if (req.session.user.role !== "customer") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await User.findById(req.session.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Update contact number if provided
    if (req.body.contactNumber) {
      user.contactNumber = req.body.contactNumber;
    }

    // Save user profile changes
    await user.save();

    // Update session with new data
    req.session.user.contactNumber = user.contactNumber;

    console.log("User profile updated successfully");

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        contactNumber: user.contactNumber,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// Process checkout and create order
app.post("/customer/api/process-checkout", async (req, res) => {
  try {
    console.log("=== Process Checkout Request ===");
    console.log("Session user:", req.session.user);
    console.log("Request body:", req.body);

    if (!req.session.user) {
      return res.status(401).json({ success: false, message: "Not logged in" });
    }

    if (req.session.user.role !== "customer") {
      return res.status(403).json({
        success: false,
        message: "Only customers can place orders",
      });
    }

    const {
      name,
      email,
      phone,
      alternativePhone,
      deliveryAddress,
      city,
      state,
      pincode,
      saveAddress, // New field to check if user wants to save address
      paymentMethod, // Payment method: card, upi, netbanking, cod
      paymentStatus, // Payment status: pending, completed, failed
    } = req.body;

    // Get user for updating profile
    const user = await User.findById(req.session.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Update phone number if provided
    if (phone && phone !== user.contactNumber) {
      user.contactNumber = phone;
      console.log("Updating phone number:", phone);
    }

    // Save address if checkbox was checked
    if (saveAddress === true || saveAddress === "true") {
      const addressData = {
        street: deliveryAddress,
        city: city,
        state: state,
        pincode: pincode,
        isDefault: user.addresses.length === 0, // Make first address default
      };

      // Check if this exact address already exists
      const addressExists = user.addresses.some(
        (addr) =>
          addr.street === deliveryAddress &&
          addr.city === city &&
          addr.state === state &&
          addr.pincode === pincode
      );

      if (!addressExists) {
        user.addresses.push(addressData);
        console.log("Saving new address to user profile");
      } else {
        console.log("Address already exists in user profile");
      }
    }

    // Save user profile changes
    await user.save();
    console.log("User profile updated successfully");

    // Get user's cart
    const cart = await Cart.findOne({ userId: req.session.user.id })
      .populate("items.productId")
      .populate("items.designId");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    // Calculate total and prepare order items
    let subtotal = 0;
    const orderItems = [];

    for (const item of cart.items) {
      let price = 0;

      if (item.productId) {
        price = item.productId.price;

        // Check stock availability
        const product = await Product.findById(item.productId._id);
        if (!product) {
          return res.status(400).json({
            success: false,
            message: `Product ${item.productId.name} not found`,
          });
        }

        if (product.stockQuantity < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for ${product.name}. Only ${product.stockQuantity} available.`,
          });
        }

        // Decrease stock quantity
        product.stockQuantity -= item.quantity;

        // Update inStock flag if out of stock
        if (product.stockQuantity <= 0) {
          product.inStock = false;
        }

        await product.save();
        console.log(
          `Stock updated for ${product.name}: ${product.stockQuantity} remaining`
        );
      } else if (item.designId) {
        price = item.designId.basePrice || item.designId.estimatedPrice || 500;
      }

      subtotal += price * item.quantity;

      orderItems.push({
        productId: item.productId?._id || null,
        designId: item.designId?._id || null,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        price: price,
      });
    }

    const tax = subtotal * 0.18;
    const shipping = 100;
    const totalAmount = subtotal + tax + shipping;

    // Create order
    const order = new Order({
      userId: req.session.user.id,
      items: orderItems,
      totalAmount: totalAmount,
      status: "pending",
      paymentMethod: paymentMethod || "card", // Use provided payment method or default to card
      paymentStatus: paymentStatus || "completed", // Use provided status or default to completed
      shippingAddress: {
        name: name,
        email: email,
        phone: phone,
        alternativePhone: alternativePhone,
        street: deliveryAddress,
        city: city,
        state: state,
        zipCode: pincode,
        country: "India",
      },
      timeline: [
        {
          status: "pending",
          note: "Order placed by customer",
          at: new Date(),
        },
      ],
    });

    await order.save();
    console.log("Order created:", order._id);

    // Auto-assign to first available manager
    const manager = await User.findOne({ role: "manager" });
    if (manager) {
      order.managerId = manager._id;
      order.status = "assigned_to_manager";
      order.managerAssignedAt = new Date();
      order.timeline.push({
        status: "assigned_to_manager",
        note: `Order automatically assigned to manager ${manager.name}`,
        at: new Date(),
      });
      await order.save();

      // Notify manager
      await Notification.create({
        userId: manager._id,
        orderId: order._id,
        message: `New order #${order._id
          .toString()
          .substring(0, 8)} assigned to you`,
        type: "info",
      });
    }

    // Create notification for customer
    await Notification.create({
      userId: req.session.user.id,
      orderId: order._id,
      message: `Order #${order._id
        .toString()
        .substring(0, 8)} placed successfully`,
      type: "success",
    });

    // Clear the cart
    cart.items = [];
    await cart.save();

    res.json({
      success: true,
      message: "Order placed successfully",
      orderId: order._id,
      order: order,
    });
  } catch (error) {
    console.error("Error processing checkout:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process checkout",
      error: error.message,
    });
  }
});

// ============================================
// ENHANCED WORKFLOW ENDPOINTS
// ============================================

// Manager - Assign CUSTOM order to designer
app.post("/manager/api/order/:id/assign-designer", async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== "manager") {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized - Manager only" });
    }

    const { designerId } = req.body;
    const order = await Order.findById(req.params.id).populate(
      "userId",
      "name email"
    );

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Check if it's a custom order
    const isCustom = await order.isCustomOrder();
    if (!isCustom) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot assign designer to shop orders. Use assign-delivery instead.",
      });
    }

    // Verify designer exists
    const designer = await User.findOne({ _id: designerId, role: "designer" });
    if (!designer) {
      return res
        .status(404)
        .json({ success: false, message: "Designer not found" });
    }

    // Update order
    order.designerId = designerId;
    order.status = "assigned_to_designer";
    order.designerAssignedAt = new Date();
    order.timeline.push({
      status: "assigned_to_designer",
      note: `Assigned to designer ${designer.name || designer.email}`,
      at: new Date(),
    });
    await order.save();

    // Notify designer
    await Notification.create({
      userId: designerId,
      orderId: order._id,
      message: `New custom design order #${order._id
        .toString()
        .substring(0, 8)} assigned to you by manager`,
      type: "info",
    });

    // Notify customer
    await Notification.create({
      userId: order.userId._id,
      orderId: order._id,
      message: `Your custom order has been assigned to a designer`,
      type: "info",
    });

    res.json({
      success: true,
      message: "Order assigned to designer successfully",
      order: await Order.findById(order._id)
        .populate("userId", "name email")
        .populate("designerId", "name email")
        .populate("managerId", "name email"),
    });
  } catch (error) {
    console.error("Error assigning designer:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
});

// Manager - Assign order to delivery (for SHOP orders or completed CUSTOM orders)
app.post("/manager/api/order/:id/assign-delivery", async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== "manager") {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized - Manager only" });
    }

    const { deliveryPersonId } = req.body;
    const order = await Order.findById(req.params.id).populate(
      "userId",
      "name email"
    );

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Verify delivery person exists
    const deliveryPerson = await User.findOne({
      _id: deliveryPersonId,
      role: "delivery",
    });
    if (!deliveryPerson) {
      return res
        .status(404)
        .json({ success: false, message: "Delivery person not found" });
    }

    const isCustom = await order.isCustomOrder();

    // For custom orders, ensure production is completed
    if (isCustom && order.status !== "production_completed") {
      return res.status(400).json({
        success: false,
        message:
          "Custom orders can only be assigned to delivery after production is completed",
      });
    }

    // Update order
    order.deliveryPersonId = deliveryPersonId;
    order.status = "ready_for_pickup"; // Changed from ready_for_delivery to match delivery flow
    order.deliveryAssignedAt = new Date();
    order.timeline.push({
      status: "ready_for_pickup",
      note: `Assigned to delivery person ${
        deliveryPerson.name || deliveryPerson.email
      }`,
      at: new Date(),
    });
    await order.save();

    // Notify delivery person
    await Notification.create({
      userId: deliveryPersonId,
      orderId: order._id,
      message: `Order #${order._id
        .toString()
        .substring(0, 8)} assigned to you for delivery`,
      type: "info",
    });

    // Notify customer
    await Notification.create({
      userId: order.userId._id,
      orderId: order._id,
      message: `Your order is ready for delivery`,
      type: "info",
    });

    res.json({
      success: true,
      message: "Order assigned to delivery person successfully",
      order: await Order.findById(order._id)
        .populate("userId", "name email")
        .populate("designerId", "name email")
        .populate("managerId", "name email")
        .populate("deliveryPersonId", "name email"),
    });
  } catch (error) {
    console.error("Error assigning delivery:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
});

// Designer - Accept assigned order
app.post("/designer/api/order/:id/accept", async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== "designer") {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized - Designer only" });
    }

    const order = await Order.findById(req.params.id)
      .populate("userId", "name email")
      .populate("managerId", "name email");

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (order.designerId?.toString() !== req.session.user.id) {
      return res
        .status(403)
        .json({ success: false, message: "This order is not assigned to you" });
    }

    if (order.status !== "assigned_to_designer") {
      return res.status(400).json({
        success: false,
        message: "Order cannot be accepted at this stage",
      });
    }

    // Update order
    order.status = "designer_accepted";
    order.designerAcceptedAt = new Date();
    order.progressPercentage = 10; // Start with 10%
    order.timeline.push({
      status: "designer_accepted",
      note: "Designer accepted the order",
      at: new Date(),
    });
    await order.save();

    // Notify manager
    if (order.managerId) {
      await Notification.create({
        userId: order.managerId,
        orderId: order._id,
        message: `Designer accepted order #${order._id
          .toString()
          .substring(0, 8)}`,
        type: "success",
      });
    }

    // Notify customer
    await Notification.create({
      userId: order.userId._id,
      orderId: order._id,
      message: `Designer has accepted your custom order and will start working on it`,
      type: "success",
    });

    res.json({
      success: true,
      message: "Order accepted successfully",
      order: await Order.findById(order._id)
        .populate("userId", "name email")
        .populate("designerId", "name email")
        .populate("managerId", "name email"),
    });
  } catch (error) {
    console.error("Error accepting order:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
});

// Designer - Start production
app.post("/designer/api/order/:id/start-production", async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== "designer") {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized - Designer only" });
    }

    const order = await Order.findById(req.params.id).populate(
      "userId",
      "name email"
    );

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (order.designerId?.toString() !== req.session.user.id) {
      return res
        .status(403)
        .json({ success: false, message: "This order is not assigned to you" });
    }

    // Update order
    order.status = "in_production";
    order.progressPercentage = 30; // 30% when production starts
    order.timeline.push({
      status: "in_production",
      note: "Designer started production",
      at: new Date(),
    });
    await order.save();

    // Notify customer
    await Notification.create({
      userId: order.userId._id,
      orderId: order._id,
      message: `Designer has started working on your order`,
      type: "info",
    });

    res.json({
      success: true,
      message: "Production started",
      order: await Order.findById(order._id)
        .populate("userId", "name email")
        .populate("designerId", "name email"),
    });
  } catch (error) {
    console.error("Error starting production:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
});

// Designer - Update production progress
app.put("/designer/api/order/:id/progress", async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== "designer") {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized - Designer only" });
    }

    const { progressPercentage, note } = req.body;
    const order = await Order.findById(req.params.id).populate(
      "userId",
      "name email"
    );

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (order.designerId?.toString() !== req.session.user.id) {
      return res
        .status(403)
        .json({ success: false, message: "This order is not assigned to you" });
    }

    // Update progress
    order.progressPercentage = progressPercentage;
    if (note) {
      order.timeline.push({
        status: order.status,
        note: note,
        at: new Date(),
      });
    }
    await order.save();

    // Notify customer on milestone progress (every 25%)
    if (progressPercentage % 25 === 0 && progressPercentage > 0) {
      await Notification.create({
        userId: order.userId._id,
        orderId: order._id,
        message: `Your order is ${progressPercentage}% complete`,
        type: "info",
      });
    }

    res.json({
      success: true,
      message: "Progress updated",
      order,
    });
  } catch (error) {
    console.error("Error updating progress:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
});

// Designer - Complete production and send back to manager
app.post("/designer/api/order/:id/complete", async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== "designer") {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized - Designer only" });
    }

    const { notes } = req.body;
    const order = await Order.findById(req.params.id)
      .populate("userId", "name email")
      .populate("managerId", "name email");

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (order.designerId?.toString() !== req.session.user.id) {
      return res
        .status(403)
        .json({ success: false, message: "This order is not assigned to you" });
    }

    // Update order
    order.status = "production_completed";
    order.progressPercentage = 100;
    order.productionCompletedAt = new Date();
    order.timeline.push({
      status: "production_completed",
      note: notes || "Production completed by designer",
      at: new Date(),
    });
    await order.save();

    // Notify manager
    if (order.managerId) {
      await Notification.create({
        userId: order.managerId,
        orderId: order._id,
        message: `Order #${order._id
          .toString()
          .substring(
            0,
            8
          )} production completed - Ready to assign for delivery`,
        type: "success",
      });
    }

    // Notify customer
    await Notification.create({
      userId: order.userId._id,
      orderId: order._id,
      message: `Your custom order is ready! Waiting for delivery assignment`,
      type: "success",
    });

    res.json({
      success: true,
      message:
        "Production completed successfully. Order sent back to manager for delivery assignment.",
      order: await Order.findById(order._id)
        .populate("userId", "name email")
        .populate("designerId", "name email")
        .populate("managerId", "name email"),
    });
  } catch (error) {
    console.error("Error completing production:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
});

// REMOVED - DUPLICATE ROUTE - See line ~4400 for correct implementation

// REMOVED - DUPLICATE ROUTE - See line ~4583 for correct OTP-based implementation

// Customer - Get order tracking with complete timeline
app.get("/customer/api/order/:id/tracking", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ success: false, message: "Not logged in" });
    }

    const order = await Order.findById(req.params.id)
      .populate("userId", "name email")
      .populate("managerId", "name email")
      .populate("designerId", "name email")
      .populate("deliveryPersonId", "name email")
      .populate("items.productId")
      .populate("items.designId");

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Only customer or staff can view tracking
    const isOwner = order.userId._id.toString() === req.session.user.id;
    const isStaff = ["admin", "manager", "designer", "delivery"].includes(
      req.session.user.role
    );

    if (!isOwner && !isStaff) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const isCustom = await order.isCustomOrder();

    // Build tracking info
    const tracking = {
      orderId: order._id,
      orderNumber: order._id.toString().substring(0, 8),
      orderType: isCustom ? "Custom Design" : "Shop Order",
      currentStatus: order.status,
      progressPercentage: order.progressPercentage || 0,
      timeline: order.timeline,
      assignedPersonnel: {
        manager: order.managerId
          ? { name: order.managerId.name, email: order.managerId.email }
          : null,
        designer: order.designerId
          ? { name: order.designerId.name, email: order.designerId.email }
          : null,
        delivery: order.deliveryPersonId
          ? {
              name: order.deliveryPersonId.name,
              email: order.deliveryPersonId.email,
            }
          : null,
      },
      timestamps: {
        orderPlaced: order.createdAt,
        managerAssigned: order.managerAssignedAt,
        designerAssigned: order.designerAssignedAt,
        designerAccepted: order.designerAcceptedAt,
        productionCompleted: order.productionCompletedAt,
        deliveryAssigned: order.deliveryAssignedAt,
      },
      items: order.items,
      shippingAddress: order.shippingAddress,
      totalAmount: order.totalAmount,
    };

    res.json({ success: true, tracking, order });
  } catch (error) {
    console.error("Error fetching tracking:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
});

// Get all delivery persons (for manager to assign)
app.get("/manager/api/delivery-persons", async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== "manager") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const deliveryPersons = await User.find({ role: "delivery" }).select(
      "name email contactNumber"
    );

    res.json({ success: true, deliveryPersons });
  } catch (error) {
    console.error("Error fetching delivery persons:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get all designers (for manager to assign)
app.get("/manager/api/designers", async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== "manager") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const designers = await User.find({ role: "designer" }).select(
      "name email contactNumber"
    );

    res.json({ success: true, designers });
  } catch (error) {
    console.error("Error fetching designers:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Manager - Get all products with stock info
app.get("/manager/api/products", async (req, res) => {
  try {
    console.log("=== Manager Products Request ===");
    console.log("Session user:", req.session.user);

    if (!req.session.user || req.session.user.role !== "manager") {
      console.log("❌ Unauthorized: User is not a manager");
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const products = await Product.find({})
      .select("name category price stockQuantity inStock images")
      .sort({ name: 1 })
      .lean();

    console.log(`✅ Found ${products.length} products`);
    res.json({ success: true, products });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Manager - Update product stock
app.put("/manager/api/product/:id/stock", async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== "manager") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const { stockQuantity, inStock } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    product.stockQuantity = stockQuantity;
    product.inStock = inStock !== undefined ? inStock : stockQuantity > 0;
    await product.save();

    res.json({
      success: true,
      message: "Stock updated successfully",
      product,
    });
  } catch (error) {
    console.error("Error updating stock:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Manager - Create new product
app.post("/manager/api/product", async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== "manager") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const {
      name,
      description,
      category,
      gender,
      price,
      stockQuantity,
      sizes,
      colors,
      patterns,
      fabrics,
      images,
      featured,
      customizable,
      modelPath,
    } = req.body;

    const product = new Product({
      name,
      description,
      category,
      gender,
      price,
      stockQuantity: stockQuantity || 0,
      inStock: stockQuantity > 0,
      sizes: sizes || [],
      colors: colors || [],
      patterns: patterns || [],
      fabrics: fabrics || [],
      images: images || [],
      featured: featured || false,
      customizable: customizable || false,
      modelPath: modelPath || "",
    });

    await product.save();

    res.json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Manager - Delete product
app.delete("/manager/api/product/:id", async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== "manager") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Admin - Get all users by role
app.get("/admin/api/users", async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const { role } = req.query;

    let query = {};
    if (role && role !== "all") {
      query.role = role;
    }

    const users = await User.find(query)
      .select("name username email role contactNumber createdAt")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Admin - Get all products with stock
app.get("/admin/api/products", async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const products = await Product.find({})
      .select("name category price stockQuantity inStock images gender")
      .sort({ name: 1 })
      .lean();

    res.json({ success: true, products });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Admin - Get user statistics
app.get("/admin/api/user-stats", async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const customers = await User.countDocuments({ role: "customer" });
    const managers = await User.countDocuments({ role: "manager" });
    const designers = await User.countDocuments({ role: "designer" });
    const delivery = await User.countDocuments({ role: "delivery" });

    res.json({
      success: true,
      stats: {
        customers,
        managers,
        designers,
        delivery,
        total: customers + managers + designers + delivery,
      },
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ============================================
// REAL-WORLD DELIVERY PARTNER SYSTEM
// ============================================

// Initialize default delivery partners (like Ekart, Delhivery)
const initializeDeliveryPartners = async () => {
  const partners = [
    {
      name: "DesignDen Express",
      code: "DDE",
      logo: "/images/delivery/dde-logo.png",
      contactNumber: "+91-1800-123-4567",
      email: "support@designdenexpress.com",
      avgDeliveryDays: 3,
      rating: 4.7,
      serviceablePincodes: ["560001", "560002", "560003", "560004", "560005"],
    },
    {
      name: "Swift Logistics",
      code: "SWL",
      logo: "/images/delivery/swift-logo.png",
      contactNumber: "+91-1800-765-4321",
      email: "care@swiftlogistics.in",
      avgDeliveryDays: 4,
      rating: 4.5,
      serviceablePincodes: ["560001", "560002", "560006", "560007", "560008"],
    },
    {
      name: "FastTrack Delivery",
      code: "FTD",
      logo: "/images/delivery/fasttrack-logo.png",
      contactNumber: "+91-1800-999-8888",
      email: "hello@fasttrackdelivery.com",
      avgDeliveryDays: 2,
      rating: 4.8,
      serviceablePincodes: [
        "560001",
        "560002",
        "560003",
        "560004",
        "560005",
        "560006",
        "560007",
        "560008",
        "560009",
        "560010",
      ],
    },
  ];

  for (const partner of partners) {
    await DeliveryPartner.findOneAndUpdate({ code: partner.code }, partner, {
      upsert: true,
      new: true,
    });
  }
  console.log("Delivery partners initialized");
};

// Call on server start
setTimeout(initializeDeliveryPartners, 2000);

// Get available delivery partners
app.get("/api/delivery-partners", async (req, res) => {
  try {
    const { pincode } = req.query;
    let query = { isActive: true };

    if (pincode) {
      query.serviceablePincodes = pincode;
    }

    const partners = await DeliveryPartner.find(query);
    res.json({ success: true, partners });
  } catch (error) {
    console.error("Error fetching delivery partners:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Generate tracking number
const generateTrackingNumber = (partnerCode) => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${partnerCode}${timestamp}${random}`;
};

// Generate OTP for delivery verification
const generateDeliveryOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// Manager - Assign delivery partner and generate tracking (Flipkart-like)
app.post("/manager/api/order/:id/ship", async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== "manager") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const { deliveryPersonId, deliveryPartnerId, deliverySlot } = req.body;
    const order = await Order.findById(req.params.id).populate(
      "userId",
      "name email phone"
    );

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Get delivery partner
    let partner = null;
    if (deliveryPartnerId) {
      partner = await DeliveryPartner.findById(deliveryPartnerId);
    } else {
      // Auto-select best partner based on pincode and rating
      partner = await DeliveryPartner.findOne({
        isActive: true,
        serviceablePincodes: order.shippingAddress.zipCode,
      }).sort({ rating: -1 });
    }

    if (!partner) {
      // Fallback to default partner
      partner = await DeliveryPartner.findOne({ isActive: true }).sort({
        rating: -1,
      });
    }

    // Verify delivery person
    const deliveryPerson = await User.findOne({
      _id: deliveryPersonId,
      role: "delivery",
    });
    if (!deliveryPerson) {
      return res
        .status(404)
        .json({ success: false, message: "Delivery person not found" });
    }

    // Generate tracking details
    const trackingNumber = generateTrackingNumber(partner?.code || "DD");
    const otp = generateDeliveryOTP();

    // Calculate estimated delivery
    const today = new Date();
    const deliveryDays = partner?.avgDeliveryDays || 3;
    const estimatedFrom = new Date(
      today.setDate(today.getDate() + deliveryDays - 1)
    );
    const estimatedTo = new Date(today.setDate(today.getDate() + 2));

    // Update order
    order.deliveryPersonId = deliveryPersonId;
    order.status = "ready_for_pickup";
    order.deliveryAssignedAt = new Date();

    order.deliveryPartner = {
      partnerId: partner?._id,
      partnerName: partner?.name || "DesignDen Express",
      trackingNumber: trackingNumber,
      trackingUrl: `https://track.designden.com/${trackingNumber}`,
      awbNumber: `AWB${trackingNumber}`,
    };

    if (deliverySlot) {
      order.deliverySlot = deliverySlot;
    }

    order.estimatedDelivery = {
      from: estimatedFrom,
      to: estimatedTo,
    };

    order.deliveryOTP = {
      code: otp,
      generatedAt: new Date(),
      verified: false,
    };

    order.timeline.push({
      status: "ready_for_pickup",
      note: `Order assigned to ${
        partner?.name || "DesignDen Express"
      } for delivery. Tracking: ${trackingNumber}`,
      by: req.session.user.id,
      byRole: "manager",
      at: new Date(),
    });

    await order.save();

    // Send notifications
    await Notification.create({
      userId: deliveryPersonId,
      orderId: order._id,
      message: `New pickup assigned - Order #${
        order.orderNumber || order._id.toString().substring(0, 8)
      }. Track: ${trackingNumber}`,
      type: "info",
    });

    await Notification.create({
      userId: order.userId._id,
      orderId: order._id,
      message: `Your order has been shipped! Tracking ID: ${trackingNumber}. Delivery OTP: ${otp}`,
      type: "success",
    });

    res.json({
      success: true,
      message: "Order shipped successfully",
      tracking: {
        trackingNumber,
        partnerName: partner?.name,
        estimatedDelivery: order.estimatedDelivery,
        otp: otp,
      },
      order: await Order.findById(order._id)
        .populate("userId", "name email")
        .populate("deliveryPersonId", "name email contactNumber")
        .populate("deliveryPartner.partnerId"),
    });
  } catch (error) {
    console.error("Error shipping order:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
});

// Delivery person - Pick up order
app.post("/delivery/api/order/:id/pickup", async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== "delivery") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const order = await Order.findById(req.params.id).populate(
      "userId",
      "name email phone"
    );

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (order.deliveryPersonId?.toString() !== req.session.user.id) {
      return res
        .status(403)
        .json({ success: false, message: "This order is not assigned to you" });
    }

    if (order.status !== "ready_for_pickup") {
      return res
        .status(400)
        .json({ success: false, message: "Order is not ready for pickup" });
    }

    order.status = "picked_up";
    order.pickedUpAt = new Date();
    order.liveTracking = {
      isActive: true,
      currentLocation: {
        address: "DesignDen Warehouse, Bangalore",
        updatedAt: new Date(),
      },
    };

    order.timeline.push({
      status: "picked_up",
      note: "Package picked up from warehouse",
      location: "DesignDen Warehouse",
      by: req.session.user.id,
      byRole: "delivery",
      at: new Date(),
    });

    await order.save();

    await Notification.create({
      userId: order.userId._id,
      orderId: order._id,
      message: `Your order has been picked up and is on the way!`,
      type: "info",
    });

    res.json({
      success: true,
      message: "Order picked up successfully",
      order,
    });
  } catch (error) {
    console.error("Error picking up order:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Delivery person - Update location (simulated GPS tracking)
app.put("/delivery/api/order/:id/location", async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== "delivery") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const { lat, lng, address } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order || order.deliveryPersonId?.toString() !== req.session.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    order.liveTracking = {
      isActive: true,
      currentLocation: {
        lat,
        lng,
        address,
        updatedAt: new Date(),
      },
      deliveryPersonLocation: {
        lat,
        lng,
        updatedAt: new Date(),
      },
    };

    await order.save();

    res.json({ success: true, message: "Location updated" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Delivery person - Mark in transit
app.post("/delivery/api/order/:id/in-transit", async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== "delivery") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const { location } = req.body;
    const order = await Order.findById(req.params.id).populate(
      "userId",
      "name email"
    );

    if (!order || order.deliveryPersonId?.toString() !== req.session.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    order.status = "in_transit";
    order.timeline.push({
      status: "in_transit",
      note: "Package in transit",
      location: location || "In Transit Hub",
      by: req.session.user.id,
      byRole: "delivery",
      at: new Date(),
    });

    await order.save();

    res.json({ success: true, message: "Status updated to in transit", order });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Delivery person - Out for delivery
app.post("/delivery/api/order/:id/out-for-delivery", async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== "delivery") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const order = await Order.findById(req.params.id).populate(
      "userId",
      "name email phone"
    );

    if (!order || order.deliveryPersonId?.toString() !== req.session.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    order.status = "out_for_delivery";
    order.timeline.push({
      status: "out_for_delivery",
      note: "Package is out for delivery",
      location: order.shippingAddress.city,
      by: req.session.user.id,
      byRole: "delivery",
      at: new Date(),
    });

    await order.save();

    // Send OTP reminder to customer
    await Notification.create({
      userId: order.userId._id,
      orderId: order._id,
      message: `Your order is out for delivery! Keep your OTP ready: ${order.deliveryOTP?.code}`,
      type: "info",
    });

    res.json({ success: true, message: "Order is out for delivery", order });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Delivery person - Verify OTP and deliver (Flipkart-like)
app.post("/delivery/api/order/:id/deliver", async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== "delivery") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const { otp, receivedBy, relationship, signature, photo, notes } = req.body;
    const order = await Order.findById(req.params.id)
      .populate("userId", "name email")
      .populate("managerId", "name email");

    if (!order || order.deliveryPersonId?.toString() !== req.session.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    // Verify OTP
    if (order.deliveryOTP?.code && otp !== order.deliveryOTP.code) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP. Please enter correct OTP.",
      });
    }

    // Update order
    order.status = "delivered";
    order.deliveredAt = new Date();
    order.actualDelivery = new Date();

    order.deliveryOTP.verified = true;
    order.deliveryOTP.verifiedAt = new Date();

    order.proofOfDelivery = {
      receivedBy: receivedBy || order.shippingAddress.name,
      relationship: relationship || "Self",
      signature: signature,
      photo: photo,
      notes: notes,
    };

    order.liveTracking.isActive = false;

    order.timeline.push({
      status: "delivered",
      note: `Delivered to ${receivedBy || order.shippingAddress.name} (${
        relationship || "Self"
      })`,
      location: order.shippingAddress.city,
      by: req.session.user.id,
      byRole: "delivery",
      at: new Date(),
    });

    await order.save();

    // Notifications
    await Notification.create({
      userId: order.userId._id,
      orderId: order._id,
      message: `Your order has been delivered successfully! Thank you for shopping with DesignDen.`,
      type: "success",
    });

    if (order.managerId) {
      await Notification.create({
        userId: order.managerId,
        orderId: order._id,
        message: `Order #${
          order.orderNumber || order._id.toString().substring(0, 8)
        } delivered successfully`,
        type: "success",
      });
    }

    res.json({
      success: true,
      message: "Order delivered successfully!",
      order: await Order.findById(order._id)
        .populate("userId", "name email")
        .populate("deliveryPersonId", "name email")
        .populate("managerId", "name email"),
    });
  } catch (error) {
    console.error("Error delivering order:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ============================================
// CUSTOMER-DESIGNER CHAT SYSTEM
// ============================================

// Get chat messages for an order
app.get("/api/order/:orderId/messages", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const order = await Order.findById(req.params.orderId);
    if (!order || !order.chatEnabled) {
      return res
        .status(404)
        .json({ success: false, message: "Chat not available" });
    }

    // Check if user is part of this order
    const userId = req.session.user.id;
    const isCustomer = order.userId.toString() === userId;
    const isDesigner = order.designerId?.toString() === userId;
    const isManager = order.managerId?.toString() === userId;

    if (!isCustomer && !isDesigner && !isManager) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized to view this chat" });
    }

    const messages = await Message.find({ orderId: req.params.orderId })
      .populate("senderId", "name email")
      .sort({ createdAt: 1 });

    // Mark messages as read
    await Message.updateMany(
      { orderId: req.params.orderId, receiverId: userId, read: false },
      { read: true, readAt: new Date() }
    );

    res.json({ success: true, messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Send message in order chat
app.post("/api/order/:orderId/messages", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { message, attachments } = req.body;
    const order = await Order.findById(req.params.orderId);

    if (!order || !order.chatEnabled) {
      return res
        .status(404)
        .json({ success: false, message: "Chat not available" });
    }

    const senderId = req.session.user.id;
    const senderRole = req.session.user.role;

    // Determine receiver
    let receiverId, receiverRole;
    if (senderRole === "customer") {
      receiverId = order.designerId;
      receiverRole = "designer";
    } else if (senderRole === "designer") {
      receiverId = order.userId;
      receiverRole = "customer";
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid sender role for chat" });
    }

    if (!receiverId) {
      return res
        .status(400)
        .json({ success: false, message: "No designer assigned yet" });
    }

    const newMessage = new Message({
      orderId: req.params.orderId,
      senderId,
      senderRole,
      receiverId,
      receiverRole,
      message,
      attachments: attachments || [],
    });

    await newMessage.save();
    await newMessage.populate("senderId", "name email");

    // Update unread count
    await Order.findByIdAndUpdate(req.params.orderId, {
      $inc: { unreadMessages: 1 },
    });

    // Notify receiver
    await Notification.create({
      userId: receiverId,
      orderId: order._id,
      message: `New message from ${senderRole}: "${message.substring(
        0,
        50
      )}..."`,
      type: "info",
    });

    res.json({ success: true, message: newMessage });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get unread message count
app.get("/api/order/:orderId/messages/unread", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const count = await Message.countDocuments({
      orderId: req.params.orderId,
      receiverId: req.session.user.id,
      read: false,
    });

    res.json({ success: true, unreadCount: count });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ============================================
// PRODUCTION MILESTONES (Designer Progress Sharing)
// ============================================

// Get milestones for an order
app.get("/api/order/:orderId/milestones", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Check authorization
    const userId = req.session.user.id;
    const isCustomer = order.userId.toString() === userId;
    const isDesigner = order.designerId?.toString() === userId;
    const isManager = order.managerId?.toString() === userId;

    if (
      !isCustomer &&
      !isDesigner &&
      !isManager &&
      req.session.user.role !== "admin"
    ) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const milestones = await ProductionMilestone.find({
      orderId: req.params.orderId,
    })
      .populate("designerId", "name email")
      .sort({ createdAt: 1 });

    res.json({ success: true, milestones });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Designer - Create/Update milestone
app.post("/api/order/:orderId/milestones", async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== "designer") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const { milestone, status, notes, images } = req.body;
    const order = await Order.findById(req.params.orderId).populate(
      "userId",
      "name email"
    );

    if (!order || order.designerId?.toString() !== req.session.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    // Check if milestone already exists
    let existingMilestone = await ProductionMilestone.findOne({
      orderId: req.params.orderId,
      milestone,
    });

    if (existingMilestone) {
      existingMilestone.status = status;
      existingMilestone.notes = notes;
      if (images) existingMilestone.images = images;
      if (status === "completed") existingMilestone.completedAt = new Date();
      await existingMilestone.save();
    } else {
      existingMilestone = new ProductionMilestone({
        orderId: req.params.orderId,
        designerId: req.session.user.id,
        milestone,
        status,
        notes,
        images,
        completedAt: status === "completed" ? new Date() : null,
      });
      await existingMilestone.save();
    }

    // Update order current milestone and calculate progress
    const milestoneOrder = [
      "design_review",
      "fabric_selection",
      "cutting",
      "stitching",
      "embroidery",
      "finishing",
      "quality_check",
      "packaging",
      "ready_for_pickup",
    ];

    const milestoneIndex = milestoneOrder.indexOf(milestone);
    const progress = Math.round(
      ((milestoneIndex + 1) / milestoneOrder.length) * 100
    );

    order.currentMilestone = milestone;
    order.progressPercentage = progress;

    // Add to order milestones array
    const orderMilestoneIndex = order.milestones?.findIndex(
      (m) => m.name === milestone
    );
    if (orderMilestoneIndex > -1) {
      order.milestones[orderMilestoneIndex] = {
        name: milestone,
        status,
        completedAt: status === "completed" ? new Date() : null,
        notes,
      };
    } else {
      order.milestones = order.milestones || [];
      order.milestones.push({
        name: milestone,
        status,
        completedAt: status === "completed" ? new Date() : null,
        notes,
      });
    }

    order.timeline.push({
      status: "production_milestone",
      note: `${milestone.replace(/_/g, " ").toUpperCase()}: ${status}${
        notes ? ` - ${notes}` : ""
      }`,
      by: req.session.user.id,
      byRole: "designer",
      at: new Date(),
    });

    await order.save();

    // Notify customer
    await Notification.create({
      userId: order.userId._id,
      orderId: order._id,
      message: `Progress update: ${milestone.replace(
        /_/g,
        " "
      )} - ${status}. Your order is ${progress}% complete!`,
      type: "info",
    });

    res.json({
      success: true,
      message: "Milestone updated",
      milestone: existingMilestone,
      progress,
    });
  } catch (error) {
    console.error("Error updating milestone:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ============================================
// COMPREHENSIVE ORDER TRACKING (Customer View)
// ============================================

// Get complete order tracking info
app.get("/api/order/:orderId/track", async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate("userId", "name email phone")
      .populate("managerId", "name email contactNumber")
      .populate("designerId", "name email contactNumber")
      .populate("deliveryPersonId", "name email contactNumber")
      .populate("deliveryPartner.partnerId")
      .populate("items.productId", "name images price")
      .populate("items.designId", "name images category estimatedPrice");

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Get milestones for custom orders
    let productionMilestones = [];
    if (order.orderType === "custom") {
      productionMilestones = await ProductionMilestone.find({
        orderId: order._id,
      }).sort({ createdAt: 1 });
    }

    // Get recent messages
    const recentMessages = await Message.find({ orderId: order._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("senderId", "name");

    // Build comprehensive tracking response (flattened for frontend compatibility)
    const trackingInfo = {
      // Flatten order data for component compatibility
      orderId: order._id,
      orderNumber: order.orderNumber || order._id.toString().substring(0, 8),
      orderType: order.orderType === "custom" ? "Custom Design" : "Shop Order",
      currentStatus: order.status,
      progressPercentage: order.progressPercentage || 0,
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,

      // Items
      items: order.items,

      // Shipping info
      shippingAddress: order.shippingAddress,
      deliverySlot: order.deliverySlot,
      estimatedDelivery: order.estimatedDelivery,
      actualDelivery: order.actualDelivery,

      // Delivery partner (3rd party like Ekart)
      deliveryPartner: order.deliveryPartner
        ? {
            name: order.deliveryPartner.partnerName,
            trackingNumber: order.deliveryPartner.trackingNumber,
            trackingUrl: order.deliveryPartner.trackingUrl,
            awbNumber: order.deliveryPartner.awbNumber,
          }
        : null,

      // Assigned personnel
      assignedPersonnel: {
        manager: order.managerId
          ? {
              name: order.managerId.name || order.managerId.username,
              email: order.managerId.email,
            }
          : null,
        designer: order.designerId
          ? {
              name: order.designerId.name || order.designerId.username,
              email: order.designerId.email,
            }
          : null,
        delivery: order.deliveryPersonId
          ? {
              name:
                order.deliveryPersonId.name || order.deliveryPersonId.username,
              phone: order.deliveryPersonId.contactNumber,
              email: order.deliveryPersonId.email,
            }
          : null,
      },

      // Timestamps
      timestamps: {
        orderPlaced: order.createdAt,
        managerAssigned: order.managerAssignedAt,
        designerAssigned: order.designerAssignedAt,
        designerAccepted: order.designerAcceptedAt,
        productionCompleted: order.productionCompletedAt,
        deliveryAssigned: order.deliveryAssignedAt,
      },

      // OTP for delivery verification (CUSTOMER SEES THIS!)
      otp:
        order.deliveryOTP?.code &&
        ["out_for_delivery", "picked_up", "in_transit"].includes(order.status)
          ? order.deliveryOTP.code
          : null,

      // Live tracking
      liveTracking: order.liveTracking?.isActive ? order.liveTracking : null,

      // Production milestones (for custom orders)
      production:
        order.orderType === "custom"
          ? {
              designer: order.designerId
                ? {
                    name: order.designerId.name || order.designerId.username,
                  }
                : null,
              progress: order.progressPercentage,
              currentMilestone: order.currentMilestone,
              milestones: productionMilestones.map((m) => ({
                name: m.milestone,
                status: m.status,
                notes: m.notes,
                images: m.images,
                completedAt: m.completedAt,
              })),
            }
          : null,

      // Timeline
      timeline: order.timeline.map((t) => ({
        status: t.status,
        note: t.note,
        location: t.location,
        at: t.at,
        by: t.by,
        byRole: t.byRole,
      })),

      // Chat
      chat: {
        enabled: order.chatEnabled,
        unreadMessages: order.unreadMessages,
        recentMessages: recentMessages.map((m) => ({
          from: m.senderId?.name,
          message: m.message.substring(0, 100),
          at: m.createdAt,
        })),
      },

      // Proof of delivery
      proofOfDelivery:
        order.status === "delivered" ? order.proofOfDelivery : null,
    };

    res.json({ success: true, tracking: trackingInfo });
  } catch (error) {
    console.error("Error fetching tracking info:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ============================================
// DELIVERY PERSON DASHBOARD ENDPOINTS
// ============================================

// Get delivery person's orders
app.get("/delivery/api/orders", async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== "delivery") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const orders = await Order.find({
      deliveryPersonId: req.session.user.id,
    })
      .populate("userId", "name email phone")
      .populate("items.productId", "name images price")
      .populate("items.designId", "name category estimatedPrice")
      .sort({ createdAt: -1 });

    // SECURITY: Remove OTP code from response - delivery person should NOT see the OTP
    // They need to ask the customer for the OTP and enter it for verification
    const sanitizedOrders = orders.map((order) => {
      const orderObj = order.toObject();
      if (orderObj.deliveryOTP) {
        // Keep the hash for verification but remove the actual code
        orderObj.deliveryOTP = {
          hash: orderObj.deliveryOTP.hash,
          generatedAt: orderObj.deliveryOTP.generatedAt,
          verified: orderObj.deliveryOTP.verified,
          // code is intentionally NOT included
        };
      }
      return orderObj;
    });

    res.json({ success: true, orders: sanitizedOrders });
  } catch (error) {
    console.error("Error fetching delivery orders:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get delivery statistics
app.get("/delivery/api/statistics", async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== "delivery") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const deliveryPersonId = req.session.user.id;

    const stats = await Order.aggregate([
      {
        $match: {
          deliveryPersonId: new mongoose.Types.ObjectId(deliveryPersonId),
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ["$status", "ready_for_pickup"] }, 1, 0] },
          },
          pickedUp: {
            $sum: { $cond: [{ $eq: ["$status", "picked_up"] }, 1, 0] },
          },
          inTransit: {
            $sum: { $cond: [{ $eq: ["$status", "in_transit"] }, 1, 0] },
          },
          outForDelivery: {
            $sum: { $cond: [{ $eq: ["$status", "out_for_delivery"] }, 1, 0] },
          },
          delivered: {
            $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] },
          },
        },
      },
    ]);

    res.json({
      success: true,
      statistics: stats[0] || {
        total: 0,
        pending: 0,
        pickedUp: 0,
        inTransit: 0,
        outForDelivery: 0,
        delivered: 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
