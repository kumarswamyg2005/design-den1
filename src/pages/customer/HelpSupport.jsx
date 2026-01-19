import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useFlash } from "../../context/FlashContext";

const HelpSupport = () => {
  const { user } = useAuth();
  const { success, error } = useFlash();
  const [activeTab, setActiveTab] = useState("faq");
  const [contactForm, setContactForm] = useState({
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const faqs = [
    {
      question: "How do I create a custom design?",
      answer:
        "Go to Design Studio from the navigation menu. You can upload your own images, add text, choose colors and customize various aspects of your clothing item. Once satisfied, add it to your cart and proceed to checkout.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit/debit cards, UPI payments, net banking, and wallet payments. All transactions are secure and encrypted.",
    },
    {
      question: "How long does delivery take?",
      answer:
        "Standard delivery takes 5-7 business days. Express delivery is available for select locations and takes 2-3 business days. Custom designs may take an additional 2-3 days for production.",
    },
    {
      question: "Can I track my order?",
      answer:
        "Yes! Once your order is shipped, you'll receive a tracking number via email. You can also track your order from the Dashboard > Orders section.",
    },
    {
      question: "What is your return policy?",
      answer:
        "We offer a 7-day return policy for ready-made items in unused condition with original tags. Custom designs cannot be returned unless there's a manufacturing defect.",
    },
    {
      question: "How do I enable Two-Factor Authentication?",
      answer:
        "Go to Security Settings from the user menu dropdown. Click 'Enable 2FA' and follow the instructions. You'll receive verification codes via email when logging in.",
    },
    {
      question: "How can I change my password?",
      answer:
        "Navigate to Security Settings and click on 'Change Password' in the Quick Links section. Enter your current password and new password to update.",
    },
    {
      question: "What sizes are available?",
      answer:
        "We offer sizes from XS to 3XL for most items. Each product page has a detailed size chart. For custom orders, you can provide your exact measurements.",
    },
  ];

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactForm.subject || !contactForm.message) {
      error("Please fill in all fields");
      return;
    }

    setSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      success(
        "Your message has been sent! We'll get back to you within 24-48 hours."
      );
      setContactForm({ subject: "", message: "" });
    } catch (err) {
      error("Failed to send message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container my-4">
      <div className="row mb-4">
        <div className="col-12">
          <h2>
            <i className="fas fa-question-circle me-2"></i>
            Help & Support
          </h2>
          <p className="text-muted">
            Find answers to common questions or contact our support team
          </p>
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "faq" ? "active" : ""}`}
            onClick={() => setActiveTab("faq")}
          >
            <i className="fas fa-question-circle me-2"></i>FAQ
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "contact" ? "active" : ""}`}
            onClick={() => setActiveTab("contact")}
          >
            <i className="fas fa-envelope me-2"></i>Contact Us
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "guides" ? "active" : ""}`}
            onClick={() => setActiveTab("guides")}
          >
            <i className="fas fa-book me-2"></i>User Guides
          </button>
        </li>
      </ul>

      <div className="row">
        <div className="col-lg-8">
          {/* FAQ Section */}
          {activeTab === "faq" && (
            <div className="card shadow-sm">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="fas fa-question-circle me-2"></i>
                  Frequently Asked Questions
                </h5>
              </div>
              <div className="card-body">
                <div className="accordion" id="faqAccordion">
                  {faqs.map((faq, index) => (
                    <div className="accordion-item" key={index}>
                      <h2 className="accordion-header">
                        <button
                          className="accordion-button collapsed"
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target={`#faq${index}`}
                        >
                          {faq.question}
                        </button>
                      </h2>
                      <div
                        id={`faq${index}`}
                        className="accordion-collapse collapse"
                        data-bs-parent="#faqAccordion"
                      >
                        <div className="accordion-body">{faq.answer}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Contact Section */}
          {activeTab === "contact" && (
            <div className="card shadow-sm">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="fas fa-envelope me-2"></i>
                  Contact Support
                </h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleContactSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Your Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={user?.email || ""}
                      disabled
                    />
                    <small className="text-muted">
                      We'll respond to your registered email
                    </small>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Subject</label>
                    <select
                      className="form-select"
                      value={contactForm.subject}
                      onChange={(e) =>
                        setContactForm({
                          ...contactForm,
                          subject: e.target.value,
                        })
                      }
                    >
                      <option value="">Select a topic</option>
                      <option value="order">Order Issue</option>
                      <option value="payment">Payment Problem</option>
                      <option value="delivery">Delivery Inquiry</option>
                      <option value="design">Design Help</option>
                      <option value="account">Account Issue</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Message</label>
                    <textarea
                      className="form-control"
                      rows="5"
                      placeholder="Describe your issue or question in detail..."
                      value={contactForm.message}
                      onChange={(e) =>
                        setContactForm({
                          ...contactForm,
                          message: e.target.value,
                        })
                      }
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Sending...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane me-2"></i>Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* User Guides Section */}
          {activeTab === "guides" && (
            <div className="card shadow-sm">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="fas fa-book me-2"></i>
                  User Guides
                </h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="card h-100 border">
                      <div className="card-body">
                        <h6>
                          <i className="fas fa-palette text-primary me-2"></i>
                          Getting Started with Design Studio
                        </h6>
                        <p className="text-muted small mb-2">
                          Learn how to create your first custom design from
                          scratch.
                        </p>
                        <ul className="small mb-0">
                          <li>Choose your base product</li>
                          <li>Upload images or use our library</li>
                          <li>Add text and customize colors</li>
                          <li>Preview and order</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card h-100 border">
                      <div className="card-body">
                        <h6>
                          <i className="fas fa-shopping-cart text-success me-2"></i>
                          How to Place an Order
                        </h6>
                        <p className="text-muted small mb-2">
                          Step-by-step guide to ordering your items.
                        </p>
                        <ul className="small mb-0">
                          <li>Add items to cart</li>
                          <li>Review your cart</li>
                          <li>Enter shipping details</li>
                          <li>Complete payment</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card h-100 border">
                      <div className="card-body">
                        <h6>
                          <i className="fas fa-truck text-info me-2"></i>
                          Tracking Your Order
                        </h6>
                        <p className="text-muted small mb-2">
                          Keep track of your order status and delivery.
                        </p>
                        <ul className="small mb-0">
                          <li>View order status in Dashboard</li>
                          <li>Use tracking number</li>
                          <li>Receive email updates</li>
                          <li>Contact delivery partner</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card h-100 border">
                      <div className="card-body">
                        <h6>
                          <i className="fas fa-shield-alt text-warning me-2"></i>
                          Account Security
                        </h6>
                        <p className="text-muted small mb-2">
                          Keep your account safe and secure.
                        </p>
                        <ul className="small mb-0">
                          <li>Enable Two-Factor Authentication</li>
                          <li>Use a strong password</li>
                          <li>Monitor login activity</li>
                          <li>Update security settings</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="col-lg-4">
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h6 className="mb-3">
                <i className="fas fa-headset me-2"></i>Need Immediate Help?
              </h6>
              <p className="text-muted small">
                Our support team is available to assist you.
              </p>
              <div className="d-flex align-items-center mb-2">
                <i className="fas fa-envelope text-primary me-2"></i>
                <span className="small">info@designden.com</span>
              </div>
              <div className="d-flex align-items-center mb-2">
                <i className="fas fa-phone text-primary me-2"></i>
                <span className="small">8688219055</span>
              </div>
              <div className="d-flex align-items-center">
                <i className="fas fa-clock text-primary me-2"></i>
                <span className="small">Mon-Sat: 9 AM - 6 PM</span>
              </div>
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-body">
              <h6 className="mb-3">
                <i className="fas fa-link me-2"></i>Quick Links
              </h6>
              <div className="list-group list-group-flush">
                <a
                  href="/security"
                  className="list-group-item list-group-item-action"
                >
                  <i className="fas fa-shield-alt me-2"></i>Security Settings
                </a>
                <a
                  href="/customer/dashboard"
                  className="list-group-item list-group-item-action"
                >
                  <i className="fas fa-tachometer-alt me-2"></i>My Dashboard
                </a>
                <a
                  href="/shop"
                  className="list-group-item list-group-item-action"
                >
                  <i className="fas fa-shopping-bag me-2"></i>Browse Shop
                </a>
                <a
                  href="/design-studio"
                  className="list-group-item list-group-item-action"
                >
                  <i className="fas fa-palette me-2"></i>Design Studio
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpSupport;
