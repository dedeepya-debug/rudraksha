import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Import Contexts
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { ToastProvider } from './contexts/ToastContext';

// Import Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Import Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';
import AdminDashboard from './pages/AdminDashboard';
import Contact from './pages/Contact';

// Scroll To Top on route change helper
function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return null;
}

// Protected Route Guard for Admin Panel
function ProtectedAdminRoute({ children }) {
  const { token, isAdmin, loading } = useAuth();

  if (loading) {
    return <div className="section text-center"><p>Verifying access privileges...</p></div>;
  }

  if (!token || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

// Protected Route Guard for Profile/Checkout
function ProtectedUserRoute({ children }) {
  const { token, loading } = useAuth();

  if (loading) {
    return <div className="section text-center"><p>Verifying session details...</p></div>;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  // Setup reveal transitions observer
  useEffect(() => {
    const revealElements = document.querySelectorAll('.reveal');
    const observerOptions = {
      root: null,
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    revealElements.forEach(element => {
      revealObserver.observe(element);
    });

    return () => {
      revealElements.forEach(element => {
        revealObserver.unobserve(element);
      });
    };
  }, []);

  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <ScrollToTop />
            <Navbar />
            
            <main style={{ minHeight: 'calc(100vh - 400px)' }}>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                
                {/* Shopping Cart & Wishlist */}
                <Route path="/cart" element={<Cart />} />
                <Route path="/wishlist" element={<Wishlist />} />

                {/* Protected checkout & profile routes */}
                <Route path="/checkout" element={
                  <ProtectedUserRoute>
                    <Checkout />
                  </ProtectedUserRoute>
                } />
                <Route path="/order-success/:id" element={
                  <ProtectedUserRoute>
                    <OrderSuccess />
                  </ProtectedUserRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedUserRoute>
                    <Profile />
                  </ProtectedUserRoute>
                } />
                
                {/* Redirect /orders to Profile Order timeline */}
                <Route path="/orders" element={<Navigate to="/profile" replace />} />

                {/* Protected Admin Routes */}
                <Route path="/admin" element={
                  <ProtectedAdminRoute>
                    <AdminDashboard />
                  </ProtectedAdminRoute>
                } />

                {/* Fallback redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            <Footer />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}