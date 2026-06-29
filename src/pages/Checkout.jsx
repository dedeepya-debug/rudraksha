import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { CreditCard, Truck, Landmark, ShieldCheck, ArrowLeft, CheckCircle } from 'lucide-react';
import './Checkout.css';

export default function Checkout() {
  const { cart, cartSubtotal, shippingCharges, cartGrandTotal, clearCart } = useCart();
  const { token, user } = useAuth();
  const showToast = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user ? user.name : '',
    email: user ? user.email : '',
    phone: user ? user.phone || '' : '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    paymentMethod: 'cod'
  });

  const [paymentDetails, setPaymentDetails] = useState({
    cardName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    upiId: ''
  });

  const [loading, setLoading] = useState(false);

  // Sync user info if loaded late
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name,
        email: user.email,
        phone: user.phone || ''
      }));
    }
  }, [user]);

  // Protect route - checkout requires items
  useEffect(() => {
    if (cart.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentDetails(prev => ({ ...prev, [name]: value }));
  };

  const validateCheckout = () => {
    const { name, email, phone, address, city, state, pincode, paymentMethod } = formData;
    
    if (!name || !email || !phone || !address || !city || !state || !pincode) {
      showToast("Please fill in all delivery details.", "error");
      return false;
    }
    if (!/^\d{10}$/.test(phone.replace(/[^0-9]/g, ''))) {
      showToast("Please enter a valid 10-digit phone number.", "error");
      return false;
    }
    if (!/^\d{6}$/.test(pincode.replace(/[^0-9]/g, ''))) {
      showToast("Please enter a valid 6-digit Pincode.", "error");
      return false;
    }

    if (paymentMethod === 'card') {
      const { cardName, cardNumber, cardExpiry, cardCvv } = paymentDetails;
      if (!cardName || !cardNumber || !cardExpiry || !cardCvv) {
        showToast("Please enter card details.", "error");
        return false;
      }
    } else if (paymentMethod === 'upi') {
      const { upiId } = paymentDetails;
      if (!upiId || !upiId.includes('@')) {
        showToast("Please enter a valid UPI ID (e.g. user@okaxis).", "error");
        return false;
      }
    }

    return true;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!validateCheckout()) return;

    setLoading(true);
    const API_URL = 'http://localhost:5000/api';
    const fullAddress = `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`;

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: fullAddress,
        payment_method: formData.paymentMethod,
        cartItems: cart.map(item => ({
          product_id: item.product_id,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          price: item.product ? item.product.price * (1 - item.product.discount/100) : 0
        })),
        shipping_charges: shippingCharges,
        subtotal: cartSubtotal,
        grand_total: cartGrandTotal
      };

      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (res.ok) {
        showToast("Order placed successfully!", "success");
        clearCart();
        navigate(`/order-success/${data.orderId}`);
      } else {
        showToast(data.error || "Failed to place order.", "error");
      }
    } catch (err) {
      showToast("Server connection error during checkout.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page-container">
      <div className="container">
        
        <div className="checkout-header">
          <Link to="/cart" className="back-link">
            <ArrowLeft size={16} />
            <span>Return to Cart</span>
          </Link>
          <h1 className="checkout-page-title">Checkout</h1>
          <div className="title-underline" style={{ margin: '10px 0 40px 0' }}></div>
        </div>

        <form onSubmit={handlePlaceOrder} className="checkout-grid">
          
          {/* Left Column: Forms */}
          <div className="checkout-forms-section">
            
            {/* Delivery address details */}
            <div className="checkout-card">
              <h2 className="card-title-heading">
                <Truck size={20} className="card-icon" />
                <span>Shipping Address</span>
              </h2>
              
              <div className="checkout-form-grid">
                <div className="form-group span-2">
                  <label className="form-label">Recipient's Full Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Email Address *</label>
                    <input
                      type="email"
                      className="form-input"
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number *</label>
                    <input
                      type="tel"
                      className="form-input"
                      name="phone"
                      value={formData.phone}
                      onChange={handleFormChange}
                      placeholder="10-digit number"
                      required
                    />
                  </div>
                </div>

                <div className="form-group span-2">
                  <label className="form-label">Street Address *</label>
                  <input
                    type="text"
                    className="form-input"
                    name="address"
                    value={formData.address}
                    onChange={handleFormChange}
                    placeholder="Building/Flat number, Street name, Area"
                    required
                  />
                </div>

                <div className="form-row-three">
                  <div className="form-group">
                    <label className="form-label">City *</label>
                    <input
                      type="text"
                      className="form-input"
                      name="city"
                      value={formData.city}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State *</label>
                    <input
                      type="text"
                      className="form-input"
                      name="state"
                      value={formData.state}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Pincode *</label>
                    <input
                      type="text"
                      className="form-input"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleFormChange}
                      placeholder="6-digits"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment methods */}
            <div className="checkout-card" style={{ marginTop: '30px' }}>
              <h2 className="card-title-heading">
                <CreditCard size={20} className="card-icon" />
                <span>Payment Method</span>
              </h2>

              <div className="payment-options-list">
                {/* COD option */}
                <label className={`payment-option-label ${formData.paymentMethod === 'cod' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={formData.paymentMethod === 'cod'}
                    onChange={handleFormChange}
                  />
                  <div className="payment-option-meta">
                    <span className="payment-name">Cash on Delivery (COD)</span>
                    <span className="payment-desc">Pay directly at your doorstep with Cash or UPI upon receiving delivery.</span>
                  </div>
                </label>

                {/* UPI option */}
                <label className={`payment-option-label ${formData.paymentMethod === 'upi' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="upi"
                    checked={formData.paymentMethod === 'upi'}
                    onChange={handleFormChange}
                  />
                  <div className="payment-option-meta">
                    <span className="payment-name">UPI Payment Gateway</span>
                    <span className="payment-desc">Instantly checkout using GPay, PhonePe, Paytm, or BHIM.</span>
                  </div>
                </label>

                {formData.paymentMethod === 'upi' && (
                  <div className="payment-details-panel">
                    <div className="form-group">
                      <label className="form-label">Enter UPI ID *</label>
                      <input
                        type="text"
                        className="form-input"
                        name="upiId"
                        placeholder="username@bank"
                        value={paymentDetails.upiId}
                        onChange={handlePaymentChange}
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Card option */}
                <label className={`payment-option-label ${formData.paymentMethod === 'card' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={formData.paymentMethod === 'card'}
                    onChange={handleFormChange}
                  />
                  <div className="payment-option-meta">
                    <span className="payment-name">Credit / Debit Card</span>
                    <span className="payment-desc">All major Visa, MasterCard, RuPay, and American Express cards supported.</span>
                  </div>
                </label>

                {formData.paymentMethod === 'card' && (
                  <div className="payment-details-panel card-inputs-grid">
                    <div className="form-group span-2">
                      <label className="form-label">Cardholder's Name *</label>
                      <input
                        type="text"
                        className="form-input"
                        name="cardName"
                        value={paymentDetails.cardName}
                        onChange={handlePaymentChange}
                        required
                      />
                    </div>
                    <div className="form-group span-2">
                      <label className="form-label">Card Number *</label>
                      <input
                        type="text"
                        className="form-input"
                        name="cardNumber"
                        placeholder="xxxx xxxx xxxx xxxx"
                        value={paymentDetails.cardNumber}
                        onChange={handlePaymentChange}
                        required
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Expiry Date *</label>
                        <input
                          type="text"
                          className="form-input"
                          name="cardExpiry"
                          placeholder="MM/YY"
                          value={paymentDetails.cardExpiry}
                          onChange={handlePaymentChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">CVV Code *</label>
                        <input
                          type="password"
                          className="form-input"
                          name="cardCvv"
                          placeholder="•••"
                          maxLength="3"
                          value={paymentDetails.cardCvv}
                          onChange={handlePaymentChange}
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Order summary card */}
          <div className="checkout-summary-section">
            <div className="checkout-card summary-sticky-card">
              <h2 className="card-title-heading">
                <span>Order Summary</span>
              </h2>
              
              {/* Items strip */}
              <div className="summary-items-list">
                {cart.map((item) => {
                  const price = item.product ? item.product.price : 0;
                  const discount = item.product ? item.product.discount : 0;
                  const discountedPrice = price * (1 - discount/100);
                  const rowTotal = discountedPrice * item.quantity;
                  
                  const imgUrl = item.product && item.product.primary_image 
                    ? item.product.primary_image 
                    : (item.product && item.product.images && item.product.images.length > 0 ? item.product.images[0] : '/silk.png');

                  return (
                    <div className="summary-item-row" key={item.id}>
                      <img src={imgUrl} alt={item.product ? item.product.name : "Fabric"} className="summary-item-thumb" />
                      <div className="summary-item-meta">
                        <h4 className="summary-item-name">{item.product ? item.product.name : "Fabric"}</h4>
                        <span className="summary-item-attr">Size: {item.size} | Color: {item.color}</span>
                        <span className="summary-item-qty">Qty: {item.quantity} x ₹{discountedPrice.toLocaleString()}</span>
                      </div>
                      <span className="summary-item-total">₹{rowTotal.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>

              <hr className="details-divider" style={{ margin: '20px 0' }} />

              {/* Price list */}
              <ul className="checkout-price-lines">
                <li>
                  <span>Subtotal</span>
                  <span>₹{cartSubtotal.toLocaleString()}</span>
                </li>
                <li>
                  <span>Shipping Charges</span>
                  <span>{shippingCharges === 0 ? "FREE" : `₹${shippingCharges}`}</span>
                </li>
                <hr className="summary-divider" />
                <li className="grand-total-line">
                  <span>Grand Total</span>
                  <span>₹{cartGrandTotal.toLocaleString()}</span>
                </li>
              </ul>

              <button type="submit" className="btn btn-primary place-order-btn" disabled={loading}>
                {loading ? "Processing Order..." : `Place Order (₹${cartGrandTotal.toLocaleString()})`}
              </button>

              <div className="security-guarantee">
                <ShieldCheck size={16} className="security-icon" />
                <span>SSL Encrypted Secure Transaction</span>
              </div>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}
