const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { authenticateToken, requireAdmin, JWT_SECRET } = require('../middleware/auth');

// --- HELPER FUNCTION: Get all images for a product in MySQL ---
async function getProductImages(productId) {
  try {
    const images = await db.query('SELECT image_url FROM product_images WHERE product_id = ? ORDER BY is_primary DESC', [productId]);
    return images.map(img => img.image_url);
  } catch (err) {
    return [];
  }
}

// ==========================================
// 1. AUTHENTICATION ROUTERS
// ==========================================

// Signup API
router.post('/auth/register', async (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Missing required registration details." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const role = 'customer'; // Default role

    if (db.getIsMock()) {
      // Mock flow
      const exists = db.mockDb.users.some(u => u.email.toLowerCase() === email.toLowerCase());
      if (exists) {
        return res.status(400).json({ error: "An account with this email address already exists." });
      }
      const newUser = {
        id: db.mockDb.users.length + 1,
        name,
        email,
        phone,
        password_hash: hashedPassword,
        role,
        created_at: new Date()
      };
      db.mockDb.users.push(newUser);
      
      const token = jwt.sign({ id: newUser.id, name, email, role }, JWT_SECRET, { expiresIn: '7d' });
      return res.status(201).json({
        message: "Registration successful!",
        token,
        user: { id: newUser.id, name, email, phone, role }
      });
    } else {
      // Real SQL flow
      const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
      if (existing) {
        return res.status(400).json({ error: "An account with this email address already exists." });
      }
      const result = await db.query(
        'INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)',
        [name, email, phone, hashedPassword, role]
      );
      const userId = result.insertId;
      const token = jwt.sign({ id: userId, name, email, role }, JWT_SECRET, { expiresIn: '7d' });
      return res.status(201).json({
        message: "Registration successful!",
        token,
        user: { id: userId, name, email, phone, role }
      });
    }
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ error: "Internal server error during registration." });
  }
});

// Login API
router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Please enter your email and password." });
  }

  try {
    let user = null;
    if (db.getIsMock()) {
      user = db.mockDb.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    } else {
      const rows = await db.query('SELECT * FROM users WHERE email = ?', [email]);
      user = rows[0];
    }

    if (!user) {
      return res.status(400).json({ error: "Invalid email credentials." });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(400).json({ error: "Incorrect password." });
    }

    const token = jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      message: "Login successful!",
      token,
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role }
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Internal server error during login." });
  }
});

// Get/Edit Profile API
router.get('/auth/profile', authenticateToken, async (req, res) => {
  try {
    let user = null;
    if (db.getIsMock()) {
      user = db.mockDb.users.find(u => u.id === req.user.id);
    } else {
      const rows = await db.query('SELECT id, name, email, phone, role FROM users WHERE id = ?', [req.user.id]);
      user = rows[0];
    }
    if (!user) return res.status(404).json({ error: "User not found." });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user profile." });
  }
});

router.put('/auth/profile', authenticateToken, async (req, res) => {
  const { name, phone } = req.body;
  try {
    if (db.getIsMock()) {
      const user = db.mockDb.users.find(u => u.id === req.user.id);
      if (!user) return res.status(404).json({ error: "User not found." });
      if (name) user.name = name;
      if (phone) user.phone = phone;
      res.json({ message: "Profile updated successfully!", user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role } });
    } else {
      await db.query('UPDATE users SET name = ?, phone = ? WHERE id = ?', [name, phone, req.user.id]);
      res.json({ message: "Profile updated successfully!" });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to update profile details." });
  }
});

// Change Password API
router.put('/auth/change-password', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Please enter current and new passwords." });
  }

  try {
    let user = null;
    if (db.getIsMock()) {
      user = db.mockDb.users.find(u => u.id === req.user.id);
    } else {
      const rows = await db.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
      user = rows[0];
    }

    if (!user) return res.status(404).json({ error: "User not found." });

    const match = await bcrypt.compare(currentPassword, user.password_hash);
    if (!match) return res.status(400).json({ error: "Incorrect current password." });

    const newHashed = await bcrypt.hash(newPassword, 10);
    if (db.getIsMock()) {
      user.password_hash = newHashed;
    } else {
      await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHashed, req.user.id]);
    }
    res.json({ message: "Password updated successfully!" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update password." });
  }
});


