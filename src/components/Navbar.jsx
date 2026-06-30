import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Sparkles, Heart, ShoppingBag, User, LogOut, ShieldCheck, ClipboardList } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import './Navbar.css';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { wishlist } = useWishlist();
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { name: 'Home', path: '/', hash: '#home' },
    { name: 'About Us', path: '/', hash: '#about' },
    { name: 'Products', path: '/', hash: '#products' },
    { name: 'Gallery', path: '/', hash: '#gallery' },
    { name: 'Shop', path: '/shop', hash: '' },
    { name: 'Contact', path: '/contact', hash: '' }
  ];

  const [activeSection, setActiveSection] = useState('home');

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      if (location.pathname === '/') {
        const sections = ['home', 'about', 'products', 'gallery'];
        const scrollPosition = window.scrollY + 120;

        for (const sectionId of sections) {
          const el = document.getElementById(sectionId);
          if (el) {
            const top = el.offsetTop;
            const height = el.offsetHeight;
            if (scrollPosition >= top && scrollPosition < top + height) {
              setActiveSection(sectionId);
              break;
            }
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  const isLinkActive = (link) => {
    if (location.pathname !== link.path) return false;
    if (link.hash) {
      return activeSection === link.hash.substring(1);
    }
    return true;
  };

  const handleLinkClick = (e, link) => {
    setIsOpen(false);
    
    // If we are already on the page that matches the path
    if (location.pathname === link.path && link.hash) {
      e.preventDefault();
      const targetSection = document.querySelector(link.hash);
      if (targetSection) {
        const offset = 80;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = targetSection.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
  };

  const handleLogoutClick = () => {
    logout();
    setShowDropdown(false);
    navigate('/');
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container nav-container">
        
        {/* Brand Logo */}
        <Link to="/" className="nav-brand">
          <Sparkles className="brand-icon" />
          <div className="brand-text">
            <span className="brand-title">RUDRAKSHA</span>
            <span className="brand-subtitle">TEXTILES</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <ul className="nav-menu">
          {navLinks.map((link) => (
            <li key={link.name} className="nav-item">
              {link.hash ? (
                <a
                  href={`${link.path}${link.hash}`}
                  onClick={(e) => handleLinkClick(e, link)}
                  className={`nav-link ${isLinkActive(link) ? 'active' : ''}`}
                >
                  {link.name}
                </a>
              ) : (
                <Link to={link.path} className={`nav-link ${isLinkActive(link) ? 'active' : ''}`}>
                  {link.name}
                </Link>
              )}
            </li>
          ))}
        </ul>

        {/* E-Commerce Icons & Auth */}
        <div className="nav-actions-group">
          {/* Wishlist Icon */}
          <Link to="/wishlist" className="nav-icon-btn" aria-label="Wishlist">
            <Heart size={20} />
            {wishlist.length > 0 && <span className="nav-badge">{wishlist.length}</span>}
          </Link>

          {/* Cart Icon */}
          <Link to="/cart" className="nav-icon-btn" aria-label="Shopping Cart">
            <ShoppingBag size={20} />
            {cartCount > 0 && <span className="nav-badge">{cartCount}</span>}
          </Link>

          {/* User Auth Dropdown / Buttons */}
          {user ? (
            <div className="profile-dropdown-wrapper" ref={dropdownRef}>
              <button 
                className="profile-toggle-btn" 
                onClick={() => setShowDropdown(!showDropdown)}
                aria-label="User profile dropdown"
              >
                <div className="nav-avatar">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </div>
              </button>

              {showDropdown && (
                <div className="nav-dropdown-menu">
                  <div className="dropdown-header">
                    <h4>{user.name}</h4>
                    <span>{user.email}</span>
                  </div>
                  <hr className="dropdown-divider" />
                  <Link to="/profile" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                    <ClipboardList size={16} />
                    <span>My Orders</span>
                  </Link>
                  <Link to="/profile" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                    <User size={16} />
                    <span>My Profile</span>
                  </Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                      <ShieldCheck size={16} />
                      <span>Admin Control</span>
                    </Link>
                  )}
                  <hr className="dropdown-divider" />
                  <button className="dropdown-item logout-item-btn" onClick={handleLogoutClick}>
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="nav-auth-buttons">
              <Link to="/login" className="btn-login-nav">Sign In</Link>
              <Link to="/signup" className="btn-signup-nav">Register</Link>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      <div className={`mobile-menu ${isOpen ? 'open' : ''}`}>
        <ul className="mobile-menu-links">
          {navLinks.map((link) => (
            <li key={link.name}>
              {link.hash ? (
                <a
                  href={`${link.path}${link.hash}`}
                  onClick={(e) => handleLinkClick(e, link)}
                  className={`mobile-nav-link ${isLinkActive(link) ? 'active' : ''}`}
                >
                  {link.name}
                </a>
              ) : (
                <Link to={link.path} className={`mobile-nav-link ${isLinkActive(link) ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
                  {link.name}
                </Link>
              )}
            </li>
          ))}
          
          <hr className="dropdown-divider" style={{ width: '80%', margin: '10px auto' }} />
          
          {user ? (
            <>
              <li>
                <Link to="/profile" className="mobile-nav-link" onClick={() => setIsOpen(false)}>
                  My Account
                </Link>
              </li>
              {user.role === 'admin' && (
                <li>
                  <Link to="/admin" className="mobile-nav-link" onClick={() => setIsOpen(false)}>
                    Admin Dashboard
                  </Link>
                </li>
              )}
              <li style={{ marginTop: '16px' }}>
                <button className="btn-mobile-nav" onClick={handleLogoutClick}>
                  Sign Out
                </button>
              </li>
            </>
          ) : (
            <li className="mobile-cta-li">
              <Link to="/login" className="btn-mobile-nav" onClick={() => setIsOpen(false)}>
                Sign In
              </Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}
