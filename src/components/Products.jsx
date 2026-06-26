import React, { useState } from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import './Products.css';

export default function Products() {
  const [activeFilter, setActiveFilter] = useState('all');

  const categories = [
    { id: 'all', name: 'All Collection' },
    { id: 'silk', name: 'Mulberry Silks' },
    { id: 'linen', name: 'Premium Linens' },
    { id: 'cotton', name: 'Egyptian Cottons' },
    { id: 'brocade', name: 'Royal Brocades' }
  ];

  const productsList = [
    {
      id: 1,
      title: "Mulberry Silk Brocade",
      category: "silk",
      image: "/silk.png",
      description: "Lustrous heavy silk woven with delicate gold Zari thread work, perfect for bridal wear and luxury apparel.",
      tags: ["100% Silk", "Handcrafted", "Gold Thread"]
    },
    {
      id: 2,
      title: "Belgian Flax Linen",
      category: "linen",
      image: "/linen.png",
      description: "Breathable, pre-washed organic linen with a soft vintage finish, suitable for premium casual wear and upholstery.",
      tags: ["Eco-friendly", "Pre-washed", "Belgian Flax"]
    },
    {
      id: 3,
      title: "Giza Egyptian Cotton",
      category: "cotton",
      image: "/cotton.png",
      description: "Extra-long staple Egyptian cotton. Exceptional durability, silky luster, and unmatched softness for luxury shirting.",
      tags: ["Threadcount 400+", "Giza Cotton", "Silky Touch"]
    },
    {
      id: 4,
      title: "Kashmiri Zari Brocade",
      category: "brocade",
      image: "/brocade.png",
      description: "Intricately detailed brocade fabric depicting traditional floral motifs with heavy golden metallic textures.",
      tags: ["Royal Heritage", "Metallic Sheen", "Heavy Weight"]
    },
    {
      id: 5,
      title: "Tussar Silk Dupion",
      category: "silk",
      image: "/silk.png",
      description: "Richly textured raw silk with a unique organic sheen. Lightweight yet holds structure beautifully.",
      tags: ["Wild Silk", "Textured Weave", "Natural Tone"]
    },
    {
      id: 6,
      title: "Irish Twill Linen",
      category: "linen",
      image: "/linen.png",
      description: "Heavyweight, crisp-structured twill weave linen offering structural luxury for custom suits and home furnishings.",
      tags: ["High Weight", "Structured Weave", "Pure Organic"]
    }
  ];

  const filteredProducts = activeFilter === 'all' 
    ? productsList 
    : productsList.filter(product => product.category === activeFilter);

  const handleInquireScroll = (e) => {
    e.preventDefault();
    const target = document.querySelector('#contact');
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
    <section id="products" className="section products-section">
      <div className="container">
        
        <div className="section-header reveal">
          <span className="section-subtitle">Our Catalog</span>
          <h2 className="section-title">The Signature Collection</h2>
          <p style={{ marginTop: '16px', color: 'var(--color-brown-subtle)' }}>
            Browse through our handpicked selections of premium wholesale and retail fabrics, 
            carefully crafted to deliver visual excellence and lasting durability.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="filters-container reveal delay-100">
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`filter-btn ${activeFilter === cat.id ? 'active' : ''}`}
              onClick={() => setActiveFilter(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="products-grid">
          {filteredProducts.map((product, idx) => (
            <div 
              className={`product-card reveal delay-${(idx % 3) * 100}`} 
              key={product.id}
            >
              <div className="product-image-container">
                <img 
                  src={product.image} 
                  alt={product.title} 
                  className="product-img"
                  loading="lazy"
                />
                <div className="product-category-badge">{product.category}</div>
              </div>
              
              <div className="product-info">
                <h3 className="product-title">{product.title}</h3>
                <p className="product-desc">{product.description}</p>
                
                <div className="product-tags">
                  {product.tags.map((tag, i) => (
                    <span className="product-tag" key={i}>{tag}</span>
                  ))}
                </div>
                
                <a 
                  href="#contact" 
                  onClick={handleInquireScroll} 
                  className="product-cta"
                >
                  <span>Request Quote</span>
                  <ArrowRight size={16} className="cta-arrow" />
                </a>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
