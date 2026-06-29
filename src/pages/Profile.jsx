import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { User, ClipboardList, Lock, LogOut, CheckCircle, RefreshCw, XCircle, FileDown, ShieldCheck, Mail, Phone, Calendar } from 'lucide-react';
import './Profile.css';

export default function Profile() {
  const { user, token, logout, updateProfile, changePassword } = useAuth();
  const showToast = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Profile Form state
  const [profileForm, setProfileForm] = useState({
    name: user ? user.name : '',
    phone: user ? user.phone || '' : ''
  });
  const [submittingProfile, setSubmittingProfile] = useState(false);

  // Password Form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [submittingPass, setSubmittingPass] = useState(false);

  const API_URL = 'http://localhost:5000/api';

  // Sync state if user loaded asynchronously
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name,
        phone: user.phone || ''
      });
    }
  }, [user]);

  // Protect page
  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  // Fetch user orders history
  useEffect(() => {
    const fetchUserOrders = async () => {
      if (!token) return;
      setLoadingOrders(true);
      try {
        const res = await fetch(`${API_URL}/orders`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setOrders(data.orders || []);
        }
      } catch (err) {
        console.error("Error loading profile orders:", err);
      } finally {
        setLoadingOrders(false);
      }
    };
    if (activeTab === 'orders') fetchUserOrders();
  }, [token, activeTab]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileForm.name) {
      showToast("Full name cannot be blank.", "error");
      return;
    }
    setSubmittingProfile(true);
    try {
      await updateProfile(profileForm.name, profileForm.phone);
      showToast("Profile details updated!", "success");
    } catch (err) {
      showToast(err.message || "Failed to update profile.", "error");
    } finally {
      setSubmittingProfile(false);
    }
  };

  const handlePassSubmit = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmNewPassword } = passwordForm;

    if (!currentPassword || !newPassword) {
      showToast("Please enter current and new passwords.", "error");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      showToast("New passwords do not match.", "error");
      return;
    }
    if (newPassword.length < 6) {
      showToast("Password must be at least 6 characters.", "error");
      return;
    }

    setSubmittingPass(true);
    try {
      await changePassword(currentPassword, newPassword);
      showToast("Password updated successfully!", "success");
      setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      showToast(err.message || "Failed to change password.", "error");
    } finally {
      setSubmittingPass(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Order cancelled successfully.", "info");
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, order_status: 'cancelled' } : o));
      } else {
        showToast(data.error || "Cannot cancel order.", "error");
      }
    } catch (err) {
      showToast("Failed to request cancellation.", "error");
    }
  };

  const handleDownloadInvoice = (order) => {
    // Generate text/plain or mock invoice file
    const invoiceContent = `===================================================
                  INVOICE RECEIPT
             RUDRAKSHA TEXTILES LUXURY WEAVES
===================================================
Invoice Date: ${new Date(order.created_at).toLocaleDateString()}
Order ID: #RT-${String(order.id).padStart(5, '0')}
Customer: ${order.name}
Email: ${order.email}
Phone: ${order.phone}
Address: ${order.address}

---------------------------------------------------
ITEMS ORDERED:
${order.items.map(item => `- ${item.product_name} (Size: ${item.size}, Color: ${item.color}) x ${item.quantity} - ₹${item.price.toLocaleString()}`).join('\n')}

---------------------------------------------------
Subtotal: ₹${order.subtotal.toLocaleString()}
Shipping Charges: ₹${order.shipping_charges.toLocaleString()}
GRAND TOTAL PAID: ₹${order.grand_total.toLocaleString()}

===================================================
          Thank you for choosing Rudraksha!
===================================================`;

    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice_RT_${String(order.id).padStart(5, '0')}.txt`;
    link.click();
    showToast("Invoice downloaded successfully!", "success");
  };

  const handleLogout = () => {
    logout();
    showToast("Logged out successfully.", "info");
    navigate('/');
  };

  if (!user) {
    return (
      <div className="profile-page-container">
        <div className="container text-center">
          <p>Loading dashboard details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page-container">
      <div className="container profile-grid">
        
        {/* Left Sidebar Navigation */}
        <aside className="profile-sidebar">
          <div className="profile-user-card">
            <div className="avatar-circle">
              {user.name.split(' ').map(n => n[0]).join('')}
            </div>
            <h3>{user.name}</h3>
            <span>{user.email}</span>
            {user.role === 'admin' && <span className="admin-badge">ADMINISTRATOR</span>}
          </div>

          <ul className="profile-sidebar-links">
            <li>
              <button 
                className={`sidebar-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                <ClipboardList size={18} />
                <span>My Orders</span>
              </button>
            </li>
            <li>
              <button 
                className={`sidebar-tab-btn ${activeTab === 'edit' ? 'active' : ''}`}
                onClick={() => setActiveTab('edit')}
              >
                <User size={18} />
                <span>Edit Profile</span>
              </button>
            </li>
            <li>
              <button 
                className={`sidebar-tab-btn ${activeTab === 'password' ? 'active' : ''}`}
                onClick={() => setActiveTab('password')}
              >
                <Lock size={18} />
                <span>Change Password</span>
              </button>
            </li>
            {user.role === 'admin' && (
              <li>
                <Link to="/admin" className="sidebar-tab-link">
                  <ShieldCheck size={18} />
                  <span>Admin Panel</span>
                </Link>
              </li>
            )}
            <li className="logout-li">
              <button className="sidebar-tab-btn logout-btn" onClick={handleLogout}>
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </li>
          </ul>
        </aside>

        {/* Right Content Tab display */}
        <main className="profile-main-content">
          
          {/* Tab 1: Orders History */}
          {activeTab === 'orders' && (
            <div className="tab-panel reveal active">
              <h2 className="tab-title">Order History</h2>
              <div className="title-underline" style={{ margin: '10px 0 30px 0' }}></div>

              {loadingOrders ? (
                <p>Loading order history...</p>
              ) : orders.length === 0 ? (
                <div className="empty-orders-view text-center">
                  <p>You haven't placed any orders yet.</p>
                  <Link to="/shop" className="btn btn-primary" style={{ marginTop: '20px' }}>Start Sourcing</Link>
                </div>
              ) : (
                <div className="orders-timeline-list">
                  {orders.map((order) => (
                    <div className="order-log-card" key={order.id}>
                      <div className="order-card-header">
                        <div>
                          <span className="order-id-label">Order Reference</span>
                          <span className="order-id-val">#RT-{String(order.id).padStart(5, '0')}</span>
                        </div>
                        <div className="order-date-status">
                          <span className="order-card-date">Placed: {new Date(order.created_at).toLocaleDateString()}</span>
                          <span className={`status-badge status-${order.order_status}`}>
                            {order.order_status}
                          </span>
                        </div>
                      </div>

                      {/* Items row list */}
                      <div className="order-card-items">
                        {order.items && order.items.map((item, idx) => (
                          <div className="ordered-item-row" key={idx}>
                            <div className="ordered-item-meta">
                              <strong>{item.product_name}</strong>
                              <span>Attributes: Size: {item.size} | Color: {item.color}</span>
                            </div>
                            <span className="ordered-item-qty">Qty: {item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      {/* Totals row */}
                      <div className="order-card-summary">
                        <div className="summary-numbers">
                          <span>Total Amount Paid:</span>
                          <strong>₹{order.grand_total.toLocaleString()}</strong>
                        </div>
                        
                        <div className="summary-actions">
                          {order.order_status === 'pending' && (
                            <button 
                              className="btn-order-cancel" 
                              onClick={() => handleCancelOrder(order.id)}
                            >
                              Cancel Order
                            </button>
                          )}
                          
                          <button 
                            className="btn-order-invoice"
                            onClick={() => handleDownloadInvoice(order)}
                          >
                            <FileDown size={14} style={{ marginRight: '6px' }} />
                            <span>Download Invoice</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Edit Profile */}
          {activeTab === 'edit' && (
            <div className="tab-panel reveal active">
              <h2 className="tab-title">Edit Profile Details</h2>
              <div className="title-underline" style={{ margin: '10px 0 30px 0' }}></div>

              <form onSubmit={handleProfileSubmit} className="profile-inputs-form">
                <div className="form-group">
                  <label className="form-label">Email Address (Cannot Change)</label>
                  <div className="auth-input-wrapper">
                    <Mail className="auth-icon-left" size={18} />
                    <input
                      type="email"
                      className="auth-input"
                      value={user.email}
                      disabled
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <div className="auth-input-wrapper">
                    <User className="auth-icon-left" size={18} />
                    <input
                      type="text"
                      className="auth-input"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <div className="auth-input-wrapper">
                    <Phone className="auth-icon-left" size={18} />
                    <input
                      type="tel"
                      className="auth-input"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="10-digit mobile number"
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary profile-submit-btn" disabled={submittingProfile}>
                  {submittingProfile ? "Saving changes..." : "Save Details"}
                </button>
              </form>
            </div>
          )}

          {/* Tab 3: Change Password */}
          {activeTab === 'password' && (
            <div className="tab-panel reveal active">
              <h2 className="tab-title">Update Account Password</h2>
              <div className="title-underline" style={{ margin: '10px 0 30px 0' }}></div>

              <form onSubmit={handlePassSubmit} className="profile-inputs-form">
                <div className="form-group">
                  <label className="form-label">Current Password *</label>
                  <div className="auth-input-wrapper">
                    <Lock className="auth-icon-left" size={18} />
                    <input
                      type="password"
                      className="auth-input"
                      placeholder="••••••••"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">New Password *</label>
                  <div className="auth-input-wrapper">
                    <Lock className="auth-icon-left" size={18} />
                    <input
                      type="password"
                      className="auth-input"
                      placeholder="Minimum 6 characters"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm New Password *</label>
                  <div className="auth-input-wrapper">
                    <Lock className="auth-icon-left" size={18} />
                    <input
                      type="password"
                      className="auth-input"
                      placeholder="Repeat new password"
                      value={passwordForm.confirmNewPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmNewPassword: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary profile-submit-btn" disabled={submittingPass}>
                  {submittingPass ? "Changing password..." : "Update Password"}
                </button>
              </form>
            </div>
          )}

        </main>

      </div>
    </div>
  );
}
