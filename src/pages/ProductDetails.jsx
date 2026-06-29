import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Heart, ShoppingBag, MessageSquare, Star, Share2, ArrowRight, Truck, Info, Calendar, Sparkles, Send, Trash } from 'lucide-react';
import './ProductDetails.css';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Interaction states
  const [selectedImg, setSelectedImg] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [zoomStyle, setZoomStyle] = useState({ display: 'none', backgroundPosition: '0% 0%' });
  const [qty, setQty] = useState(1);

  // Review states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { token, user } = useAuth();
  const showToast = useToast();

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/products/${id}`);
        const data = await res.json();
        if (res.ok) {
          setProduct(data.product);
          setReviews(data.reviews || []);
          if (data.product.images && data.product.images.length > 0) {
            setSelectedImg(data.product.images[0]);
          } else {
            setSelectedImg(data.product.image || '/silk.png');
          }
          if (data.product.sizes) setSelectedSize(data.product.sizes.split(',')[0]);
          if (data.product.colors) setSelectedColor(data.product.colors.split(',')[0]);
        } else {
          showToast(data.error || "Failed to load product details.", "error");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProductDetails();
  }, [id]);

  // Zoom on hover logic
  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.target.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    setZoomStyle({
      display: 'block',
      backgroundImage: `url(${selectedImg})`,
      backgroundPosition: `${x}% ${y}%`
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: 'none', backgroundPosition: '0% 0%' });
  };

  const handleAddToCart = async (buyNow = false) => {
    if (!product) return;
    try {
      await addToCart(product, selectedSize, selectedColor, qty);
      showToast(`${product.name} added to cart!`, "success");
      if (buyNow) {
        navigate('/cart');
      }
    } catch (err) {
      showToast("Could not add product to cart.", "error");
    }
  };

  const handleWishlistToggle = async () => {
    if (!product) return;
    const state = await toggleWishlist(product);
    if (state === 'added') {
      showToast("Added to wishlist!", "success");
    } else {
      showToast("Removed from wishlist.", "info");
    }
  };

  const handleWhatsAppInquiry = () => {
    if (!product) return;
    const phone = "919876543210"; // corporate whatsapp number
    const finalPrice = product.price * (1 - product.discount/100);
    const message = `Hello Rudraksha Textiles,
I am interested in this product.

Product Name: ${product.name}
Price: ₹${finalPrice.toLocaleString()}
Color: ${selectedColor}
Size: ${selectedSize}

