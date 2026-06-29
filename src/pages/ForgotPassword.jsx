import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { Mail, CheckCircle, ArrowLeft } from 'lucide-react';
import './Auth.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const showToast = useToast();

  const handleReset = (e) => {
    e.preventDefault();
    if (!email) {
      showToast("Please enter your email address.", "error");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
      showToast("Password reset link sent to your email!", "success");
    }, 1500);
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card reveal active">
        {sent ? (
          <div className="auth-success-flow" style={{ textAlign: 'center' }}>
            <CheckCircle className="pulse-gold" size={60} style={{ color: 'var(--color-gold)', marginBottom: '20px' }} />
            <h2 className="auth-title">Check Your Email</h2>
            <p className="auth-subtitle" style={{ margin: '15px 0 30px 0' }}>
              We have sent a secure password reset link to <strong>{email}</strong>. Please check your inbox and spam folders.
            </p>
            <Link to="/login" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <ArrowLeft size={16} />
              <span>Back to Login</span>
            </Link>
          </div>
        ) : (
          <>
            <h2 className="auth-title">Recover Password</h2>
            <div className="title-underline" style={{ margin: '10px auto 30px auto' }}></div>
            <p className="auth-subtitle">Enter the email associated with your account, and we will send a password reset link.</p>

            <form onSubmit={handleReset} className="auth-form">
              <div className="auth-group">
                <label className="auth-label">Email Address *</label>
                <div className="auth-input-wrapper">
                  <Mail className="auth-icon-left" size={18} />
                  <input
                    type="email"
                    className="auth-input"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
                {loading ? "Sending Link..." : "Send Reset Link"}
              </button>
            </form>

            <div className="auth-footer">
              <Link to="/login" className="auth-back-login">
                <ArrowLeft size={14} style={{ marginRight: '6px' }} />
                <span>Back to Login</span>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
