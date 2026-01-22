import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { customerAPI, pincodeAPI } from "../../services/api";
import { formatPrice } from "../../utils/currency";
import {
  validateIndianPhoneNumber,
  validateIndianPincode,
} from "../../utils/validation";
import { useFlash } from "../../context/FlashContext";
import PaymentModal from "../../components/PaymentModal";
import DesignerSelection from "../../components/DesignerSelection";
import useExitConfirmation from "../../hooks/useExitConfirmation";

const Checkout = () => {
  const navigate = useNavigate();
  const { cart } = useCart();
  const { user, updateUser } = useAuth();
  const { showFlash } = useFlash();

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [saveAddress, setSaveAddress] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.username || "",
    email: user?.email || "",
    phone: user?.contactNumber || "",
    alternativePhone: "",
    deliveryAddress: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [lookingUpPincode, setLookingUpPincode] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Designer selection for custom orders
  const [selectedDesigner, setSelectedDesigner] = useState(null);
  const [showDesignerSelection, setShowDesignerSelection] = useState(false);

  // Show exit confirmation during checkout (payment in progress)
  useExitConfirmation(
    showPaymentModal,
    "Payment is in progress. Are you sure you want to leave?",
  );

  // Check if cart has custom designs (orders that need a designer)
  const hasCustomDesigns = cart?.items?.some(
    (item) => item.designId && !item.productId,
  );

  useEffect(() => {
    if (!cart?.items || cart.items.length === 0) {
      showFlash("Your cart is empty", "error");
      navigate("/customer/cart");
      return;
    }
    fetchSavedAddresses();

    // Check if cart items already have a designer assigned
    const checkDesignerInCart = async () => {
      if (hasCustomDesigns && cart.items) {
        console.log("=== CHECKING DESIGNER IN CART ===");
        console.log("Cart items:", cart.items);
        console.log("Has custom designs:", hasCustomDesigns);

        // Check if any design already has a designer
        for (const item of cart.items) {
          if (item.designId) {
            console.log("Processing cart item:", item);
            try {
              // item.designId is already populated as an object from the backend
              const design =
                typeof item.designId === "object" ? item.designId : null;

              console.log("Design object:", design);
              console.log("Designer ID in design:", design?.designerId);
              console.log("Type of designerId:", typeof design?.designerId);

              if (design?.designerId) {
                // designerId could be either an object (populated) or just an ID string
                const designerIdToFetch =
                  typeof design.designerId === "object"
                    ? design.designerId._id
                    : design.designerId;

                console.log("Designer ID to fetch:", designerIdToFetch);

                // Fetch designer info
                try {
                  const designerResponse = await axios.get(
                    `${import.meta.env.VITE_API_URL}/api/marketplace/designers/${designerIdToFetch}`,
                    { withCredentials: true },
                  );
                  console.log("Designer response:", designerResponse.data);

                  if (designerResponse.data.success) {
                    setSelectedDesigner(designerResponse.data.designer);
                    setShowDesignerSelection(false);
                    console.log(
                      "✅ Designer set successfully, hiding selection",
                    );
                    console.log("=================================");
                    return;
                  } else {
                    console.log(
                      "❌ Designer fetch failed:",
                      designerResponse.data.message,
                    );
                  }
                } catch (designerError) {
                  console.error(
                    "❌ Error fetching designer info:",
                    designerError,
                  );
                  console.error("Designer ID that failed:", designerIdToFetch);
                  if (designerError.response) {
                    console.error(
                      "Error response:",
                      designerError.response.status,
                      designerError.response.data,
                    );
                  }
                  // Continue to show designer selection if fetch fails
                }
              } else {
                console.log("❌ No designer ID in design");
              }
            } catch (error) {
              console.error("Error checking designer:", error);
            }
          }
        }
        // No designer found, show selection
        console.log("❌ No designer found in any cart item, showing selection");
        console.log("=================================");
        setShowDesignerSelection(true);
      }
    };

    checkDesignerInCart();

    // Auto-enable phone editing if user doesn't have a contact number
    if (!user?.contactNumber) {
      setIsEditingPhone(true);
    }
  }, [cart, hasCustomDesigns]);

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.username || prev.name,
        email: user.email || prev.email,
        phone: user.contactNumber || prev.phone,
      }));
    }
  }, [user]);

  const fetchSavedAddresses = async () => {
    try {
      const response = await customerAPI.getAddresses();
      console.log("Fetched addresses:", response.data);
      setSavedAddresses(response.data.addresses || []);

      // Auto-select default address if exists
      const defaultAddr = response.data.addresses?.find(
        (addr) => addr.isDefault,
      );
      if (defaultAddr) {
        console.log("Auto-selecting default address:", defaultAddr);
        handleSelectAddress(defaultAddr._id);
      } else if (
        response.data.addresses &&
        response.data.addresses.length > 0
      ) {
        // If no default, select the first address
        console.log(
          "Auto-selecting first address:",
          response.data.addresses[0],
        );
        handleSelectAddress(response.data.addresses[0]._id);
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  };

  // Handle designer selection for custom orders
  const handleDesignerSelect = (designer) => {
    setSelectedDesigner(designer);
    showFlash(`Designer ${designer.name} selected!`, "success");
  };

  const handleSelectAddress = (addressId) => {
    console.log("handleSelectAddress called with:", addressId);
    if (addressId === "new") {
      setSelectedAddressId("new");
      setShowAddressForm(true);
      setEditingAddressId(null);
      // Clear form
      setFormData((prev) => ({
        ...prev,
        deliveryAddress: "",
        city: "",
        state: "",
        pincode: "",
      }));
      return;
    }

    const address = savedAddresses.find((addr) => addr._id === addressId);
    console.log("Found address:", address);
    if (address) {
      setSelectedAddressId(addressId);
      setShowAddressForm(false);
      setEditingAddressId(null);
      // Auto-fill form
      setFormData((prev) => ({
        ...prev,
        deliveryAddress: address.street,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
      }));
      console.log("Address set to formData:", {
        deliveryAddress: address.street,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
      });
    }
  };

  const handleEditAddress = (address) => {
    setEditingAddressId(address._id);
    setSelectedAddressId(address._id);
    setShowAddressForm(true);
    setFormData((prev) => ({
      ...prev,
      deliveryAddress: address.street,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
    }));
  };

  const handleDeleteAddress = async (addressId) => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    try {
      await customerAPI.deleteAddress(addressId);
      showFlash("Address deleted successfully", "success");
      fetchSavedAddresses();
      if (selectedAddressId === addressId) {
        setSelectedAddressId("");
      }
    } catch (error) {
      showFlash("Failed to delete address", "error");
    }
  };

  const handleSaveAddress = async () => {
    console.log("handleSaveAddress called");
    console.log("Current formData:", formData);
    console.log("saveAddress checkbox:", saveAddress);

    // Validate address fields first
    if (
      !formData.deliveryAddress ||
      !formData.city ||
      !formData.state ||
      !formData.pincode
    ) {
      showFlash("Please fill all address fields", "error");
      console.log("Validation failed - missing fields");
      return;
    }

    // Validate pincode
    if (!validateIndianPincode(formData.pincode)) {
      showFlash("Please enter a valid 6-digit Indian pincode", "error");
      return;
    }

    try {
      const addressData = {
        street: formData.deliveryAddress,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        isDefault: saveAddress,
      };

      console.log("Sending address data:", addressData);

      if (editingAddressId) {
        console.log("Updating address:", editingAddressId);
        const response = await customerAPI.updateAddress(
          editingAddressId,
          addressData,
        );
        console.log("Update response:", response);
        showFlash(
          saveAddress
            ? "Address updated and set as default successfully!"
            : "Address updated successfully!",
          "success",
        );
      } else {
        console.log("Adding new address");
        const response = await customerAPI.addAddress(addressData);
        console.log("Add response:", response);
        showFlash(
          saveAddress
            ? "Address saved and set as default successfully!"
            : "Address saved successfully!",
          "success",
        );
      }

      await fetchSavedAddresses();
      setShowAddressForm(false);
      setEditingAddressId(null);
      setSaveAddress(false);

      // Auto-select the newly saved/updated address
      setTimeout(() => {
        const addresses = savedAddresses;
        if (addresses.length > 0) {
          const defaultAddr = addresses.find((a) => a.isDefault);
          const addrToSelect = defaultAddr || addresses[0];
          if (addrToSelect) {
            handleSelectAddress(addrToSelect._id);
          }
        }
      }, 500);
    } catch (error) {
      console.error("Error saving address:", error);
      console.error("Error details:", error.response?.data);
      showFlash(
        error.response?.data?.message ||
          "Failed to save address. Please try again.",
        "error",
      );
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Auto-lookup pincode when 6 digits are entered
    if (
      name === "pincode" &&
      value.length === 6 &&
      /^[1-9][0-9]{5}$/.test(value)
    ) {
      handlePincodeLookup(value);
    }
  };

  const handlePhoneEdit = async () => {
    if (isEditingPhone) {
      // User is saving the phone number
      if (!formData.phone || !validateIndianPhoneNumber(formData.phone)) {
        showFlash("Please enter a valid 10-digit phone number", "error");
        return;
      }

      // Save phone number to user profile
      try {
        await customerAPI.updateProfile({ contactNumber: formData.phone });
        // Update the auth context with the new phone number
        updateUser({ contactNumber: formData.phone });
        showFlash("Phone number updated successfully", "success");
        setIsEditingPhone(false);
      } catch (error) {
        showFlash(
          error.response?.data?.message || "Failed to update phone number",
          "error",
        );
      }
    } else {
      // User is enabling edit mode
      setIsEditingPhone(true);
    }
  };

  const handlePincodeLookup = async (pincode) => {
    try {
      setLookingUpPincode(true);
      const response = await pincodeAPI.lookup(pincode);

      if (response.data.success) {
        setFormData((prev) => ({
          ...prev,
          city: response.data.data.city,
          state: response.data.data.state,
        }));
        showFlash(`Area: ${response.data.data.area}`, "info");
      }
    } catch (error) {
      // Silently fail - user can still enter manually
      console.log("Pincode lookup failed:", error);
    } finally {
      setLookingUpPincode(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name || formData.name.length < 3) {
      newErrors.name = "Full name is required (minimum 3 characters)";
    }

    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Valid email is required";
    }

    if (!formData.phone || !validateIndianPhoneNumber(formData.phone)) {
      newErrors.phone = "Valid 10-digit Indian phone number required";
    }

    if (
      formData.alternativePhone &&
      !validateIndianPhoneNumber(formData.alternativePhone)
    ) {
      newErrors.alternativePhone =
        "Valid 10-digit Indian phone number required";
    }

    // Check if address is selected or filled
    if (!selectedAddressId && !formData.deliveryAddress) {
      newErrors.deliveryAddress = "Please select or add a delivery address";
    } else if (
      !formData.deliveryAddress ||
      formData.deliveryAddress.length < 10
    ) {
      newErrors.deliveryAddress =
        "Delivery address is required (minimum 10 characters)";
    }

    if (!formData.city || formData.city.length < 2) {
      newErrors.city = "City is required";
    }

    if (!formData.state || formData.state.length < 2) {
      newErrors.state = "State is required";
    }

    if (!formData.pincode || !validateIndianPincode(formData.pincode)) {
      newErrors.pincode = "Valid 6-digit Indian pincode required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showFlash("Please fix the errors in the form", "error");
      return;
    }

    // Validate designer selection for custom orders
    if (hasCustomDesigns && !selectedDesigner) {
      showFlash("Please select a designer for your custom order", "error");
      return;
    }

    // Show payment modal instead of directly processing
    setShowPaymentModal(true);
  };

  const calculateSubtotal = () => {
    if (!cart?.items) return 0;
    return cart.items.reduce((sum, item) => {
      // For products, use product price; for custom designs, use basePrice or estimatedPrice (default 500)
      const price =
        item.productId?.price ||
        item.designId?.basePrice ||
        item.designId?.estimatedPrice ||
        500;
      return sum + price * item.quantity;
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const tax = subtotal * 0.18;
  const shipping = 100;
  const total = subtotal + tax + shipping;

  return (
    <div className="container my-4">
      <div className="row mb-4">
        <div className="col-md-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <h2 className="card-title mb-0">Checkout</h2>
                <Link to="/customer/cart" className="btn btn-outline-primary">
                  Back to Cart
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Designer Selection for Custom Orders */}
      {hasCustomDesigns && showDesignerSelection && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card shadow-sm">
              <div
                className="card-header bg-gradient"
                style={{
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  color: "white",
                }}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <h3 className="mb-0">
                    <i className="fas fa-palette me-2"></i>
                    Step 1: Choose Your Designer
                  </h3>
                  {selectedDesigner && (
                    <span className="badge bg-success">
                      <i className="fas fa-check me-1"></i>
                      {selectedDesigner.name} Selected
                    </span>
                  )}
                </div>
              </div>
              <div className="card-body p-0">
                <DesignerSelection
                  onSelectDesigner={handleDesignerSelect}
                  selectedDesignerId={selectedDesigner?._id}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Selected Designer Summary */}
      {hasCustomDesigns && selectedDesigner && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="alert alert-success d-flex align-items-center">
              <div className="me-3">
                {selectedDesigner.profilePicture ? (
                  <img
                    src={selectedDesigner.profilePicture}
                    alt={selectedDesigner.name}
                    style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: "1.25rem",
                      fontWeight: "bold",
                    }}
                  >
                    {selectedDesigner.name?.charAt(0)?.toUpperCase() || "D"}
                  </div>
                )}
              </div>
              <div className="flex-grow-1">
                <h5 className="mb-1">
                  <i className="fas fa-check-circle text-success me-2"></i>
                  Designer Selected: {selectedDesigner.name}
                </h5>
                <small className="text-muted">
                  ⭐ {(selectedDesigner.rating || 0).toFixed(1)} rating • 📦{" "}
                  {selectedDesigner.completedOrders || 0} orders completed • ⏱️
                  ~{selectedDesigner.turnaroundDays || 7} days turnaround
                </small>
              </div>
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={() => setSelectedDesigner(null)}
              >
                Change Designer
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="row">
        <div className="col-md-8">
          <div className="card shadow-sm mb-4">
            <div className="card-header">
              <h3>
                {hasCustomDesigns ? (
                  <>
                    <i className="fas fa-truck me-2"></i>
                    Step 2: Shipping Information
                  </>
                ) : (
                  "Shipping Information"
                )}
              </h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">
                    Full Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${
                      errors.name ? "is-invalid" : ""
                    }`}
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                  {errors.name && (
                    <div className="invalid-feedback">{errors.name}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email <span className="text-danger">*</span>
                  </label>
                  <input
                    type="email"
                    className={`form-control ${
                      errors.email ? "is-invalid" : ""
                    }`}
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  {errors.email && (
                    <div className="invalid-feedback">{errors.email}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="phone" className="form-label">
                    Phone Number <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <input
                      type="tel"
                      className={`form-control ${
                        errors.phone ? "is-invalid" : ""
                      }`}
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      maxLength="10"
                      readOnly={!isEditingPhone}
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={handlePhoneEdit}
                      title={
                        isEditingPhone
                          ? "Save phone number"
                          : "Edit phone number"
                      }
                    >
                      <i
                        className={`fas fa-${
                          isEditingPhone ? "check" : "edit"
                        }`}
                      ></i>
                    </button>
                  </div>
                  {errors.phone && (
                    <div className="invalid-feedback d-block">
                      {errors.phone}
                    </div>
                  )}
                  <div className="form-text">
                    {isEditingPhone
                      ? "Must be 10 digits starting with 6, 7, 8, or 9"
                      : "Click edit to change your phone number"}
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="alternativePhone" className="form-label">
                    Alternative Phone Number{" "}
                    <span className="text-muted">(Optional)</span>
                  </label>
                  <input
                    type="tel"
                    className={`form-control ${
                      errors.alternativePhone ? "is-invalid" : ""
                    }`}
                    id="alternativePhone"
                    name="alternativePhone"
                    value={formData.alternativePhone}
                    onChange={handleChange}
                    maxLength="10"
                  />
                  {errors.alternativePhone && (
                    <div className="invalid-feedback">
                      {errors.alternativePhone}
                    </div>
                  )}
                </div>

                {/* Saved Addresses Section */}
                <div className="mb-4">
                  <label className="form-label fw-bold">Delivery Address</label>

                  {/* Helpful guide for first-time users */}
                  {savedAddresses.length === 0 && (
                    <div className="alert alert-primary mb-3">
                      <i className="fas fa-lightbulb me-2"></i>
                      <strong>Tip:</strong> Save your address to make future
                      checkouts faster! You can save multiple addresses and set
                      one as default.
                    </div>
                  )}

                  {/* Show saved addresses if any exist */}
                  {savedAddresses.length > 0 && (
                    <div className="mb-3">
                      <div className="row g-3 mb-3">
                        {savedAddresses.map((addr) => (
                          <div key={addr._id} className="col-md-6">
                            <div
                              className={`card h-100 cursor-pointer ${
                                selectedAddressId === addr._id
                                  ? "border-success border-2 shadow-sm"
                                  : "border"
                              }`}
                              onClick={() => handleSelectAddress(addr._id)}
                              style={{
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                                backgroundColor:
                                  selectedAddressId === addr._id
                                    ? "#f0fff4"
                                    : "white",
                              }}
                            >
                              <div className="card-body">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                  <div className="form-check">
                                    <input
                                      className="form-check-input"
                                      type="radio"
                                      name="selectedAddress"
                                      id={`addr-${addr._id}`}
                                      checked={selectedAddressId === addr._id}
                                      onChange={() =>
                                        handleSelectAddress(addr._id)
                                      }
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  </div>
                                  <div className="d-flex gap-1">
                                    {selectedAddressId === addr._id && (
                                      <span className="badge bg-success">
                                        <i className="fas fa-check me-1"></i>
                                        Selected
                                      </span>
                                    )}
                                    {addr.isDefault && (
                                      <span className="badge bg-primary">
                                        Default
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <p className="mb-1 fw-semibold small">
                                  {addr.street}
                                </p>
                                <p className="mb-2 text-muted small">
                                  {addr.city}, {addr.state}
                                </p>
                                <p className="mb-3 text-muted small">
                                  Pincode: {addr.pincode}
                                </p>
                                <div className="d-flex gap-2">
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-primary flex-fill"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditAddress(addr);
                                    }}
                                  >
                                    <i className="fas fa-edit me-1"></i> Edit
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger flex-fill"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteAddress(addr._id);
                                    }}
                                  >
                                    <i className="fas fa-trash me-1"></i> Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        {/* Add New Address Card */}
                        <div className="col-md-6">
                          <div
                            className="card h-100 border-dashed cursor-pointer"
                            onClick={() => handleSelectAddress("new")}
                            style={{
                              cursor: "pointer",
                              borderStyle: "dashed",
                              borderWidth: "2px",
                            }}
                          >
                            <div className="card-body d-flex flex-column align-items-center justify-content-center text-center">
                              <i className="fas fa-plus-circle fa-3x text-primary mb-3"></i>
                              <h6 className="mb-0">Add New Address</h6>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {savedAddresses.length === 0 && (
                    <div className="alert alert-info">
                      <i className="fas fa-info-circle me-2"></i>
                      No saved addresses. Please add a new address below.
                    </div>
                  )}
                </div>

                {/* Address Form - Show when adding new or editing */}
                {/* Address Form - Show when adding new or editing */}
                {(showAddressForm || savedAddresses.length === 0) && (
                  <>
                    {showAddressForm && savedAddresses.length > 0 && (
                      <div className="alert alert-info mb-3">
                        <i className="fas fa-info-circle me-2"></i>
                        {editingAddressId
                          ? "Editing address"
                          : "Adding new address"}
                      </div>
                    )}

                    <div className="mb-3">
                      <label htmlFor="deliveryAddress" className="form-label">
                        Delivery Address <span className="text-danger">*</span>
                      </label>
                      <textarea
                        className={`form-control ${
                          errors.deliveryAddress ? "is-invalid" : ""
                        }`}
                        id="deliveryAddress"
                        name="deliveryAddress"
                        value={formData.deliveryAddress}
                        onChange={handleChange}
                        rows="3"
                        placeholder="House No., Building Name, Street, Area"
                        required
                      />
                      {errors.deliveryAddress && (
                        <div className="invalid-feedback">
                          {errors.deliveryAddress}
                        </div>
                      )}
                    </div>

                    <div className="mb-3">
                      <label htmlFor="pincode" className="form-label">
                        Pincode <span className="text-danger">*</span>
                      </label>
                      <div className="position-relative">
                        <input
                          type="text"
                          className={`form-control ${
                            errors.pincode ? "is-invalid" : ""
                          }`}
                          id="pincode"
                          name="pincode"
                          value={formData.pincode}
                          onChange={handleChange}
                          maxLength="6"
                          placeholder="Enter 6-digit pincode"
                          required
                        />
                        {lookingUpPincode && (
                          <div
                            className="position-absolute top-50 end-0 translate-middle-y me-2"
                            style={{ pointerEvents: "none" }}
                          >
                            <span
                              className="spinner-border spinner-border-sm text-primary"
                              role="status"
                              aria-hidden="true"
                            ></span>
                          </div>
                        )}
                      </div>
                      {errors.pincode && (
                        <div className="invalid-feedback d-block">
                          {errors.pincode}
                        </div>
                      )}
                      <div className="form-text text-muted small">
                        {lookingUpPincode ? (
                          <>
                            <i className="bi bi-search"></i> Looking up
                            location...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-info-circle"></i> City and state
                            will be auto-filled
                          </>
                        )}
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label htmlFor="city" className="form-label">
                          City <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className={`form-control ${
                            errors.city ? "is-invalid" : ""
                          }`}
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          required
                        />
                        {errors.city && (
                          <div className="invalid-feedback">{errors.city}</div>
                        )}
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="state" className="form-label">
                          State <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className={`form-control ${
                            errors.state ? "is-invalid" : ""
                          }`}
                          id="state"
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          required
                        />
                        {errors.state && (
                          <div className="invalid-feedback">{errors.state}</div>
                        )}
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="alert alert-info">
                        <i className="fas fa-lightbulb me-2"></i>
                        <small>
                          {editingAddressId
                            ? "Check the box below to set this as your default delivery address"
                            : "Save this address to your account for faster checkout next time"}
                        </small>
                      </div>
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="saveAddress"
                          checked={saveAddress}
                          onChange={(e) => setSaveAddress(e.target.checked)}
                        />
                        <label
                          className="form-check-label fw-semibold"
                          htmlFor="saveAddress"
                        >
                          {editingAddressId
                            ? "✓ Set as default address"
                            : "✓ Save this address for future orders"}
                        </label>
                      </div>
                    </div>

                    {/* Save/Update Buttons */}
                    <div className="d-flex gap-2 mb-3">
                      {showAddressForm && !editingAddressId && (
                        <button
                          type="button"
                          className="btn btn-success"
                          onClick={handleSaveAddress}
                        >
                          <i className="fas fa-save me-2"></i> Save Address
                        </button>
                      )}
                      {editingAddressId && (
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={handleSaveAddress}
                        >
                          <i className="fas fa-check me-2"></i> Update Address
                        </button>
                      )}
                      {showAddressForm && savedAddresses.length > 0 && (
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => {
                            setShowAddressForm(false);
                            setEditingAddressId(null);
                            if (savedAddresses.length > 0) {
                              const defaultAddr = savedAddresses.find(
                                (a) => a.isDefault,
                              );
                              if (defaultAddr) {
                                handleSelectAddress(defaultAddr._id);
                              } else {
                                handleSelectAddress(savedAddresses[0]._id);
                              }
                            }
                          }}
                        >
                          <i className="fas fa-times me-2"></i> Cancel
                        </button>
                      )}
                    </div>
                  </>
                )}

                <hr className="my-4" />

                <div className="d-grid">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Processing...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-shopping-bag me-2"></i>
                        Proceed to Payment
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm mb-3">
            <div className="card-body">
              <h6 className="card-title">
                <i className="fas fa-info-circle text-primary me-2"></i>
                Payment Options Available
              </h6>
              <ul className="list-unstyled mb-0 small">
                <li className="mb-1">
                  <i className="fas fa-check-circle text-success me-2"></i>
                  Credit/Debit Card
                </li>
                <li className="mb-1">
                  <i className="fas fa-check-circle text-success me-2"></i>
                  UPI (Google Pay, PhonePe, Paytm)
                </li>
                <li className="mb-1">
                  <i className="fas fa-check-circle text-success me-2"></i>
                  Net Banking
                </li>
                <li className="mb-1">
                  <i className="fas fa-check-circle text-success me-2"></i>
                  Cash on Delivery (COD)
                </li>
              </ul>
            </div>
          </div>

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
              <div className="d-flex justify-content-between">
                <strong>Total:</strong>
                <strong>{formatPrice(total)}</strong>
              </div>
            </div>
          </div>

          <div className="card shadow-sm mt-3">
            <div className="card-header">
              <h5>Items ({cart?.items?.length || 0})</h5>
            </div>
            <div className="card-body">
              {cart?.items?.map((item) => {
                const product = item.productId;
                const design = item.designId;
                const isCustomDesign = !!design;

                const name = isCustomDesign
                  ? design.name || "Custom Design"
                  : product?.name || "Product";
                const price = isCustomDesign
                  ? design.basePrice || design.estimatedPrice || 500
                  : product?.price || 0;

                return (
                  <div
                    key={item._id}
                    className="d-flex justify-content-between align-items-center mb-2"
                  >
                    <small>
                      {name} × {item.quantity}
                      {isCustomDesign && (
                        <span
                          className="badge bg-info text-dark ms-1"
                          style={{ fontSize: "0.65rem" }}
                        >
                          Custom
                        </span>
                      )}
                    </small>
                    <small>{formatPrice(price * item.quantity)}</small>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        show={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        orderData={{
          ...formData,
          saveAddress,
          selectedDesignerId: selectedDesigner?._id,
        }}
        totalAmount={total}
      />
    </div>
  );
};

export default Checkout;
