import React from 'react';
import { Crown, Truck, Globe, Award } from 'lucide-react';
import './About.css';

export default function About() {
  const highlights = [
    {
      icon: <Crown className="about-icon" />,
      title: "Luxurious Selection",
      description: "Sourced from the finest weaving mills globally, offering unparalleled quality and premium feel."
    },
    {
      icon: <Globe className="about-icon" />,
      title: "Global Distribution",
      description: "Supplying boutiques, fashion designers, and retail markets worldwide with efficient wholesale logistics."
    },
    {
      icon: <Truck className="about-icon" />,
      title: "Wholesale & Retail",
      description: "Flexible order volumes catering to individual custom designers and mass manufacturing operations."
    },
    {
      icon: <Award className="about-icon" />,
      title: "Timeless Quality",
      description: "Our strict quality controls ensure that every yard of fabric is inspected to preserve luxury standards."
    }
  ];

  return (
    <section id="about" className="section about-section">
      <div className="container">
        <div className="about-grid">
          
          {/* Left Column: Brand Story */}
          <div className="about-content reveal">
            <span className="section-subtitle text-left-subtitle">Our Legacy</span>
            <h2 className="about-title">Crafting Elegance Since 1996</h2>
            <div className="title-underline"></div>
            
            <p className="about-text">
              For three decades, Rudraksha Textiles has stood at the intersection of luxury, heritage, and modern craftsmanship. 
              We curate and supply the world’s most exquisite fabrics, serving as a trusted partner for elite designers, high-end boutiques, 
              and discerning individuals.
            </p>
            
            <p className="about-text highlight-text">
              Whether you are looking for premium wholesale bulk orders or selective retail yards for bespoke creations, 
              our collection offers uncompromised richness, variety, and texture.
            </p>

            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-number">30+</span>
                <span className="stat-label">Years Legacy</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">10k+</span>
                <span className="stat-label">Unique Patterns</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">500+</span>
                <span className="stat-label">Boutique Clients</span>
              </div>
            </div>
          </div>

          {/* Right Column: Value Grid */}
          <div className="about-cards reveal delay-200">
            <div className="cards-grid">
              {highlights.map((item, idx) => (
                <div className="highlight-card" key={idx}>
                  <div className="icon-wrapper">
                    {item.icon}
                  </div>
                  <h3 className="highlight-card-title">{item.title}</h3>
                  <p className="highlight-card-desc">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
