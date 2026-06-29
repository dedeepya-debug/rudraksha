import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const { token, user } = useAuth();
  
  const API_URL = 'http://localhost:5000/api';

  // Load cart items on init/auth state change
  useEffect(() => {
    const loadCart = async () => {
      if (token) {
        try {
          const res = await fetch(`${API_URL}/cart`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (res.ok) {
            setCart(data.cart);
          }
        } catch (err) {
          console.error("Error loading cart:", err);
        }
      } else {
        // Guest mode fallback
        const guestCart = JSON.parse(localStorage.getItem('rudraksha_cart') || '[]');
        setCart(guestCart);
      }
    };
    loadCart();
  }, [token, user]);

  // Sync guest cart to local storage
  const syncGuestCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem('rudraksha_cart', JSON.stringify(newCart));
  };

  const addToCart = async (product, size, color, quantity = 1) => {
    if (token) {
      try {
        const res = await fetch(`${API_URL}/cart`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ product_id: product.id, size, color, quantity })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        // Reload cart
        const cartRes = await fetch(`${API_URL}/cart`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const cartData = await cartRes.json();
        if (cartRes.ok) setCart(cartData.cart);
      } catch (err) {
        throw err;
      }
    } else {
      // Guest add
      const newCart = [...cart];
      const idx = newCart.findIndex(
        item => item.product_id === product.id && item.size === size && item.color === color
      );
      if (idx !== -1) {
        newCart[idx].quantity += quantity;
      } else {
        newCart.push({
          id: Date.now(), // temporary client-side ID
          product_id: product.id,
          size,
          color,
          quantity,
          product: {
            id: product.id,
            name: product.name,
            price: product.price,
            discount: product.discount,
            category: product.category,
            images: product.images || [product.image]
          }
        });
      }
      syncGuestCart(newCart);
    }
  };

  const updateCartQty = async (cartItemId, newQty) => {
    if (newQty < 1) return;
    
    if (token) {
      try {
        const res = await fetch(`${API_URL}/cart/${cartItemId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ quantity: newQty })
        });
        if (res.ok) {
          setCart(prev => prev.map(item => item.id === cartItemId ? { ...item, quantity: newQty } : item));
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      const newCart = cart.map(item => item.id === cartItemId ? { ...item, quantity: newQty } : item);
      syncGuestCart(newCart);
    }
  };

  const removeFromCart = async (cartItemId) => {
    if (token) {
      try {
        const res = await fetch(`${API_URL}/cart/${cartItemId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setCart(prev => prev.filter(item => item.id !== cartItemId));
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      const newCart = cart.filter(item => item.id !== cartItemId);
      syncGuestCart(newCart);
    }
  };

  const clearCart = () => {
    setCart([]);
    if (!token) {
      localStorage.removeItem('rudraksha_cart');
    }
  };

  // Math totals calculation
  const getSubtotal = () => {
    return cart.reduce((total, item) => {
      const price = item.product ? item.product.price : 0;
      const discount = item.product ? item.product.discount : 0;
      const discountedPrice = price * (1 - discount / 100);
      return total + (discountedPrice * item.quantity);
    }, 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const shippingCharges = getSubtotal() >= 5000 || getSubtotal() === 0 ? 0 : 150;
  const grandTotal = getSubtotal() + shippingCharges;

  const value = {
    cart,
    addToCart,
    updateCartQty,
    removeFromCart,
    clearCart,
    cartCount: getCartCount(),
    cartSubtotal: getSubtotal(),
    shippingCharges,
    cartGrandTotal: grandTotal
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}
