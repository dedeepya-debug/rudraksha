import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { Trash, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';
import './Cart.css';

export default function Cart() {
  const { cart, updateCartQty, removeFromCart, cartSubtotal, shippingCharges, cartGrandTotal } = useCart();
  const showToast = useToast();
  const navigate = useNavigate();

  const handleQtyChange = (itemId, currentQty, amount) => {
    const nextQty = currentQty + amount;
    if (nextQty < 1) return;
    updateCartQty(itemId, nextQty);
  };

  const handleRemove = (itemId, name) => {
    removeFromCart(itemId);
    showToast(`${name} removed from cart.`, "info");
  };

  if (cart.length === 0) {
    return (
      <div className="cart-page-container empty-cart-state">
        <div className="container text-center">
          <ShoppingBag size={80} className="empty-cart-icon pulse-gold" />
          <h2 className="empty-cart-title">Your Cart is Empty</h2>
          <p className="empty-cart-desc">
            You haven't added any luxury weaves to your shopping cart yet. Browse our signature collections to find your fabric.
          </p>
          <Link to="/shop" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <ArrowLeft size={16} />
            <span>Continue Shopping</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page-container">
      <div className="container">
        
        <div className="cart-header">
          <h1 className="cart-page-title">Shopping Cart</h1>
          <div className="title-underline" style={{ margin: '10px 0 40px 0' }}></div>
        </div>

        <div className="cart-grid">
          
          {/* Left Column: Cart items table */}
          <div className="cart-items-list">
            <div className="cart-items-header-row">
              <span className="col-product">Product</span>
              <span className="col-price">Price</span>
              <span className="col-qty">Quantity</span>
              <span className="col-total">Total</span>
            </div>

            {cart.map((item) => {
              const price = item.product ? item.product.price : 0;
              const discount = item.product ? item.product.discount : 0;
              const discountedPrice = price * (1 - discount / 100);
              const rowTotal = discountedPrice * item.quantity;
              
              const imgUrl = item.product && item.product.primary_image 
                ? item.product.primary_image 
                : (item.product && item.product.images && item.product.images.length > 0 ? item.product.images[0] : '/silk.png');

              return (
                <div className="cart-item-row" key={item.id}>
                  {/* Product Details Block */}
                  <div className="col-product item-meta-block">
                    <img src={imgUrl} alt={item.product ? item.product.name : "Fabric"} className="item-thumbnail" />
                    <div className="item-details">
                      <span className="item-category-tag">{item.product ? item.product.category : ""}</span>
                      <h3 className="item-title-name">
                        <Link to={`/product/${item.product_id}`}>{item.product ? item.product.name : "Luxury Fabric"}</Link>
                      </h3>
                      <div className="item-attributes">
                        <span><strong>Size:</strong> {item.size}</span>
                        <span><strong>Color:</strong> {item.color}</span>
                      </div>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="col-price item-price-block">
                    <span className="price-label-mobile">Price: </span>
                    <span className="price-value">₹{discountedPrice.toLocaleString()}</span>
                  </div>

                  {/* Quantity Pickers */}
                  <div className="col-qty item-qty-block">
                    <span className="qty-label-mobile">Qty: </span>
                    <div className="item-qty-selector">
                      <button onClick={() => handleQtyChange(item.id, item.quantity, -1)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => handleQtyChange(item.id, item.quantity, 1)}>+</button>
                    </div>
                  </div>

                  {/* Total price & remove */}
                  <div className="col-total item-total-block">
                    <span className="total-label-mobile">Total: </span>
                    <span className="total-value">₹{rowTotal.toLocaleString()}</span>
                    <button 
                      className="item-remove-btn" 
                      onClick={() => handleRemove(item.id, item.product ? item.product.name : "Fabric")}
                      aria-label="Remove item"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </div>
              );
            })}

            <div className="cart-actions-row">
              <Link to="/shop" className="btn-continue-shopping">
                <ArrowLeft size={16} />
                <span>Continue Shopping</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Order totals summary */}
          <div className="cart-summary-box">
            <h2 className="summary-title">Order Summary</h2>
            <div className="summary-underline"></div>

            <ul className="summary-lines">
              <li>
                <span>Subtotal</span>
                <span>₹{cartSubtotal.toLocaleString()}</span>
              </li>
              <li>
                <span>Delivery Charges</span>
                <span>{shippingCharges === 0 ? "FREE" : `₹${shippingCharges}`}</span>
              </li>
              {shippingCharges > 0 && (
                <li className="shipping-hint-li">
                  <p>Add <strong>₹{(5000 - cartSubtotal).toLocaleString()}</strong> more to unlock FREE delivery!</p>
                </li>
              )}
              <hr className="summary-divider" />
              <li className="grand-total-line">
                <span>Grand Total</span>
                <span>₹{cartGrandTotal.toLocaleString()}</span>
              </li>
            </ul>

            <button 
              className="btn btn-primary proceed-checkout-btn"
              onClick={() => navigate('/checkout')}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={16} style={{ marginLeft: '10px' }} />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
