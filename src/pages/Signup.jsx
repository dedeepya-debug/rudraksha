import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Eye, EyeOff, Lock, Mail, User, Phone } from 'lucide-react';
import './Auth.css';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const showToast = useToast();
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    // 1. Validation
    if (!name || !email || !phone || !password || !confirmPassword) {
      showToast("Please fill in all fields.", "error");
      return;
    }
    if (password !== confirmPassword) {
      showToast("Passwords do not match.", "error");
      return;
    }
    if (password.length < 6) {
      showToast("Password must be at least 6 characters.", "error");
      return;
    }
    if (!/^\d{10}$/.test(phone.replace(/[^0-9]/g, ''))) {
      showToast("Please enter a valid 10-digit phone number.", "error");
      return;
    }

    setLoading(true);
    try {
      await register(name, email, phone, password);
      showToast("Account created successfully! Welcome to Rudraksha Textiles.", "success");
      navigate('/');
    } catch (err) {
      showToast(err.message || "Failed to create account.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card reveal active">
        <h2 className="auth-title">Create Account</h2>
        <div className="title-underline" style={{ margin: '10px auto 30px auto' }}></div>
        <p className="auth-subtitle">Join us to explore and source premium luxury textiles.</p>

        <form onSubmit={handleSignup} className="auth-form">
          <div className="auth-group">
            <label className="auth-label">Full Name *</label>
            <div className="auth-input-wrapper">
              <User className="auth-icon-left" size={18} />
              <input
                type="text"
                className="auth-input"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

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

          <div className="auth-group">
            <label className="auth-label">Phone Number *</label>
            <div className="auth-input-wrapper">
              <Phone className="auth-icon-left" size={18} />
              <input
                type="tel"
                className="auth-input"
                placeholder="9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="auth-group">
            <label className="auth-label">Password *</label>
            <div className="auth-input-wrapper">
              <Lock className="auth-icon-left" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                className="auth-input"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="auth-eye-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="auth-group">
            <label className="auth-label">Confirm Password *</label>
            <div className="auth-input-wrapper">
              <Lock className="auth-icon-left" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                className="auth-input"
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login" className="auth-footer-link">Sign In</Link></p>
        </div>
      </div>
    </div>
  );
}