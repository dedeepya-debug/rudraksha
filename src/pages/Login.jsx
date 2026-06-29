import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import './Auth.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const showToast = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast("Please enter all fields.", "error");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      showToast("Logged in successfully!", "success");
      navigate('/');
    } catch (err) {
      showToast(err.message || "Invalid credentials.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card reveal active">
        <h2 className="auth-title">Welcome Back</h2>
        <div className="title-underline" style={{ margin: '10px auto 30px auto' }}></div>
        <p className="auth-subtitle">Sign in to manage your orders and browse our exclusive collections.</p>

        <form onSubmit={handleLogin} className="auth-form">
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
            <div className="auth-label-row">
              <label className="auth-label">Password *</label>
              <Link to="/forgot-password" className="auth-forgot-link">Forgot Password?</Link>
            </div>
            <div className="auth-input-wrapper">
              <Lock className="auth-icon-left" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                className="auth-input"
                placeholder="••••••••"
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

          <div className="auth-options">
            <label className="auth-checkbox-label">
              <input
                type="checkbox"
                className="auth-checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember Me</span>
            </label>
          </div>

          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account? <Link to="/signup" className="auth-footer-link">Create Account</Link></p>
        </div>
      </div>
    </div>
  );
}