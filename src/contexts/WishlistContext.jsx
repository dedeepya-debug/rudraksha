import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export function useWishlist() {
  return useContext(WishlistContext);
}

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([]);
  const { token, user } = useAuth();

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    const loadWishlist = async () => {
      if (token) {
        try {
          const res = await fetch(`${API_URL}/wishlist`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (res.ok) {
            setWishlist(data.wishlist);
          }
        } catch (err) {
          console.error("Error loading wishlist:", err);
        }
      } else {
        const guestWishlist = JSON.parse(localStorage.getItem('rudraksha_wishlist') || '[]');
        setWishlist(guestWishlist);
      }
    };
    loadWishlist();
  }, [token, user]);

  const syncGuestWishlist = (newList) => {
    setWishlist(newList);
    localStorage.setItem('rudraksha_wishlist', JSON.stringify(newList));
  };

  const toggleWishlist = async (product) => {
    if (token) {
      try {
        const res = await fetch(`${API_URL}/wishlist`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ product_id: product.id })
        });
        const data = await res.json();
        
        if (res.ok) {
          if (data.status === 'added') {
            setWishlist(prev => [...prev, { product_id: product.id, product }]);
          } else {
            setWishlist(prev => prev.filter(item => item.product_id !== product.id));
          }
          return data.status;
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      // Guest Toggle
      const newList = [...wishlist];
      const idx = newList.findIndex(item => item.product_id === product.id);
      let status = '';
      if (idx !== -1) {
        newList.splice(idx, 1);
        status = 'removed';
      } else {
        newList.push({
          id: Date.now(),
          product_id: product.id,
          product: {
            id: product.id,
            name: product.name,
            price: product.price,
            discount: product.discount,
            category: product.category,
            images: product.images || [product.image]
          }
        });
        status = 'added';
      }
      syncGuestWishlist(newList);
      return status;
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => item.product_id === productId);
  };

  const value = {
    wishlist,
    toggleWishlist,
    isInWishlist
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}
