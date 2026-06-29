import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { Heart, Trash, ShoppingBag, ArrowLeft } from 'lucide-react';
import './Wishlist.css';

export default function Wishlist() {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const showToast = useToast();

  const handleRemove = async (product) => {
    await toggleWishlist(product);
    showToast(`${product.name} removed from wishlist.`, "info");
  };

  const handleAddToCart = async (product) => {
    try {
      const selectedSize = product.sizes ? product.sizes.split(',')[0] : 'Standard';
      const selectedColor = product.colors ? product.colors.split(',')[0] : 'Natural';
      await addToCart(product, selectedSize, selectedColor, 1);
      showToast(`${product.name} added to cart!`, "success");
    } catch (err) {
      showToast("Failed to add product to cart.", "error");
    }
  };

  if (wishlist.length === 0) {
    return (
      <div className="wishlist-page-container empty-wishlist-state">
        <div className="container text-center">
          <Heart size={80} className="empty-wishlist-icon pulse-gold" fill="none" />
          <h2 className="empty-wishlist-title">Your Wishlist is Empty</h2>
          <p className="empty-wishlist-desc">
            Keep track of fabrics you love. Tap the heart icon on any product card, and it will appear here.
          </p>
          <Link to="/shop" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <ArrowLeft size={16} />
            <span>Discover Collection</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page-container">
      <div className="container">
        
        <div className="wishlist-header">
          <h1 className="wishlist-page-title">My Wishlist</h1>
          <div className="title-underline" style={{ margin: '10px 0 40px 0' }}></div>
        </div>

        {/* Wishlist grid list */}
        <div className="wishlist-grid">
          {wishlist.map((item) => {
            const product = item.product;
            if (!product) return null;
            
            const price = product.price || 0;
            const discount = product.discount || 0;
            const finalPrice = price * (1 - discount/100);
            const hasDiscount = discount > 0;
            
            const imgUrl = product.primary_image 
              ? product.primary_image 
              : (product.images && product.images.length > 0 ? product.images[0] : '/silk.png');

            return (
              <div className="wishlist-item-card" key={item.id}>
                
                {/* Thumbnail */}
                <div className="wishlist-card-img-box">
                  <img src={imgUrl} alt={product.name} />
                  <button 
                    className="wishlist-card-remove-btn" 
                    onClick={() => handleRemove(product)}
                    aria-label="Remove item"
                  >
                    <Trash size={16} />
                  </button>
                </div>

                {/* Info details */}
                <div className="wishlist-card-details">
                  <span className="wishlist-card-cat">{product.category}</span>
                  <h3 className="wishlist-card-name">
                    <Link to={`/product/${product.id}`}>{product.name}</Link>
                  </h3>
                  
                  <div className="wishlist-card-price">
                    {hasDiscount ? (
                      <>
                        <span className="discounted-price">₹{finalPrice.toLocaleString()}</span>
                        <span className="original-price">₹{price.toLocaleString()}</span>
                      </>
                    ) : (
                      <span className="normal-price">₹{price.toLocaleString()}</span>
                    )}
                  </div>
                </div>

                {/* Add to cart action footer */}
                <div className="wishlist-card-footer">
                  <button className="btn btn-primary wishlist-add-cart-btn" onClick={() => handleAddToCart(product)}>
                    <ShoppingBag size={14} style={{ marginRight: '6px' }} />
                    <span>Add to Cart</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
