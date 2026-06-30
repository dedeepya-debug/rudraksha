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
    } else {
      setTimeout(() => {
        const target = document.querySelector(hash);
        if (target) {
          const offset = 80; // height of sticky nav
          const bodyRect = document.body.getBoundingClientRect().top;
          const elementRect = target.getBoundingClientRect().top;
          const elementPosition = elementRect - bodyRect;
          const offsetPosition = elementPosition - offset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 300);
    }
  }, [pathname, hash]);

  return null;
}

// Reveal transitions manager on page change
function RevealObserver() {
  const { pathname } = useLocation();

  useEffect(() => {
    let observers = [];
    
    const timer = setTimeout(() => {
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
        observers.push({ element, observer: revealObserver });
      });
    }, 200);

    return () => {
      clearTimeout(timer);
      observers.forEach(({ element, observer }) => {
        observer.unobserve(element);
      });
    };
  }, [pathname]);

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
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <ScrollToTop />
            <RevealObserver />
            <Navbar />
            
            <main style={{ minHeight: 'calc(100vh - 400px)' }}>
              <Routes>
                {/* Protected catalog and core routes */}
                <Route path="/" element={
                  <ProtectedUserRoute>
                    <Home />
                  </ProtectedUserRoute>
                } />
                <Route path="/shop" element={
                  <ProtectedUserRoute>
                    <Shop />
                  </ProtectedUserRoute>
                } />
                <Route path="/product/:id" element={
                  <ProtectedUserRoute>
                    <ProductDetails />
                  </ProtectedUserRoute>
                } />
                <Route path="/contact" element={
                  <ProtectedUserRoute>
                    <Contact />
                  </ProtectedUserRoute>
                } />
                
                {/* Auth routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                
                {/* Shopping Cart & Wishlist (Protected) */}
                <Route path="/cart" element={
                  <ProtectedUserRoute>
                    <Cart />
                  </ProtectedUserRoute>
                } />
                <Route path="/wishlist" element={
                  <ProtectedUserRoute>
                    <Wishlist />
                  </ProtectedUserRoute>
                } />

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