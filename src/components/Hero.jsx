import React from 'react';
import { ArrowDown } from 'lucide-react';
import './Hero.css';

export default function Hero() {
  const handleScrollTo = (e, targetId) => {
    e.preventDefault();
    const target = document.querySelector(targetId);
    if (target) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = target.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section id="home" className="hero-section">
      <div className="hero-bg-overlay"></div>
      
      <div className="container hero-container">
        <div className="hero-content">
          <span className="hero-tagline reveal active">Wholesale & Retail Luxury</span>
          <h1 className="hero-title reveal active delay-100">
            Premium Fabrics <br />
            <span className="gold-text">for Every Occasion</span>
          </h1>
          <p className="hero-description reveal active delay-200">
            Experience the artistry of heritage textiles. From fine bridal silks to pure organic linens, 
            Rudraksha Textiles curates premium global fabrics designed for timeless elegance and bespoke creation.
          </p>
          <div className="hero-actions reveal active delay-300">
            <a 
              href="#products" 
              onClick={(e) => handleScrollTo(e, '#products')} 
              className="btn btn-primary"
            >
              Explore Collection
            </a>
            <a 
              href="#contact" 
              onClick={(e) => handleScrollTo(e, '#contact')} 
              className="btn btn-secondary"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>

      <a 
        href="#about" 
        onClick={(e) => handleScrollTo(e, '#about')} 
        className="hero-scroll-indicator float-animation"
        aria-label="Scroll to About Section"
      >
        <span className="scroll-text">Discover More</span>
        <ArrowDown size={18} />
      </a>
    </section>
  );
}