// ==========================================
// 2. PRODUCT CATALOG ROUTERS
// ==========================================

// Get All Products (Filtered & Sorted)
router.get('/products', async (req, res) => {
  const { search, category, fabric, occasion, size, color, sort } = req.query;

  try {
    if (db.getIsMock()) {
      // Mock Filtering
      let items = [...db.mockDb.products];

      if (search) {
        const queryStr = search.toLowerCase();
        items = items.filter(p => 
          p.name.toLowerCase().includes(queryStr) || 
          p.category.toLowerCase().includes(queryStr) || 
          p.fabric.toLowerCase().includes(queryStr) ||
          p.description.toLowerCase().includes(queryStr)
        );
      }
      if (category && category !== 'all') {
        items = items.filter(p => p.category.toLowerCase() === category.toLowerCase());
      }
      if (fabric) {
        items = items.filter(p => p.fabric.toLowerCase().includes(fabric.toLowerCase()));
      }
      if (occasion) {
        items = items.filter(p => p.occasion.toLowerCase().includes(occasion.toLowerCase()));
      }
      if (size) {
        items = items.filter(p => p.sizes.split(',').includes(size));
      }
      if (color) {
        items = items.filter(p => p.colors.toLowerCase().includes(color.toLowerCase()));
      }

      // Sort logic
      if (sort === 'priceLow') {
        items.sort((a, b) => (a.price * (1 - a.discount/100)) - (b.price * (1 - b.discount/100)));
      } else if (sort === 'priceHigh') {
        items.sort((a, b) => (b.price * (1 - b.discount/100)) - (a.price * (1 - a.discount/100)));
      } else if (sort === 'newest') {
        items.sort((a, b) => b.id - a.id);
      }

      return res.json({ products: items });
    } else {
      // Real SQL Filter Query
      let queryStr = 'SELECT p.*, GROUP_CONCAT(pi.image_url) as images_list FROM products p LEFT JOIN product_images pi ON p.id = pi.product_id';
      let conditions = [];
      let params = [];

      if (search) {
        conditions.push('(p.name LIKE ? OR p.category LIKE ? OR p.fabric LIKE ? OR p.description LIKE ?)');
        const s = `%${search}%`;
        params.push(s, s, s, s);
      }
      if (category && category !== 'all') {
        conditions.push('p.category = ?');
        params.push(category);
      }
      if (fabric) {
        conditions.push('p.fabric LIKE ?');
        params.push(`%${fabric}%`);
      }
      if (occasion) {
        conditions.push('p.occasion LIKE ?');
        params.push(`%${occasion}%`);
      }
      if (size) {
        conditions.push('FIND_IN_SET(?, p.sizes)');
        params.push(size);
      }
      if (color) {
        conditions.push('p.colors LIKE ?');
        params.push(`%${color}%`);
      }

      if (conditions.length > 0) {
        queryStr += ' WHERE ' + conditions.join(' AND ');
      }

      queryStr += ' GROUP BY p.id';

      // Sort Order
      if (sort === 'priceLow') {
        queryStr += ' ORDER BY (p.price * (1 - p.discount/100)) ASC';
      } else if (sort === 'priceHigh') {
        queryStr += ' ORDER BY (p.price * (1 - p.discount/100)) DESC';
      } else if (sort === 'newest') {
        queryStr += ' ORDER BY p.created_at DESC';
      }

      const rows = await db.query(queryStr, params);
      const products = rows.map(r => ({
        ...r,
        images: r.images_list ? r.images_list.split(',') : []
      }));
      res.json({ products });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load product catalog." });
  }
});

// Get Single Product Details (With images, reviews, stock)
router.get('/products/:id', async (req, res) => {
  const { id } = req.params;

  try {
    if (db.getIsMock()) {
      const product = db.mockDb.products.find(p => p.id === parseInt(id));
      if (!product) return res.status(404).json({ error: "Product not found." });
      
      const reviews = db.mockDb.reviews.filter(r => r.product_id === product.id).map(r => {
        const u = db.mockDb.users.find(user => user.id === r.user_id);
        return { ...r, reviewer_name: u ? u.name : "Anonymous" };
      });
      return res.json({ product, reviews });
    } else {
      const rows = await db.query('SELECT * FROM products WHERE id = ?', [id]);
      const product = rows[0];
      if (!product) return res.status(404).json({ error: "Product not found." });

      const images = await getProductImages(product.id);
      product.images = images;

      const reviews = await db.query(
        'SELECT r.*, u.name as reviewer_name FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.product_id = ? ORDER BY r.created_at DESC',
        [id]
      );
      res.json({ product, reviews });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch product specifications." });
  }
});


// ==========================================
// 3. CART SYSTEM ROUTERS
// ==========================================

// Get user's cart
router.get('/cart', authenticateToken, async (req, res) => {
  try {
    if (db.getIsMock()) {
      const cart = db.mockDb.cart_items.filter(c => c.user_id === req.user.id).map(c => {
        const p = db.mockDb.products.find(prod => prod.id === c.product_id);
        return { ...c, product: p };
      });
      return res.json({ cart });
    } else {
      const cart = await db.query(
        `SELECT c.*, p.name, p.price, p.discount, p.category, 
         (SELECT image_url FROM product_images WHERE product_id = p.id LIMIT 1) as primary_image 
         FROM cart_items c JOIN products p ON c.product_id = p.id WHERE c.user_id = ?`,
        [req.user.id]
      );
      res.json({ cart });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to load shopping cart." });
  }
});

// Add to cart
router.post('/cart', authenticateToken, async (req, res) => {
  const { product_id, size, color, quantity } = req.body;
  if (!product_id || !size || !color) {
    return res.status(400).json({ error: "Required fabric selection details missing." });
  }

  const qty = quantity || 1;

  try {
    if (db.getIsMock()) {
      const existing = db.mockDb.cart_items.find(
        c => c.user_id === req.user.id && c.product_id === parseInt(product_id) && c.size === size && c.color === color
      );
      if (existing) {
        existing.quantity += qty;
      } else {
        db.mockDb.cart_items.push({
          id: db.mockDb.cart_items.length + 1,
          user_id: req.user.id,
          product_id: parseInt(product_id),
          size,
          color,
          quantity: qty,
          created_at: new Date()
        });
      }
      return res.json({ message: "Added to shopping cart!" });
    } else {
      // SQL Check & Insert/Update
      const rows = await db.query(
        'SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ? AND size = ? AND color = ?',
        [req.user.id, product_id, size, color]
      );
      if (rows.length > 0) {
        await db.query('UPDATE cart_items SET quantity = quantity + ? WHERE id = ?', [qty, rows[0].id]);
      } else {
        await db.query(
          'INSERT INTO cart_items (user_id, product_id, size, color, quantity) VALUES (?, ?, ?, ?, ?)',
          [req.user.id, product_id, size, color, qty]
        );
      }
      res.json({ message: "Added to shopping cart!" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add item to cart." });
  }
});

// Update cart quantity
router.put('/cart/:id', authenticateToken, async (req, res) => {
  const { quantity } = req.body;
  const { id } = req.params;

  try {
    if (db.getIsMock()) {
      const item = db.mockDb.cart_items.find(c => c.id === parseInt(id) && c.user_id === req.user.id);
      if (!item) return res.status(404).json({ error: "Cart item not found." });
      item.quantity = quantity;
      return res.json({ message: "Cart updated." });
    } else {
      await db.query('UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?', [quantity, id, req.user.id]);
      res.json({ message: "Cart updated." });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to update item quantity." });
  }
});

// Remove item from cart
router.delete('/cart/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    if (db.getIsMock()) {
      const idx = db.mockDb.cart_items.findIndex(c => c.id === parseInt(id) && c.user_id === req.user.id);
      if (idx === -1) return res.status(404).json({ error: "Cart item not found." });
      db.mockDb.cart_items.splice(idx, 1);
      return res.json({ message: "Item removed from cart." });
    } else {
      await db.query('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [id, req.user.id]);
      res.json({ message: "Item removed from cart." });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to delete cart item." });
  }
});


// ==========================================
// 4. WISHLIST ROUTERS
// ==========================================

// Get user wishlist
router.get('/wishlist', authenticateToken, async (req, res) => {
  try {
    if (db.getIsMock()) {
      const list = db.mockDb.wishlist.filter(w => w.user_id === req.user.id).map(w => {
        const p = db.mockDb.products.find(prod => prod.id === w.product_id);
        return { ...w, product: p };
      });
      return res.json({ wishlist: list });
    } else {
      const wishlist = await db.query(
        `SELECT w.*, p.name, p.price, p.discount, p.category, 
         (SELECT image_url FROM product_images WHERE product_id = p.id LIMIT 1) as primary_image 
         FROM wishlist w JOIN products p ON w.product_id = p.id WHERE w.user_id = ?`,
        [req.user.id]
      );
      res.json({ wishlist });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to load wishlist items." });
  }
});

// Toggle wishlist (Add or Remove)
router.post('/wishlist', authenticateToken, async (req, res) => {
  const { product_id } = req.body;
  if (!product_id) return res.status(400).json({ error: "Missing product identifier." });

  try {
    if (db.getIsMock()) {
      const idx = db.mockDb.wishlist.findIndex(w => w.user_id === req.user.id && w.product_id === parseInt(product_id));
      if (idx !== -1) {
        db.mockDb.wishlist.splice(idx, 1);
        return res.json({ message: "Removed from wishlist", status: "removed" });
      } else {
        db.mockDb.wishlist.push({
          id: db.mockDb.wishlist.length + 1,
          user_id: req.user.id,
          product_id: parseInt(product_id),
          created_at: new Date()
        });
        return res.json({ message: "Added to wishlist!", status: "added" });
      }
    } else {
      const rows = await db.query('SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?', [req.user.id, product_id]);
      if (rows.length > 0) {
        await db.query('DELETE FROM wishlist WHERE id = ?', [rows[0].id]);
        return res.json({ message: "Removed from wishlist", status: "removed" });
      } else {
        await db.query('INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)', [req.user.id, product_id]);
        return res.json({ message: "Added to wishlist!", status: "added" });
      }
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to update wishlist state." });
  }
});


// ==========================================
// 5. ORDER CHECKOUT & DASHBOARDS
// ==========================================

// Create Order (Checkout)
router.post('/orders', authenticateToken, async (req, res) => {
  const { name, email, phone, address, payment_method, cartItems, shipping_charges, subtotal, grand_total } = req.body;

  if (!name || !email || !phone || !address || !cartItems || cartItems.length === 0) {
    return res.status(400).json({ error: "Incomplete delivery details or cart items." });
  }

  try {
    if (db.getIsMock()) {
      // Create mock order
      const newOrder = {
        id: db.mockDb.orders.length + 1,
        user_id: req.user.id,
        name,
        email,
        phone,
        address,
        payment_method,
        payment_status: payment_method === 'cod' ? 'pending' : 'paid',
        shipping_charges: parseFloat(shipping_charges || 0),
        subtotal: parseFloat(subtotal),
        grand_total: parseFloat(grand_total),
        order_status: 'pending',
        created_at: new Date()
      };
      
      db.mockDb.orders.push(newOrder);

      // Create order items
      cartItems.forEach(item => {
        db.mockDb.order_items.push({
          id: db.mockDb.order_items.length + 1,
          order_id: newOrder.id,
          product_id: item.product_id,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          price: item.product ? item.product.price : parseFloat(subtotal)
        });
      });

      // Clear user cart
      db.mockDb.cart_items = db.mockDb.cart_items.filter(c => c.user_id !== req.user.id);

      return res.status(201).json({ message: "Order placed successfully!", orderId: newOrder.id });
    } else {
      // Real transaction order insert
      const result = await db.query(
        `INSERT INTO orders (user_id, name, email, phone, address, payment_method, payment_status, shipping_charges, subtotal, grand_total) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          req.user.id,
          name,
          email,
          phone,
          address,
          payment_method,
          payment_method === 'cod' ? 'pending' : 'paid',
          shipping_charges,
          subtotal,
          grand_total
        ]
      );
      const orderId = result.insertId;

      for (const item of cartItems) {
        await db.query(
          'INSERT INTO order_items (order_id, product_id, size, color, quantity, price) VALUES (?, ?, ?, ?, ?, ?)',
          [orderId, item.product_id, item.size, item.color, item.quantity, item.price]
        );
      }

      // Clear Cart
      await db.query('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);

      res.status(201).json({ message: "Order placed successfully!", orderId });
    }
  } catch (err) {
    console.error("Checkout error:", err);
    res.status(500).json({ error: "Failed to process checkout transaction." });
  }
});

// Get user orders list
router.get('/orders', authenticateToken, async (req, res) => {
  try {
    if (db.getIsMock()) {
      const orders = db.mockDb.orders.filter(o => o.user_id === req.user.id).map(o => {
        const items = db.mockDb.order_items.filter(oi => oi.order_id === o.id).map(oi => {
          const p = db.mockDb.products.find(prod => prod.id === oi.product_id);
          return { ...oi, product_name: p ? p.name : "Heritage Fabric" };
        });
        return { ...o, items };
      });
      orders.sort((a, b) => b.id - a.id);
      return res.json({ orders });
    } else {
      const orders = await db.query('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
      for (const o of orders) {
        o.items = await db.query(
          'SELECT oi.*, p.name as product_name FROM order_items oi LEFT JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?',
          [o.id]
        );
      }
      res.json({ orders });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve order logs." });
  }
});

// Cancel Order
router.put('/orders/:id/cancel', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    if (db.getIsMock()) {
      const order = db.mockDb.orders.find(o => o.id === parseInt(id) && o.user_id === req.user.id);
      if (!order) return res.status(404).json({ error: "Order not found." });
      if (order.order_status !== 'pending') {
        return res.status(400).json({ error: "Only pending orders can be cancelled." });
      }
      order.order_status = 'cancelled';
      return res.json({ message: "Order cancelled successfully." });
    } else {
      const rows = await db.query('SELECT order_status FROM orders WHERE id = ? AND user_id = ?', [id, req.user.id]);
      if (rows.length === 0) return res.status(404).json({ error: "Order not found." });
      if (rows[0].order_status !== 'pending') {
        return res.status(400).json({ error: "Only pending orders can be cancelled." });
      }
      await db.query("UPDATE orders SET order_status = 'cancelled' WHERE id = ?", [id]);
      res.json({ message: "Order cancelled successfully." });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to cancel order request." });
  }
});


// ==========================================
// 6. REVIEWS & FEEDBACKS
// ==========================================

// Add a product review
router.post('/reviews', authenticateToken, async (req, res) => {
  const { product_id, rating, comment, image_url } = req.body;
  if (!product_id || !rating) {
    return res.status(400).json({ error: "Product rating value is required." });
  }

  try {
    if (db.getIsMock()) {
      const newReview = {
        id: db.mockDb.reviews.length + 1,
        user_id: req.user.id,
        product_id: parseInt(product_id),
        rating: parseInt(rating),
        comment,
        image_url,
        created_at: new Date()
      };
      db.mockDb.reviews.push(newReview);
      return res.json({ message: "Review posted successfully!" });
    } else {
      await db.query(
        'INSERT INTO reviews (user_id, product_id, rating, comment, image_url) VALUES (?, ?, ?, ?, ?)',
        [req.user.id, product_id, rating, comment, image_url]
      );
      res.json({ message: "Review posted successfully!" });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to record customer review." });
  }
});

// Delete review
router.delete('/reviews/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    if (db.getIsMock()) {
      const idx = db.mockDb.reviews.findIndex(r => r.id === parseInt(id) && r.user_id === req.user.id);
      if (idx === -1) return res.status(404).json({ error: "Review logs not found." });
      db.mockDb.reviews.splice(idx, 1);
      return res.json({ message: "Review deleted successfully." });
    } else {
      const result = await db.query('DELETE FROM reviews WHERE id = ? AND user_id = ?', [id, req.user.id]);
      if (result.affectedRows === 0) return res.status(404).json({ error: "Review log entry not found." });
      res.json({ message: "Review deleted successfully." });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to erase review entry." });
  }
});


// ==========================================
// 7. CONTACT MESSAGES
// ==========================================

router.post('/contact', async (req, res) => {
  const { name, email, phone, message, inquiry_type } = req.body;
  if (!name || !email || !phone || !message) {
    return res.status(400).json({ error: "All input fields are mandatory." });
  }

  try {
    if (db.getIsMock()) {
      db.mockDb.contact_messages.push({
        id: db.mockDb.contact_messages.length + 1,
        name,
        email,
        phone,
        message,
        inquiry_type: inquiry_type || 'general',
        created_at: new Date()
      });
    } else {
      await db.query(
        'INSERT INTO contact_messages (name, email, phone, message, inquiry_type) VALUES (?, ?, ?, ?, ?)',
        [name, email, phone, message, inquiry_type || 'general']
      );
    }
    res.json({ message: "Message sent! A representative will connect soon." });
  } catch (err) {
    res.status(500).json({ error: "Failed to submit message." });
  }
});


// ==========================================
// 8. ADMIN DASHBOARD & CRUD
// ==========================================

// Add Product
router.post('/admin/products', requireAdmin, async (req, res) => {
  const { name, category, price, discount, sizes, colors, description, fabric, occasion, care_instructions, stock_quantity, delivery_info, images } = req.body;

  try {
    const defaultImages = images || ["/silk.png"];
    if (db.getIsMock()) {
      const newProd = {
        id: db.mockDb.products.length + 1,
        name,
        category,
        price: parseFloat(price),
        discount: parseInt(discount || 0),
        sizes: sizes || 'Standard',
        colors: colors || 'Natural',
        description,
        fabric,
        occasion,
        care_instructions,
        stock_quantity: parseInt(stock_quantity || 10),
        delivery_info,
        images: defaultImages
      };
      db.mockDb.products.push(newProd);
      return res.status(201).json({ message: "Product created successfully!", product: newProd });
    } else {
      const result = await db.query(
        `INSERT INTO products (name, category, price, discount, sizes, colors, description, fabric, occasion, care_instructions, stock_quantity, delivery_info) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, category, price, discount, sizes, colors, description, fabric, occasion, care_instructions, stock_quantity, delivery_info]
      );
      const prodId = result.insertId;

      for (let i = 0; i < defaultImages.length; i++) {
        await db.query(
          'INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, ?)',
          [prodId, defaultImages[i], i === 0]
        );
      }
      res.status(201).json({ message: "Product created successfully!" });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to register new product." });
  }
});

// Edit Product
router.put('/admin/products/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, category, price, discount, sizes, colors, description, fabric, occasion, care_instructions, stock_quantity, delivery_info } = req.body;

  try {
    if (db.getIsMock()) {
      const p = db.mockDb.products.find(prod => prod.id === parseInt(id));
      if (!p) return res.status(404).json({ error: "Product not found." });
      
      if (name) p.name = name;
      if (category) p.category = category;
      if (price) p.price = parseFloat(price);
      if (discount !== undefined) p.discount = parseInt(discount);
      if (sizes) p.sizes = sizes;
      if (colors) p.colors = colors;
      if (description) p.description = description;
      if (fabric) p.fabric = fabric;
      if (occasion) p.occasion = occasion;
      if (care_instructions) p.care_instructions = care_instructions;
      if (stock_quantity !== undefined) p.stock_quantity = parseInt(stock_quantity);
      if (delivery_info) p.delivery_info = delivery_info;

      return res.json({ message: "Product updated successfully!", product: p });
    } else {
      await db.query(
        `UPDATE products SET name = ?, category = ?, price = ?, discount = ?, sizes = ?, colors = ?, 
         description = ?, fabric = ?, occasion = ?, care_instructions = ?, stock_quantity = ?, delivery_info = ? 
         WHERE id = ?`,
        [name, category, price, discount, sizes, colors, description, fabric, occasion, care_instructions, stock_quantity, delivery_info, id]
      );
      res.json({ message: "Product updated successfully!" });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to update product details." });
  }
});

// Delete Product
router.delete('/admin/products/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    if (db.getIsMock()) {
      const idx = db.mockDb.products.findIndex(prod => prod.id === parseInt(id));
      if (idx === -1) return res.status(404).json({ error: "Product not found." });
      db.mockDb.products.splice(idx, 1);
      return res.json({ message: "Product deleted successfully." });
    } else {
      await db.query('DELETE FROM products WHERE id = ?', [id]);
      res.json({ message: "Product deleted successfully." });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to delete product." });
  }
});

// Get All Orders (Admin Manager)
router.get('/admin/orders', requireAdmin, async (req, res) => {
  try {
    if (db.getIsMock()) {
      const orders = db.mockDb.orders.map(o => {
        const items = db.mockDb.order_items.filter(oi => oi.order_id === o.id).map(oi => {
          const p = db.mockDb.products.find(prod => prod.id === oi.product_id);
          return { ...oi, product_name: p ? p.name : "Heritage Fabric" };
        });
        return { ...o, items };
      });
      orders.sort((a, b) => b.id - a.id);
      return res.json({ orders });
    } else {
      const orders = await db.query('SELECT * FROM orders ORDER BY created_at DESC');
      for (const o of orders) {
        o.items = await db.query(
          'SELECT oi.*, p.name as product_name FROM order_items oi LEFT JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?',
          [o.id]
        );
      }
      res.json({ orders });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to load order system logs." });
  }
});

// Update Order Tracking Status
router.put('/admin/orders/:id/status', requireAdmin, async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  try {
    if (db.getIsMock()) {
      const o = db.mockDb.orders.find(order => order.id === parseInt(id));
      if (!o) return res.status(404).json({ error: "Order not found." });
      o.order_status = status;
      if (status === 'delivered') o.payment_status = 'paid';
      return res.json({ message: "Order status updated successfully!" });
    } else {
      const paymentStatus = status === 'delivered' ? 'paid' : null;
      if (paymentStatus) {
        await db.query('UPDATE orders SET order_status = ?, payment_status = ? WHERE id = ?', [status, paymentStatus, id]);
      } else {
        await db.query('UPDATE orders SET order_status = ? WHERE id = ?', [status, id]);
      }
      res.json({ message: "Order status updated successfully!" });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to update shipping status." });
  }
});

// Sales Analytics
router.get('/admin/analytics', requireAdmin, async (req, res) => {
  try {
    let sales = 0;
    let productsCount = 0;
    let ordersCount = 0;
    let usersCount = 0;

    if (db.getIsMock()) {
      const validOrders = db.mockDb.orders.filter(o => o.order_status !== 'cancelled');
      sales = validOrders.reduce((sum, o) => sum + o.grand_total, 0);
      ordersCount = db.mockDb.orders.length;
      productsCount = db.mockDb.products.length;
      usersCount = db.mockDb.users.length;
    } else {
      const [rev] = await db.query("SELECT SUM(grand_total) as total FROM orders WHERE order_status != 'cancelled'");
      const [prod] = await db.query("SELECT COUNT(*) as total FROM products");
      const [ord] = await db.query("SELECT COUNT(*) as total FROM orders");
      const [usr] = await db.query("SELECT COUNT(*) as total FROM users");

      sales = rev.total || 0;
      productsCount = prod.total || 0;
      ordersCount = ord.total || 0;
      usersCount = usr.total || 0;
    }

    // Static report arrays for styling the analytics SVG graph
    const monthlyReport = [
      { month: 'Jan', revenue: Math.round(sales * 0.1) },
      { month: 'Feb', revenue: Math.round(sales * 0.12) },
      { month: 'Mar', revenue: Math.round(sales * 0.15) },
      { month: 'Apr', revenue: Math.round(sales * 0.18) },
      { month: 'May', revenue: Math.round(sales * 0.22) },
      { month: 'Jun', revenue: Math.round(sales * 0.23) }
    ];

    res.json({
      analytics: {
        totalSales: parseFloat(sales).toFixed(2),
        productsCount,
        ordersCount,
        usersCount,
        monthlyReport
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to calculate analytics summary." });
  }
});

module.exports = router;
