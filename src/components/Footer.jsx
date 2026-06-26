import React, { useState } from 'react';
import { Sparkles, ArrowUp } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  const handleScrollToTop = (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleLinkClick = (e, href) => {
    e.preventDefault();
    const targetSection = document.querySelector(href);
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
  };

  return (
    <footer className="footer-section">
      <div className="container">
        
        {/* Top Footer Section */}
        <div className="footer-grid">
          
          {/* Column 1: Brand Details */}
          <div className="footer-col brand-col">
            <a href="#home" onClick={handleScrollToTop} className="footer-brand">
              <Sparkles className="footer-brand-icon" />
              <div className="brand-text">
                <span className="footer-brand-title">RUDRAKSHA</span>
                <span className="footer-brand-subtitle">TEXTILES</span>
              </div>
            </a>
            <p className="footer-desc">
              Pioneers in luxury textile distribution. Curating and supplying premium fabrics for retail designers and wholesale apparel markets globally.
            </p>
            <div className="social-links">
              <a href="#" aria-label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="social-icon">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a href="#" aria-label="Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="social-icon">
                  <path d="M18 2h-3a5 5 0 0 0 -5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              <a href="#" aria-label="LinkedIn">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="social-icon">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0 -2 -2 2 2 0 0 0 -2 2v7h-4v-7a6 6 0 0 1 6 -6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="footer-col">
            <h4 className="footer-heading">Sitemap</h4>
            <ul className="footer-links">
              <li><a href="#home" onClick={handleScrollToTop}>Home</a></li>
              <li><a href="#about" onClick={(e) => handleLinkClick(e, '#about')}>About Us</a></li>
              <li><a href="#products" onClick={(e) => handleLinkClick(e, '#products')}>Products</a></li>
              <li><a href="#gallery" onClick={(e) => handleLinkClick(e, '#gallery')}>Textile Gallery</a></li>
              <li><a href="#contact" onClick={(e) => handleLinkClick(e, '#contact')}>Inquiries</a></li>
            </ul>
          </div>

          {/* Column 3: Fabric collection categories */}
          <div className="footer-col">
            <h4 className="footer-heading">Fabrics</h4>
            <ul className="footer-links">
              <li><a href="#products" onClick={(e) => handleLinkClick(e, '#products')}>Mulberry Silk</a></li>
              <li><a href="#products" onClick={(e) => handleLinkClick(e, '#products')}>Belgian Linen</a></li>
              <li><a href="#products" onClick={(e) => handleLinkClick(e, '#products')}>Egyptian Cotton</a></li>
              <li><a href="#products" onClick={(e) => handleLinkClick(e, '#products')}>Heritage Brocade</a></li>
              <li><a href="#products" onClick={(e) => handleLinkClick(e, '#products')}>Raw Dupion Silk</a></li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="footer-col newsletter-col">
            <h4 className="footer-heading">Newsletter</h4>
            <p className="newsletter-text">
              Subscribe to receive updates on fresh fabric arrivals, heritage swatch drops, and seasonal catalogs.
            </p>
            
            {subscribed ? (
              <p className="subscription-success">Thank you for subscribing!</p>
            ) : (
              <form onSubmit={handleSubscribe} className="newsletter-form">
                <input
                  type="email"
                  className="newsletter-input"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit" className="newsletter-submit">Join</button>
              </form>
            )}
          </div>

        </div>

        {/* Bottom Footer Section */}
        <div className="footer-bottom">
          <p className="copyright">
            &copy; {new Date().getFullYear()} Rudraksha Textiles. All Rights Reserved.
          </p>
          <a href="#home" onClick={handleScrollToTop} className="back-to-top" aria-label="Scroll to top">
            <span>Back to Top</span>
            <ArrowUp size={16} />
          </a>
        </div>

      </div>
    </footer>
  );
}
