import React, { useState } from 'react';
import { X, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';
import './Gallery.css';

export default function Gallery() {
  const [selectedImgIdx, setSelectedImgIdx] = useState(null);

  const galleryItems = [
    {
      id: 1,
      image: "/gallery-1.jpg",
      title: "Cream Georgette Zari",
      subtitle: "Sheer cream weave paired with a deep crimson border"
    },
    {
      id: 2,
      image: "/gallery-2.jpg",
      title: "Royal Indigo Banarasi",
      subtitle: "Traditional gold bootis woven on luxury blue and crimson silk"
    },
    {
      id: 3,
      image: "/gallery-3.jpg",
      title: "Bespoke Printed Linen",
      subtitle: "Hand-printed heritage motifs on lightweight linen with tassels"
    },
    {
      id: 4,
      image: "/gallery-4.jpg",
      title: "Vibrant Heritage Silks",
      subtitle: "A showcase of premium dyed silks in custom royal shades"
    }
  ];

  const handleOpenLightbox = (index) => {
    setSelectedImgIdx(index);
    document.body.style.overflow = 'hidden';
  };

  const handleCloseLightbox = () => {
    setSelectedImgIdx(null);
    document.body.style.overflow = 'auto';
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setSelectedImgIdx((prev) => (prev === 0 ? galleryItems.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setSelectedImgIdx((prev) => (prev === galleryItems.length - 1 ? 0 : prev + 1));
  };

  return (
    <section id="gallery" className="section gallery-section">
      <div className="container">
        
        <div className="section-header reveal">
          <span className="section-subtitle">Visual Experience</span>
          <h2 className="section-title">The Textile Gallery</h2>
          <p style={{ marginTop: '16px', color: 'var(--color-brown-subtle)' }}>
            Exquisite detail and high-definition closeups of our fine weaves, showcasing the luxury and weight of each premium textile.
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="gallery-grid reveal delay-100">
          {galleryItems.map((item, index) => (
            <div 
              className="gallery-card" 
              key={item.id}
              onClick={() => handleOpenLightbox(index)}
            >
              <img 
                src={item.image} 
                alt={item.title} 
                className="gallery-img"
                loading="lazy"
              />
              <div className="gallery-hover-overlay">
                <ZoomIn className="zoom-icon" size={28} />
                <div className="gallery-card-text">
                  <h3 className="gallery-item-title">{item.title}</h3>
                  <p className="gallery-item-sub">{item.subtitle}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Lightbox Modal */}
      {selectedImgIdx !== null && (
        <div className="lightbox-overlay" onClick={handleCloseLightbox}>
          <button className="lightbox-close" onClick={handleCloseLightbox} aria-label="Close lightbox">
            <X size={30} />
          </button>
          
          <button className="lightbox-nav lightbox-left" onClick={handlePrev} aria-label="Previous image">
            <ChevronLeft size={36} />
          </button>
          
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img 
              src={galleryItems[selectedImgIdx].image} 
              alt={galleryItems[selectedImgIdx].title} 
              className="lightbox-img"
            />
            <div className="lightbox-caption">
              <h3>{galleryItems[selectedImgIdx].title}</h3>
              <p>{galleryItems[selectedImgIdx].subtitle}</p>
            </div>
          </div>
          
          <button className="lightbox-nav lightbox-right" onClick={handleNext} aria-label="Next image">
            <ChevronRight size={36} />
          </button>
        </div>
      )}
    </section>
  );
}
