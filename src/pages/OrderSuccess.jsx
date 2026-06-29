import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Calendar, ShoppingBag, ClipboardList } from 'lucide-react';
import './OrderSuccess.css';

export default function OrderSuccess() {
  const { id } = useParams();

  return (
    <div className="order-success-page">
      <div className="container text-center">
        <div className="success-content-card reveal active">
          <CheckCircle className="success-check-icon pulse-gold" size={80} />
          
          <h1 className="success-heading">Order Placed Successfully!</h1>
          <div className="title-underline" style={{ margin: '15px auto 24px auto' }}></div>
          
          <p className="success-para">
            Thank you for sourcing with Rudraksha Textiles. Your request has been successfully recorded. 
            We have sent an order verification receipt with shipping tracking details to your email address.
          </p>

          <div className="order-info-badge">
            <span className="info-badge-label">Order Reference ID</span>
            <span className="info-badge-value">#RT-{id.padStart(5, '0')}</span>
          </div>

          <div className="success-tips-box">
            <h4>What happens next?</h4>
            <ul className="tips-list">
              <li>
                <Calendar size={14} className="tip-icon" />
                <span>Our dispatch team will inspect fabric quality and wrap rolls within 48 hours.</span>
              </li>
              <li>
                <ShoppingBag size={14} className="tip-icon" />
                <span>For UPI/Card payments, invoice copy has been auto-generated. COD customers can pay on delivery.</span>
              </li>
            </ul>
          </div>

          <div className="success-button-actions">
            <Link to="/orders" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <ClipboardList size={16} />
              <span>Track Orders</span>
            </Link>
            
            <Link to="/shop" className="btn btn-outline">
              <span>Back to Shop</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