Please provide more details.`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank');
  };

  const handleShareProduct = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast("Product link copied to clipboard!", "info");
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!token) {
      showToast("Please login to write a review.", "error");
      return;
    }
    setSubmittingReview(true);
    try {
      const res = await fetch(`${API_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ product_id: product.id, rating, comment })
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Review submitted successfully!", "success");
        setComment('');
        // Reload reviews
        const revRes = await fetch(`${API_URL}/products/${id}`);
        const revData = await revRes.json();
        if (revRes.ok) setReviews(revData.reviews || []);
      } else {
        showToast(data.error || "Failed to submit review.", "error");
      }
    } catch (err) {
      showToast("Server error.", "error");
    } finally {
      setSubmittingReview(false);
    }
  };

  const deleteReview = async (reviewId) => {
    try {
      const res = await fetch(`${API_URL}/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast("Review deleted.", "info");
        setReviews(prev => prev.filter(r => r.id !== reviewId));
      }
    } catch (err) {
      showToast("Failed to delete review.", "error");
    }
  };

  if (loading) {
    return (
      <div className="product-details-page loading-details-state">
        <div className="container">
          <p>Loading heritage specifications...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-details-page error-details-state">
        <div className="container text-center">
          <h2>Product Not Found</h2>
          <p>We couldn't locate the specified textile catalog entry.</p>
          <Link to="/shop" className="btn btn-primary" style={{ marginTop: '20px' }}>Back to Shop</Link>
        </div>
      </div>
    );
  }

  const finalPrice = product.price * (1 - product.discount/100);
  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="product-details-page">
      <div className="container details-grid">
        
        {/* Left Column: Image Panels */}
        <div className="details-images-column">
          <div className="main-zoom-image-wrapper">
            <img 
              src={selectedImg} 
              alt={product.name} 
              className="details-main-img"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            />
            {/* Hover zoom viewer */}
            <div className="image-zoom-glass" style={zoomStyle}></div>
          </div>

          {/* Thumbnail strip */}
          {product.images && product.images.length > 1 && (
            <div className="details-thumbnails-strip">
              {product.images.map((img, idx) => (
                <button 
                  key={idx} 
                  className={`thumbnail-btn ${selectedImg === img ? 'active' : ''}`}
                  onClick={() => setSelectedImg(img)}
                >
                  <img src={img} alt={`thumbnail-${idx}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Spec sheet & purchasing */}
        <div className="details-specs-column">
          <span className="details-category-tag">{product.category}</span>
          <h1 className="details-title">{product.name}</h1>
          
          {/* Reviews Score */}
          <div className="details-rating-summary">
            <div className="stars-row">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star 
                  key={i} 
                  size={16} 
                  className="star-icon" 
                  fill={i < Math.round(averageRating || 5) ? "var(--color-gold)" : "none"} 
                  color={i < Math.round(averageRating || 5) ? "var(--color-gold)" : "var(--color-brown-subtle)"} 
                />
              ))}
            </div>
            <span className="rating-text">
              {averageRating ? `${averageRating} / 5.0` : "No reviews yet"} ({reviews.length} customer reviews)
            </span>
          </div>

          {/* Prices Row */}
          <div className="details-price-row">
            {product.discount > 0 ? (
              <>
                <span className="discounted-price-huge">₹{finalPrice.toLocaleString()}</span>
                <span className="original-price-huge">₹{product.price.toLocaleString()}</span>
                <span className="discount-tag-huge">{product.discount}% OFF</span>
              </>
            ) : (
              <span className="normal-price-huge">₹{product.price.toLocaleString()}</span>
            )}
          </div>

          <p className="details-description">{product.description}</p>

          <hr className="details-divider" />

          {/* Sizing selection */}
          {product.sizes && (
            <div className="selectors-group">
              <span className="selector-label">Size Options</span>
              <div className="buttons-strip">
                {product.sizes.split(',').map(size => (
                  <button
                    key={size}
                    className={`selector-btn ${selectedSize === size ? 'active' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color selection */}
          {product.colors && (
            <div className="selectors-group">
              <span className="selector-label">Available Colors</span>
              <div className="buttons-strip">
                {product.colors.split(',').map(col => (
                  <button
                    key={col}
                    className={`selector-btn ${selectedColor === col ? 'active' : ''}`}
                    onClick={() => setSelectedColor(col)}
                  >
                    {col}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity modify */}
          <div className="selectors-group qty-group">
            <span className="selector-label">Quantity</span>
            <div className="qty-picker">
              <button onClick={() => setQty(prev => Math.max(1, prev - 1))}>-</button>
              <span>{qty}</span>
              <button onClick={() => setQty(prev => Math.min(product.stock_quantity || 10, prev + 1))}>+</button>
            </div>
            <span className="stock-notice">
              {product.stock_quantity > 0 ? `In Stock (${product.stock_quantity} available)` : "Out of Stock"}
            </span>
          </div>

          {/* Primary Action Buttons */}
          <div className="details-purchase-actions">
            <button 
              className="btn btn-primary action-btn-huge" 
              onClick={() => handleAddToCart(false)}
              disabled={product.stock_quantity === 0}
            >
              <ShoppingBag size={18} style={{ marginRight: '10px' }} />
              <span>Add to Cart</span>
            </button>
            
            <button 
              className="btn btn-outline action-btn-huge"
              onClick={() => handleAddToCart(true)}
              disabled={product.stock_quantity === 0}
            >
              <span>Buy Now</span>
            </button>

            <button 
              className={`wishlist-circle-btn ${isInWishlist(product.id) ? 'active' : ''}`}
              onClick={handleWishlistToggle}
              aria-label="Add to wishlist"
            >
              <Heart size={20} fill={isInWishlist(product.id) ? "var(--color-gold)" : "none"} />
            </button>
          </div>

          {/* Secondary Action buttons */}
          <div className="details-secondary-actions">
            <button className="inquiry-whatsapp-btn" onClick={handleWhatsAppInquiry}>
              <MessageSquare size={16} />
              <span>Direct WhatsApp Inquiry</span>
            </button>

            <button className="share-product-btn" onClick={handleShareProduct}>
              <Share2 size={16} />
              <span>Share Product</span>
            </button>
          </div>

          <hr className="details-divider" />

          {/* Spec details accordion/list */}
          <ul className="details-metadata-list">
            <li>
              <Sparkles size={16} className="meta-icon" />
              <div>
                <strong>Fabric Blend:</strong>
                <span>{product.fabric}</span>
              </div>
            </li>
            <li>
              <Info size={16} className="meta-icon" />
              <div>
                <strong>Occasion suitability:</strong>
                <span>{product.occasion}</span>
              </div>
            </li>
            <li>
              <Calendar size={16} className="meta-icon" />
              <div>
                <strong>Care Instructions:</strong>
                <span>{product.care_instructions}</span>
              </div>
            </li>
            <li>
              <Truck size={16} className="meta-icon" />
              <div>
                <strong>Delivery & Logistics:</strong>
                <span>{product.delivery_info}</span>
              </div>
            </li>
          </ul>

        </div>

      </div>

      {/* Reviews Tab/Section */}
      <section className="section details-reviews-section">
        <div className="container">
          <h2 className="section-title">Customer Reviews</h2>
          <div className="title-underline" style={{ margin: '10px auto 40px auto' }}></div>
          
          <div className="reviews-layout">
            
            {/* Reviews display list */}
            <div className="reviews-list-box">
              {reviews.length === 0 ? (
                <p className="no-reviews-note">No review submissions found for this fabric yet. Be the first to share your experience!</p>
              ) : (
                <div className="reviews-feed">
                  {reviews.map((r) => (
                    <div className="review-item-card" key={r.id}>
                      <div className="review-card-header">
                        <div className="review-reviewer-initials">
                          {r.reviewer_name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <cite className="reviewer-name">{r.reviewer_name}</cite>
                          <div className="reviewer-stars-row">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star 
                                key={i} 
                                size={12} 
                                fill={i < r.rating ? "var(--color-gold)" : "none"} 
                                color={i < r.rating ? "var(--color-gold)" : "var(--color-brown-subtle)"} 
                              />
                            ))}
                          </div>
                        </div>

                        {user && user.id === r.user_id && (
                          <button 
                            className="review-delete-btn" 
                            onClick={() => deleteReview(r.id)}
                            aria-label="Delete review"
                          >
                            <Trash size={14} />
                          </button>
                        )}
                      </div>
                      
                      <p className="reviewer-comment">"{r.comment}"</p>
                      <span className="review-timestamp">{new Date(r.created_at).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Write a review form */}
            <div className="reviews-form-box">
              <h3>Share Your Feedback</h3>
              <p>Write an honest review to help other boutique owners and designers select fabric.</p>
              
              {token ? (
                <form onSubmit={submitReview} className="review-form">
                  <div className="form-group">
                    <label className="form-label">Product Rating *</label>
                    <div className="rating-stars-interactive">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className="interactive-star-btn"
                          onClick={() => setRating(star)}
                        >
                          <Star 
                            size={24} 
                            fill={star <= rating ? "var(--color-gold)" : "none"} 
                            color={star <= rating ? "var(--color-gold)" : "var(--color-brown-subtle)"} 
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="comment" className="form-label">Review Comment *</label>
                    <textarea
                      id="comment"
                      className="form-input form-textarea"
                      placeholder="Comment on the texture, weight, weave detail, and overall quality..."
                      rows="4"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      required
                    ></textarea>
                  </div>

                  <button type="submit" className="btn btn-primary review-submit-btn" disabled={submittingReview}>
                    {submittingReview ? "Posting..." : "Post Review"}
                    <Send size={14} style={{ marginLeft: '8px' }} />
                  </button>
                </form>
              ) : (
                <div className="login-prompt-reviews">
                  <p>You must be signed in to submit product feedback.</p>
                  <Link to="/login" className="btn btn-outline">Sign In Now</Link>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
