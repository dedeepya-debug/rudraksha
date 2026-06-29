import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useToast } from '../contexts/ToastContext';
import { Search, Heart, ShoppingBag, Eye, SlidersHorizontal, ArrowUpDown, X } from 'lucide-react';
import './Shop.css';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Search and Suggestion states
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Filter states
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [fabric, setFabric] = useState('');
  const [occasion, setOccasion] = useState('');
  const [color, setColor] = useState('');
  const [sort, setSort] = useState('newest');

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const showToast = useToast();

  const API_URL = 'http://localhost:5000/api';

  const fabricsList = ["Mulberry Silk", "Silk Georgette", "Katan Silk", "Organic Flax Linen", "Egyptian Cotton"];
  const occasionsList = ["Wedding", "Bridal", "Ceremony", "Festive", "Casual", "Formal"];
  const colorsList = ["Cream", "Gold", "Royal Blue", "Crimson", "Off-White", "Pure White"];

  // Fetch products based on parameters
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (searchQuery) queryParams.append('search', searchQuery);
        if (category && category !== 'all') queryParams.append('category', category);
        if (fabric) queryParams.append('fabric', fabric);
        if (occasion) queryParams.append('occasion', occasion);
        if (color) queryParams.append('color', color);
        queryParams.append('sort', sort);

        const res = await fetch(`${API_URL}/products?${queryParams.toString()}`);
        const data = await res.json();
        if (res.ok) {
          setProducts(data.products);
        }
      } catch (err) {
        console.error("Failed to load catalog:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [searchQuery, category, fabric, occasion, color, sort]);

  // Live Suggestions logic
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      // Find matching items from local cache or pre-defined queries
      const matches = [];
      const queryLower = searchQuery.toLowerCase();

      // Suggest fabrics, occasions, categories or names
      if ("mulberry silk".includes(queryLower)) matches.push("Mulberry Silk");
      if ("linen".includes(queryLower)) matches.push("Organic Linen");
      if ("cotton".includes(queryLower)) matches.push("Egyptian Cotton");
      if ("wedding".includes(queryLower)) matches.push("Wedding Wear");
      if ("banarasi".includes(queryLower)) matches.push("Banarasi Brocade");
      
      products.forEach(p => {
        if (p.name.toLowerCase().includes(queryLower) && !matches.includes(p.name)) {
          matches.push(p.name);
        }
      });

      setSuggestions(matches.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  }, [searchQuery, products]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setShowSuggestions(false);
    setSearchParams({ search: searchQuery, category });
  };

  const handleSuggestionClick = (val) => {
    setSearchQuery(val);
    setShowSuggestions(false);
    setSearchParams({ search: val, category });
  };

  const handleAddToCart = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const selectedSize = product.sizes.split(',')[0];
      const selectedColor = product.colors.split(',')[0];
      await addToCart(product, selectedSize, selectedColor, 1);
      showToast(`${product.name} added to cart!`, "success");
    } catch (err) {
      showToast("Failed to add product to cart.", "error");
    }
  };

  const handleWishlistToggle = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    const state = await toggleWishlist(product);
    if (state === 'added') {
      showToast("Added to wishlist!", "success");
    } else {
      showToast("Removed from wishlist.", "info");
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setCategory('all');
    setFabric('');
    setOccasion('');
    setColor('');
    setSort('newest');
    setSearchParams({});
  };

  return (
    <div className="shop-page-container">
      {/* 1. Header Banner */}
      <div className="shop-banner">
        <div className="container">
          <span className="section-subtitle">Exquisite Weaves</span>
          <h1 className="shop-banner-title">Heritage Fabrics</h1>
          <p className="shop-banner-desc">Explore our premium catalog of silks, cottons, linens, and brocades sourced globally.</p>
        </div>
      </div>

      <div className="container shop-body-grid">
        
        {/* 2. Left Sidebar (Desktop Filters) */}
        <aside className={`shop-sidebar ${showFiltersMobile ? 'mobile-open' : ''}`}>
          <div className="sidebar-header">
            <h3>Filters</h3>
            <button className="mobile-close-btn" onClick={() => setShowFiltersMobile(false)}>
              <X size={20} />
            </button>
          </div>

          <div className="filter-group">
            <h4 className="filter-label">Categories</h4>
            <ul className="filter-options">
              {['all', 'silk', 'linen', 'cotton', 'brocade'].map(cat => (
                <li key={cat}>
                  <button 
                    className={`filter-btn-text ${category === cat ? 'active' : ''}`}
                    onClick={() => { setCategory(cat); setSearchParams({ search: searchQuery, category: cat }); }}
                  >
                    {cat.toUpperCase()}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="filter-group">
            <h4 className="filter-label">Occasion</h4>
            <select className="filter-select" value={occasion} onChange={(e) => setOccasion(e.target.value)}>
              <option value="">All Occasions</option>
              {occasionsList.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <h4 className="filter-label">Fabric Material</h4>
            <select className="filter-select" value={fabric} onChange={(e) => setFabric(e.target.value)}>
              <option value="">All Materials</option>
              {fabricsList.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <h4 className="filter-label">Colors</h4>
            <select className="filter-select" value={color} onChange={(e) => setColor(e.target.value)}>
              <option value="">All Colors</option>
              {colorsList.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <button className="btn btn-outline reset-filters-btn" onClick={resetFilters}>
            Clear All
          </button>
        </aside>

        {/* 3. Right Content Area */}
        <main className="shop-main-content">
          
          {/* Top Search & Sorting Bar */}
          <div className="shop-controls-bar">
            {/* Search Input with suggestions */}
            <form onSubmit={handleSearchSubmit} className="shop-search-form">
              <input
                type="text"
                className="shop-search-input"
                placeholder="Search catalog (name, fabric, occasion...)"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              />
              <button type="submit" className="shop-search-submit-btn" aria-label="Submit search">
                <Search size={18} />
              </button>

              {/* Suggestions Overlay */}
              {showSuggestions && suggestions.length > 0 && (
                <ul className="search-suggestions-overlay">
                  {suggestions.map((item, index) => (
                    <li key={index} className="suggestion-item" onClick={() => handleSuggestionClick(item)}>
                      <Search size={12} className="suggestion-icon" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </form>

            <div className="shop-sort-controls">
              <button className="mobile-filter-trigger" onClick={() => setShowFiltersMobile(true)}>
                <SlidersHorizontal size={18} />
                <span>Filters</span>
              </button>
              
              <div className="sort-dropdown-wrapper">
                <ArrowUpDown size={16} className="sort-icon" />
                <select className="sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="newest">Sort By: Newest</option>
                  <option value="priceLow">Price: Low to High</option>
                  <option value="priceHigh">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Product Cards Grid */}
          {loading ? (
            <div className="shop-loading-grid">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div className="skeleton-card" key={idx}>
                  <div className="skeleton-img"></div>
                  <div className="skeleton-text skeleton-title"></div>
                  <div className="skeleton-text skeleton-price"></div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="empty-catalog-message">
              <h3>No Weaves Found</h3>
              <p>We couldn't find any products matching your search filters. Try modifying your search criteria or resetting filters.</p>
              <button className="btn btn-primary" onClick={resetFilters}>Reset Search</button>
            </div>
          ) : (
            <div className="shop-products-grid">
              {products.map(product => {
                const finalPrice = product.price * (1 - product.discount / 100);
                const hasDiscount = product.discount > 0;
                
                return (
                  <div className="shop-product-card" key={product.id}>
                    <Link to={`/product/${product.id}`} className="card-img-link">
                      <div className="card-image-box">
                        <img 
                          src={product.images && product.images.length > 0 ? product.images[0] : (product.image || '/silk.png')} 
                          alt={product.name} 
                          className="card-img"
                        />
                        {hasDiscount && (
                          <div className="card-discount-badge">{product.discount}% OFF</div>
                        )}
                        
                        <div className="card-actions-overlay">
                          <button 
                            className="overlay-circle-btn" 
                            onClick={(e) => handleWishlistToggle(e, product)}
                            aria-label="Add to wishlist"
                          >
                            <Heart 
                              size={18} 
                              fill={isInWishlist(product.id) ? "var(--color-gold)" : "none"} 
                              color={isInWishlist(product.id) ? "var(--color-gold)" : "currentColor"} 
                            />
                          </button>
                          
                          <button 
                            className="overlay-circle-btn" 
                            onClick={(e) => handleAddToCart(e, product)}
                            aria-label="Add to cart"
                          >
                            <ShoppingBag size={18} />
                          </button>
                        </div>
                      </div>
                    </Link>
                    
                    <div className="card-details">
                      <span className="card-category">{product.category}</span>
                      <h3 className="card-name-title">
                        <Link to={`/product/${product.id}`}>{product.name}</Link>
                      </h3>
                      
                      <div className="card-price-row">
                        {hasDiscount ? (
                          <>
                            <span className="discounted-price">₹{finalPrice.toLocaleString()}</span>
                            <span className="original-price">₹{product.price.toLocaleString()}</span>
                          </>
                        ) : (
                          <span className="normal-price">₹{product.price.toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>

      </div>
    </div>
  );
}
