import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { customerAPI } from "../services/api";
import { useFlash } from "../context/FlashContext";
import { formatPrice } from "../utils/currency";

const PaymentModal = ({ show, onClose, orderData, totalAmount }) => {
  const navigate = useNavigate();
  const { showFlash } = useFlash();
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardName: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
  });

  if (!show) return null;

  const handlePayment = async (e) => {
    e.preventDefault();

    // Simulate payment processing
    setProcessing(true);

    try {
      if (paymentMethod === "cod") {
        // For COD, directly place order without payment processing
        const response = await customerAPI.processCheckout({
          ...orderData,
          paymentMethod: "cod",
          paymentStatus: "pending",
        });

        if (response.data.success) {
          showFlash("Order placed successfully! Pay on delivery.", "success");
          navigate("/customer/dashboard");
        }
      } else {
        // For online payments (card, upi, netbanking), simulate payment gateway
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Process checkout with payment
        const response = await customerAPI.processCheckout({
          ...orderData,
          paymentMethod,
          paymentStatus: "completed",
        });

        if (response.data.success) {
          showFlash("Payment successful! Order placed.", "success");
          navigate("/customer/dashboard");
        }
      }
    } catch (error) {
      showFlash(
        error.response?.data?.message || "Payment failed. Please try again.",
        "error"
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      {/* Modal Backdrop */}
      <div
        className="modal-backdrop fade show"
        style={{ zIndex: 1040 }}
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div
        className="modal fade show d-block"
        tabIndex="-1"
        style={{ zIndex: 1050 }}
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title">
                <i className="fas fa-credit-card me-2"></i>
                Complete Payment
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={onClose}
                disabled={processing}
              ></button>
            </div>
            <div className="modal-body">
              {/* COD Availability Banner */}
              <div className="alert alert-success mb-3">
                <div className="d-flex align-items-center">
                  <i className="fas fa-money-bill-wave fa-2x me-3"></i>
                  <div>
                    <strong>Cash on Delivery Available!</strong>
                    <p className="mb-0 small mt-1">
                      Pay in cash when your order arrives. No need for online
                      payment.
                    </p>
                  </div>
                </div>
              </div>

              {paymentMethod !== "cod" && (
                <div className="alert alert-info">
                  <i className="fas fa-info-circle me-2"></i>
                  <strong>Demo Mode:</strong> This is a dummy payment gateway
                  for demonstration purposes. Use any test card details.
                </div>
              )}

              {/* Order Summary */}
              <div className="card mb-4">
                <div className="card-body">
                  <h6 className="card-title">Order Summary</h6>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Total Amount:</span>
                    <strong className="text-primary">
                      {formatPrice(totalAmount)}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="mb-4">
                <h6>Select Payment Method</h6>
                <div className="d-grid gap-2">
                  <input
                    type="radio"
                    className="btn-check"
                    name="paymentMethod"
                    id="card"
                    value="card"
                    checked={paymentMethod === "card"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <label
                    className="btn btn-outline-primary text-start"
                    htmlFor="card"
                  >
                    <div>
                      <i className="fas fa-credit-card me-2"></i>
                      Credit/Debit Card
                    </div>
                    <small className="text-muted d-block mt-1">
                      Visa, MasterCard, Amex, Rupay
                    </small>
                  </label>

                  <input
                    type="radio"
                    className="btn-check"
                    name="paymentMethod"
                    id="upi"
                    value="upi"
                    checked={paymentMethod === "upi"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <label
                    className="btn btn-outline-primary text-start"
                    htmlFor="upi"
                  >
                    <div>
                      <i className="fas fa-mobile-alt me-2"></i>
                      UPI (Google Pay, PhonePe, Paytm)
                    </div>
                    <small className="text-muted d-block mt-1">
                      Fast & secure UPI payments
                    </small>
                  </label>

                  <input
                    type="radio"
                    className="btn-check"
                    name="paymentMethod"
                    id="netbanking"
                    value="netbanking"
                    checked={paymentMethod === "netbanking"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <label
                    className="btn btn-outline-primary text-start"
                    htmlFor="netbanking"
                  >
                    <div>
                      <i className="fas fa-university me-2"></i>
                      Net Banking
                    </div>
                    <small className="text-muted d-block mt-1">
                      Pay directly from your bank account
                    </small>
                  </label>

                  <input
                    type="radio"
                    className="btn-check"
                    name="paymentMethod"
                    id="cod"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <label
                    className="btn btn-outline-success text-start"
                    htmlFor="cod"
                    style={{
                      borderWidth: paymentMethod === "cod" ? "2px" : "1px",
                      fontWeight: paymentMethod === "cod" ? "bold" : "normal",
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <i className="fas fa-money-bill-wave me-2"></i>
                        Cash on Delivery (COD)
                      </div>
                      <span className="badge bg-success">Popular</span>
                    </div>
                    <small className="text-muted d-block mt-1">
                      Pay when you receive your order
                    </small>
                  </label>
                </div>
              </div>

              {/* Payment Form */}
              <form onSubmit={handlePayment}>
                {paymentMethod === "card" && (
                  <>
                    <div className="mb-3">
                      <label className="form-label">Card Number</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="1234 5678 9012 3456"
                        value={cardDetails.cardNumber}
                        onChange={(e) =>
                          setCardDetails({
                            ...cardDetails,
                            cardNumber: e.target.value,
                          })
                        }
                        maxLength="19"
                        required
                      />
                      <small className="text-muted">
                        Test: 4111 1111 1111 1111
                      </small>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Cardholder Name</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="John Doe"
                        value={cardDetails.cardName}
                        onChange={(e) =>
                          setCardDetails({
                            ...cardDetails,
                            cardName: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="row mb-3">
                      <div className="col-md-8">
                        <label className="form-label">Expiry Date</label>
                        <div className="row">
                          <div className="col-6">
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM"
                              value={cardDetails.expiryMonth}
                              onChange={(e) =>
                                setCardDetails({
                                  ...cardDetails,
                                  expiryMonth: e.target.value,
                                })
                              }
                              maxLength="2"
                              required
                            />
                          </div>
                          <div className="col-6">
                            <input
                              type="text"
                              className="form-control"
                              placeholder="YYYY"
                              value={cardDetails.expiryYear}
                              onChange={(e) =>
                                setCardDetails({
                                  ...cardDetails,
                                  expiryYear: e.target.value,
                                })
                              }
                              maxLength="4"
                              required
                            />
                          </div>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">CVV</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="123"
                          value={cardDetails.cvv}
                          onChange={(e) =>
                            setCardDetails({
                              ...cardDetails,
                              cvv: e.target.value,
                            })
                          }
                          maxLength="3"
                          required
                        />
                      </div>
                    </div>
                  </>
                )}

                {paymentMethod === "upi" && (
                  <div className="mb-3">
                    <label className="form-label">UPI ID</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="yourname@upi"
                      required
                    />
                    <small className="text-muted">Test: test@paytm</small>
                  </div>
                )}

                {paymentMethod === "netbanking" && (
                  <div className="mb-3">
                    <label className="form-label">Select Bank</label>
                    <select className="form-select" required>
                      <option value="">Choose your bank</option>
                      <option value="sbi">State Bank of India</option>
                      <option value="hdfc">HDFC Bank</option>
                      <option value="icici">ICICI Bank</option>
                      <option value="axis">Axis Bank</option>
                    </select>
                  </div>
                )}

                {paymentMethod === "cod" && (
                  <div className="alert alert-success">
                    <div className="d-flex">
                      <i className="fas fa-check-circle fa-2x me-3 text-success"></i>
                      <div>
                        <h6 className="alert-heading mb-2">
                          <strong>Cash on Delivery Selected</strong>
                        </h6>
                        <p className="mb-2">
                          You will pay in cash when your order is delivered to
                          your address. Please keep exact change ready for a
                          smooth delivery experience.
                        </p>
                        <hr className="my-2" />
                        <small className="text-muted">
                          <i className="fas fa-info-circle me-1"></i>
                          <strong>Note:</strong> Some high-value orders may
                          require advance payment. You'll be notified if your
                          order requires payment before delivery.
                        </small>
                      </div>
                    </div>
                  </div>
                )}

                <div className="d-grid gap-2">
                  <button
                    type="submit"
                    className={`btn ${
                      paymentMethod === "cod" ? "btn-success" : "btn-primary"
                    } btn-lg`}
                    disabled={processing}
                  >
                    {processing ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        {paymentMethod === "cod"
                          ? "Placing Order..."
                          : "Processing Payment..."}
                      </>
                    ) : (
                      <>
                        <i
                          className={`fas ${
                            paymentMethod === "cod"
                              ? "fa-check-circle"
                              : "fa-lock"
                          } me-2`}
                        ></i>
                        {paymentMethod === "cod"
                          ? `Place Order (${formatPrice(totalAmount)})`
                          : `Pay ${formatPrice(totalAmount)}`}
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={onClose}
                    disabled={processing}
                  >
                    Cancel
                  </button>
                </div>
              </form>

              <div className="text-center mt-3">
                <small className="text-muted">
                  <i className="fas fa-shield-alt me-1"></i>
                  {paymentMethod === "cod"
                    ? "Your order is secure. Pay only upon delivery verification."
                    : "Your payment information is secure and encrypted"}
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentModal;
