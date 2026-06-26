import React, { useState, useEffect } from 'react';
import { Menu, X, Sparkles } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About Us', href: '#about' },
    { name: 'Products', href: '#products' },
    { name: 'Gallery', href: '#gallery' },
    { name: 'Contact', href: '#contact' }
  ];

  useEffect(() => {
    const handleScroll = () => {
      // Toggle sticky background
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // Track active section on scroll
      const sections = navLinks.map(link => document.querySelector(link.href));
      const scrollPosition = window.scrollY + 120; // offset for nav bar

      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        if (section) {
          const top = section.offsetTop;
          const height = section.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(navLinks[i].href.substring(1));
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = (e, href) => {
    e.preventDefault();
    setIsOpen(false);
    
    const targetSection = document.querySelector(href);
    if (targetSection) {
      const offset = 80; // height of sticky nav
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = targetSection.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setActiveSection(href.substring(1));
    }
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container nav-container">
        <a href="#home" onClick={(e) => handleLinkClick(e, '#home')} className="nav-brand">
          <Sparkles className="brand-icon" />
          <div className="brand-text">
            <span className="brand-title">RUDRAKSHA</span>
            <span className="brand-subtitle">TEXTILES</span>
          </div>
        </a>

        {/* Desktop Navigation */}
        <ul className="nav-menu">
          {navLinks.map((link) => (
            <li key={link.name} className="nav-item">
              <a
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className={`nav-link ${activeSection === link.href.substring(1) ? 'active' : ''}`}
              >
                {link.name}
              </a>
            </li>
          ))}
        </ul>

        {/* CTA Button (Desktop) */}
        <div className="nav-cta">
          <a href="#contact" onClick={(e) => handleLinkClick(e, '#contact')} className="btn-nav">
            Inquire Now
          </a>
        </div>

        {/* Mobile Menu Icon */}
        <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      <div className={`mobile-menu ${isOpen ? 'open' : ''}`}>
        <ul className="mobile-menu-links">
          {navLinks.map((link) => (
            <li key={link.name}>
              <a
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className={`mobile-nav-link ${activeSection === link.href.substring(1) ? 'active' : ''}`}
              >
                {link.name}
              </a>
            </li>
          ))}
          <li className="mobile-cta-li">
            <a href="#contact" onClick={(e) => handleLinkClick(e, '#contact')} className="btn-mobile-nav">
              Inquire Now
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
}
