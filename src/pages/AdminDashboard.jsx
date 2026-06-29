import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { ShieldCheck, Plus, Pencil, Trash, Clipboard, Users, MessageCircle, BarChart3, Package, Check, X, Sparkles } from 'lucide-react';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const { token, isAdmin } = useAuth();
  const showToast = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('analytics');
  const [loading, setLoading] = useState(true);

  // Analytics states
  const [stats, setStats] = useState({
    totalSales: '0.00',
    productsCount: 0,
    ordersCount: 0,
    usersCount: 0,
    monthlyReport: []
  });

  // Catalog CRUD states
  const [products, setProducts] = useState([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '', category: 'silk', price: '', discount: '0',
    sizes: 'Standard,Custom', colors: 'Cream,Gold',
    description: '', fabric: '', occasion: '',
    care_instructions: 'Dry clean only.', stock_quantity: '10',
    delivery_info: 'Dispatched within 3 days.', images: '/silk.png'
  });

  // Orders dashboard state
  const [orders, setOrders] = useState([]);

  const API_URL = 'http://localhost:5000/api';

  // Protect Admin route
  useEffect(() => {
    if (!token || !isAdmin) {
      showToast("Access Denied. Admin privileges required.", "error");
      navigate('/');
    }
  }, [token, isAdmin, navigate]);

  // Load all dashboard components on tab select
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const headers = { 'Authorization': `Bearer ${token}` };

        // 1. Fetch Analytics
        if (activeTab === 'analytics') {
          const res = await fetch(`${API_URL}/admin/analytics`, { headers });
          const data = await res.json();
          if (res.ok) setStats(data.analytics);
        }

        // 2. Fetch Products
        if (activeTab === 'products') {
          const res = await fetch(`${API_URL}/products`);
          const data = await res.json();
          if (res.ok) setProducts(data.products || []);
        }

        // 3. Fetch Orders
        if (activeTab === 'orders') {
          const res = await fetch(`${API_URL}/admin/orders`, { headers });
          const data = await res.json();
          if (res.ok) setOrders(data.orders || []);
        }

      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [token, activeTab]);

  // CRUD: Handle Add or Edit Product Submit
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...productForm,
      price: parseFloat(productForm.price),
      discount: parseInt(productForm.discount),
      stock_quantity: parseInt(productForm.stock_quantity),
      images: productForm.images.split(',').map(img => img.trim())
    };

    try {
      const url = editingProduct 
        ? `${API_URL}/admin/products/${editingProduct.id}` 
        : `${API_URL}/admin/products`;
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok) {
        showToast(editingProduct ? "Product updated successfully!" : "Product registered successfully!", "success");
        setShowProductModal(false);
        setEditingProduct(null);
        resetProductForm();
        
        // Reload list
        const pRes = await fetch(`${API_URL}/products`);
        const pData = await pRes.json();
        if (pRes.ok) setProducts(pData.products || []);
      } else {
        showToast(data.error || "Failed to save product.", "error");
      }
    } catch (err) {
      showToast("Server communication error.", "error");
    }
  };

  const handleEditClick = (p) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name,
      category: p.category,
      price: String(p.price),
      discount: String(p.discount),
      sizes: p.sizes,
      colors: p.colors,
      description: p.description,
      fabric: p.fabric,
      occasion: p.occasion,
      care_instructions: p.care_instructions,
      stock_quantity: String(p.stock_quantity),
      delivery_info: p.delivery_info,
      images: p.images ? p.images.join(',') : (p.image || '')
    });
    setShowProductModal(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`${API_URL}/admin/products/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast("Product deleted successfully.", "info");
        setProducts(prev => prev.filter(p => p.id !== productId));
      }
    } catch (err) {
      showToast("Failed to delete product.", "error");
    }
  };

  const handleUpdateOrderStatus = async (orderId, nextStatus) => {
    try {
      const res = await fetch(`${API_URL}/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        showToast("Shipping tracking status updated!", "success");
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, order_status: nextStatus, payment_status: nextStatus === 'delivered' ? 'paid' : o.payment_status } : o));
      }
    } catch (err) {
      showToast("Failed to update status.", "error");
    }
  };

  const resetProductForm = () => {
    setProductForm({
      name: '', category: 'silk', price: '', discount: '0',
      sizes: 'Standard,Custom', colors: 'Cream,Gold',
      description: '', fabric: '', occasion: '',
      care_instructions: 'Dry clean only.', stock_quantity: '10',
      delivery_info: 'Dispatched within 3 days.', images: '/silk.png'
    });
  };

  const handleModalClose = () => {
    setShowProductModal(false);
    setEditingProduct(null);
    resetProductForm();
  };

  return (
    <div className="admin-dashboard-page">
      <div className="container admin-grid">
        
        {/* Navigation Sidebar */}
        <aside className="admin-sidebar">
          <div className="admin-title-card">
            <ShieldCheck size={28} className="shield-icon" />
            <div>
              <h3>Control Center</h3>
              <span>Rudraksha Admin</span>
            </div>
          </div>

          <ul className="admin-nav-tabs">
            <li>
              <button className={`admin-tab-btn ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
                <BarChart3 size={16} />
                <span>Analytics</span>
              </button>
            </li>
            <li>
              <button className={`admin-tab-btn ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>
                <Package size={16} />
                <span>Products List</span>
              </button>
            </li>
            <li>
              <button className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
                <Clipboard size={16} />
                <span>Orders Manager</span>
              </button>
            </li>
          </ul>
        </aside>

        {/* Tab display content */}
        <main className="admin-main-content">
          
          {/* Tab 1: Analytics */}
          {activeTab === 'analytics' && (
            <div className="admin-tab-panel">
              <h2 className="admin-tab-title">Sales Analytics</h2>
              <div className="title-underline" style={{ margin: '10px 0 30px 0' }}></div>

              {loading ? (
                <p>Calculating sales analytics...</p>
              ) : (
                <>
                  {/* Stats Grid */}
                  <div className="admin-stats-grid">
                    <div className="admin-stat-card">
                      <span className="stat-label">Total Revenue</span>
                      <strong className="stat-val">₹{parseFloat(stats.totalSales).toLocaleString()}</strong>
                    </div>
                    <div className="admin-stat-card">
                      <span className="stat-label">Total Orders</span>
                      <strong className="stat-val">{stats.ordersCount}</strong>
                    </div>
                    <div className="admin-stat-card">
                      <span className="stat-label">Products Active</span>
                      <strong className="stat-val">{stats.productsCount}</strong>
                    </div>
                    <div className="admin-stat-card">
                      <span className="stat-label">Total Customers</span>
                      <strong className="stat-val">{stats.usersCount}</strong>
                    </div>
                  </div>

                  {/* Revenue Chart (SVG based) */}
                  <div className="analytics-chart-box">
                    <h3>Revenue Growth Timeline</h3>
                    <div className="svg-chart-container">
                      <svg viewBox="0 0 600 220" className="revenue-svg-chart">
                        {/* Grid lines */}
                        <line x1="40" y1="20" x2="580" y2="20" stroke="#E2DDD5" strokeWidth="1" strokeDasharray="4" />
                        <line x1="40" y1="80" x2="580" y2="80" stroke="#E2DDD5" strokeWidth="1" strokeDasharray="4" />
                        <line x1="40" y1="140" x2="580" y2="140" stroke="#E2DDD5" strokeWidth="1" strokeDasharray="4" />
                        <line x1="40" y1="180" x2="580" y2="180" stroke="#E2DDD5" strokeWidth="1" />

                        {/* Chart Line path */}
                        <polyline
                          fill="none"
                          stroke="var(--color-gold)"
                          strokeWidth="3.5"
                          points="60,165 140,150 220,130 300,105 380,60 460,40"
                        />

                        {/* Node points */}
                        <circle cx="60" cy="165" r="5" fill="var(--color-gold)" />
                        <circle cx="140" cy="150" r="5" fill="var(--color-gold)" />
                        <circle cx="220" cy="130" r="5" fill="var(--color-gold)" />
                        <circle cx="300" cy="105" r="5" fill="var(--color-gold)" />
                        <circle cx="380" cy="60" r="5" fill="var(--color-gold)" />
                        <circle cx="460" cy="40" r="5" fill="var(--color-gold)" />

                        {/* Labels */}
                        {stats.monthlyReport && stats.monthlyReport.map((item, idx) => (
                          <text key={idx} x={60 + (idx * 80)} y="205" className="chart-label-text" textAnchor="middle">
                            {item.month}
                          </text>
                        ))}
                      </svg>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Tab 2: Products List (CRUD) */}
          {activeTab === 'products' && (
            <div className="admin-tab-panel">
              <div className="tab-header-row">
                <h2 className="admin-tab-title">Product Catalog</h2>
                <button className="btn btn-primary add-product-btn" onClick={() => setShowProductModal(true)}>
                  <Plus size={16} style={{ marginRight: '6px' }} />
                  <span>Add Product</span>
                </button>
              </div>
              <div className="title-underline" style={{ margin: '10px 0 30px 0' }}></div>

              {loading ? (
                <p>Loading products list...</p>
              ) : (
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Image</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(p => (
                        <tr key={p.id}>
                          <td>
                            <img src={p.images && p.images.length > 0 ? p.images[0] : (p.image || '/silk.png')} alt={p.name} className="table-thumb" />
                          </td>
                          <td className="table-name-cell"><strong>{p.name}</strong><br /><span className="table-sub-detail">{p.fabric}</span></td>
                          <td className="text-uppercase">{p.category}</td>
                          <td>₹{p.price.toLocaleString()} ({p.discount}% Off)</td>
                          <td>{p.stock_quantity} units</td>
                          <td>
                            <div className="table-actions">
                              <button className="table-btn-edit" onClick={() => handleEditClick(p)} aria-label="Edit">
                                <Pencil size={14} />
                              </button>
                              <button className="table-btn-delete" onClick={() => handleDeleteProduct(p.id)} aria-label="Delete">
                                <Trash size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Orders Manager */}
          {activeTab === 'orders' && (
            <div className="admin-tab-panel">
              <h2 className="admin-tab-title">Orders Manager</h2>
              <div className="title-underline" style={{ margin: '10px 0 30px 0' }}></div>

              {loading ? (
                <p>Loading orders logs...</p>
              ) : (
                <div className="admin-orders-manager-list">
                  {orders.map(order => (
                    <div className="admin-order-log-card" key={order.id}>
                      <div className="admin-order-card-header">
                        <div>
                          <strong>#RT-{String(order.id).padStart(5, '0')}</strong>
                          <span className="order-time-text">Placed on: {new Date(order.created_at).toLocaleString()}</span>
                        </div>
                        
                        <div className="status-controller-wrapper">
                          <select 
                            className="order-status-selector" 
                            value={order.order_status}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>

                      <div className="admin-order-body">
                        {/* Address */}
                        <div className="admin-order-address-box">
                          <h4>Delivery Destination</h4>
                          <p><strong>Name:</strong> {order.name}</p>
                          <p><strong>Phone:</strong> {order.phone}</p>
                          <p><strong>Email:</strong> {order.email}</p>
                          <p><strong>Address:</strong> {order.address}</p>
                          <p><strong>Payment Method:</strong> {order.payment_method.toUpperCase()} ({order.payment_status === 'paid' ? 'Paid' : 'Pending'})</p>
                        </div>

                        {/* Items */}
                        <div className="admin-order-items-box">
                          <h4>Items Ordered</h4>
                          <ul className="admin-order-items-list">
                            {order.items && order.items.map((item, idx) => (
                              <li key={idx}>
                                <span>{item.product_name} (Size: {item.size} | Color: {item.color})</span>
                                <strong>Qty: {item.quantity}</strong>
                              </li>
                            ))}
                          </ul>
                          
                          <div className="admin-order-grand-total">
                            <span>Grand Total:</span>
                            <strong>₹{order.grand_total.toLocaleString()}</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </main>

      </div>

      {/* Product ADD / EDIT Modal popup */}
      {showProductModal && (
        <div className="modal-overlay" onClick={handleModalClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingProduct ? "Modify Fabric Specifications" : "Register New Fabric"}</h3>
              <button className="modal-close" onClick={handleModalClose} aria-label="Close modal">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleProductSubmit} className="modal-form-grid">
              <div className="form-group span-2">
                <label className="form-label">Product/Fabric Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={productForm.name}
                  onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select 
                    className="form-input"
                    value={productForm.category}
                    onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                  >
                    <option value="silk">Silk</option>
                    <option value="linen">Linen</option>
                    <option value="cotton">Cotton</option>
                    <option value="brocade">Brocade</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Base Price (₹) *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={productForm.price}
                    onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Discount (%)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={productForm.discount}
                    onChange={(e) => setProductForm(prev => ({ ...prev, discount: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Stock Units *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={productForm.stock_quantity}
                    onChange={(e) => setProductForm(prev => ({ ...prev, stock_quantity: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Fabric Blend *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={productForm.fabric}
                    onChange={(e) => setProductForm(prev => ({ ...prev, fabric: e.target.value }))}
                    placeholder="e.g. Mulberry Silk"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Occasion *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={productForm.occasion}
                    onChange={(e) => setProductForm(prev => ({ ...prev, occasion: e.target.value }))}
                    placeholder="e.g. Bridal, Festive"
                    required
                  />
                </div>
              </div>

              <div className="form-group span-2">
                <label className="form-label">Sizes (comma-separated list) *</label>
                <input
                  type="text"
                  className="form-input"
                  value={productForm.sizes}
                  onChange={(e) => setProductForm(prev => ({ ...prev, sizes: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group span-2">
                <label className="form-label">Colors (comma-separated list) *</label>
                <input
                  type="text"
                  className="form-input"
                  value={productForm.colors}
                  onChange={(e) => setProductForm(prev => ({ ...prev, colors: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group span-2">
                <label className="form-label">Image URLs (comma-separated list) *</label>
                <input
                  type="text"
                  className="form-input"
                  value={productForm.images}
                  onChange={(e) => setProductForm(prev => ({ ...prev, images: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group span-2">
                <label className="form-label">Product Description *</label>
                <textarea
                  className="form-input form-textarea"
                  rows="3"
                  value={productForm.description}
                  onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                  required
                ></textarea>
              </div>

              <button type="submit" className="btn btn-primary span-2 modal-submit-btn">
                {editingProduct ? "Save Product Specifications" : "Register Product"}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
