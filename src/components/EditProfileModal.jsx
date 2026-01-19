import { useState, useEffect } from "react";
import { customerAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./EditProfileModal.css";

const EditProfileModal = ({ isOpen, onClose, onSuccess }) => {
  const { user, updateUser } = useAuth();
  const [isClosing, setIsClosing] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);

  // Personal info form
  const [personalInfo, setPersonalInfo] = useState({
    name: "",
    contactNumber: "",
  });

  // Address form
  const [addressForm, setAddressForm] = useState({
    street: "",
    city: "",
    state: "",
    pincode: "",
    isDefault: false,
  });

  useEffect(() => {
    if (isOpen && user) {
      setPersonalInfo({
        name: user.name || user.username || "",
        contactNumber: user.contactNumber || "",
      });
      fetchAddresses();
    }
  }, [isOpen, user]);

  const fetchAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const response = await customerAPI.getAddresses();
      setAddresses(response.data.addresses || []);
    } catch (error) {
      console.error("Error fetching addresses:", error);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setMessage({ type: "", text: "" });
      setEditingAddressId(null);
      setAddressForm({
        street: "",
        city: "",
        state: "",
        pincode: "",
        isDefault: false,
      });
      onClose();
    }, 300);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target;
    setPersonalInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSavePersonalInfo = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await customerAPI.updateProfile(personalInfo);
      updateUser(response.data.user);
      setMessage({ type: "success", text: "Profile updated successfully!" });
      if (onSuccess) onSuccess();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to update profile",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      if (editingAddressId) {
        await customerAPI.updateAddress(editingAddressId, addressForm);
        setMessage({ type: "success", text: "Address updated successfully!" });
      } else {
        await customerAPI.addAddress(addressForm);
        setMessage({ type: "success", text: "Address added successfully!" });
      }
      fetchAddresses();
      setAddressForm({
        street: "",
        city: "",
        state: "",
        pincode: "",
        isDefault: false,
      });
      setEditingAddressId(null);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to save address",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditAddress = (address) => {
    setEditingAddressId(address._id);
    setAddressForm({
      street: address.street || "",
      city: address.city || "",
      state: address.state || "",
      pincode: address.pincode || "",
      isDefault: address.isDefault || false,
    });
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Are you sure you want to delete this address?"))
      return;

    try {
      await customerAPI.deleteAddress(addressId);
      setMessage({ type: "success", text: "Address deleted successfully!" });
      fetchAddresses();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to delete address",
      });
    }
  };

  const cancelEditAddress = () => {
    setEditingAddressId(null);
    setAddressForm({
      street: "",
      city: "",
      state: "",
      pincode: "",
      isDefault: false,
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className={`edit-profile-overlay ${isOpen ? "active" : ""} ${
        isClosing ? "closing" : ""
      }`}
      onClick={handleOverlayClick}
    >
      <div
        className={`edit-profile-modal ${isOpen ? "active" : ""} ${
          isClosing ? "closing" : ""
        }`}
      >
        {/* Header */}
        <div className="edit-profile-header">
          <h2 className="edit-profile-title">
            <i className="fas fa-user-edit"></i>
            Edit Profile
          </h2>
          <button className="edit-profile-close" onClick={handleClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Tabs */}
        <div className="edit-profile-tabs">
          <button
            className={`edit-profile-tab ${
              activeTab === "personal" ? "active" : ""
            }`}
            onClick={() => setActiveTab("personal")}
          >
            <i className="fas fa-user"></i>
            Personal Info
          </button>
          <button
            className={`edit-profile-tab ${
              activeTab === "addresses" ? "active" : ""
            }`}
            onClick={() => setActiveTab("addresses")}
          >
            <i className="fas fa-map-marker-alt"></i>
            Addresses
          </button>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`edit-profile-message ${message.type}`}>
            <i
              className={`fas ${
                message.type === "success"
                  ? "fa-check-circle"
                  : "fa-exclamation-circle"
              }`}
            ></i>
            {message.text}
          </div>
        )}

        {/* Content */}
        <div className="edit-profile-content">
          {activeTab === "personal" && (
            <form
              onSubmit={handleSavePersonalInfo}
              className="edit-profile-form"
            >
              <div className="form-group">
                <label htmlFor="name">
                  <i className="fas fa-user"></i>
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={personalInfo.name}
                  onChange={handlePersonalInfoChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  <i className="fas fa-envelope"></i>
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={user?.email || ""}
                  disabled
                  className="disabled-input"
                />
                <small className="form-hint">Email cannot be changed</small>
              </div>

              <div className="form-group">
                <label htmlFor="contactNumber">
                  <i className="fas fa-phone"></i>
                  Contact Number
                </label>
                <input
                  type="tel"
                  id="contactNumber"
                  name="contactNumber"
                  value={personalInfo.contactNumber}
                  onChange={handlePersonalInfoChange}
                  placeholder="Enter your phone number"
                  pattern="[0-9]{10}"
                  title="Please enter a valid 10-digit phone number"
                />
              </div>

              <button
                type="submit"
                className="edit-profile-submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i>
                    Save Changes
                  </>
                )}
              </button>
            </form>
          )}

          {activeTab === "addresses" && (
            <div className="addresses-section">
              {/* Address Form */}
              <form onSubmit={handleSaveAddress} className="address-form">
                <h4 className="address-form-title">
                  {editingAddressId ? (
                    <>
                      <i className="fas fa-edit"></i>
                      Edit Address
                    </>
                  ) : (
                    <>
                      <i className="fas fa-plus"></i>
                      Add New Address
                    </>
                  )}
                </h4>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="street">Street Address</label>
                    <input
                      type="text"
                      id="street"
                      name="street"
                      value={addressForm.street}
                      onChange={handleAddressFormChange}
                      placeholder="House/Flat No., Street name"
                      required
                    />
                  </div>
                </div>

                <div className="form-row two-col">
                  <div className="form-group">
                    <label htmlFor="city">City</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={addressForm.city}
                      onChange={handleAddressFormChange}
                      placeholder="City"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="state">State</label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={addressForm.state}
                      onChange={handleAddressFormChange}
                      placeholder="State"
                      required
                    />
                  </div>
                </div>

                <div className="form-row two-col">
                  <div className="form-group">
                    <label htmlFor="pincode">Pincode</label>
                    <input
                      type="text"
                      id="pincode"
                      name="pincode"
                      value={addressForm.pincode}
                      onChange={handleAddressFormChange}
                      placeholder="6-digit pincode"
                      pattern="[0-9]{6}"
                      title="Please enter a valid 6-digit pincode"
                      required
                    />
                  </div>
                  <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="isDefault"
                        checked={addressForm.isDefault}
                        onChange={handleAddressFormChange}
                      />
                      <span className="checkmark"></span>
                      Set as default address
                    </label>
                  </div>
                </div>

                <div className="address-form-buttons">
                  {editingAddressId && (
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={cancelEditAddress}
                    >
                      <i className="fas fa-times"></i>
                      Cancel
                    </button>
                  )}
                  <button type="submit" className="btn-save" disabled={loading}>
                    {loading ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save"></i>
                        {editingAddressId ? "Update Address" : "Add Address"}
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Saved Addresses List */}
              <div className="saved-addresses">
                <h4 className="saved-addresses-title">
                  <i className="fas fa-list"></i>
                  Saved Addresses
                </h4>

                {loadingAddresses ? (
                  <div className="addresses-loading">
                    <i className="fas fa-spinner fa-spin"></i>
                    Loading addresses...
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="no-addresses">
                    <i className="fas fa-map-marker-alt"></i>
                    <p>No addresses saved yet</p>
                  </div>
                ) : (
                  <div className="addresses-list">
                    {addresses.map((address, index) => (
                      <div
                        key={address._id || index}
                        className={`address-card ${
                          address.isDefault ? "default" : ""
                        }`}
                      >
                        {address.isDefault && (
                          <span className="default-badge">
                            <i className="fas fa-star"></i>
                            Default
                          </span>
                        )}
                        <div className="address-content">
                          <p className="address-street">{address.street}</p>
                          <p className="address-city">
                            {address.city}, {address.state} - {address.pincode}
                          </p>
                        </div>
                        <div className="address-actions">
                          <button
                            className="btn-edit"
                            onClick={() => handleEditAddress(address)}
                            title="Edit address"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className="btn-delete"
                            onClick={() => handleDeleteAddress(address._id)}
                            title="Delete address"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
