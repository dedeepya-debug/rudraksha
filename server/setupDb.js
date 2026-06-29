const mysql = require('mysql2/promise');
require('dotenv').config();

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'rudraksha_db';

async function runSetup() {
  console.log('[Setup] Starting MySQL database configuration...');
  let conn;
  try {
    conn = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD
    });

    // 1. Create Database if not exists
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);
    console.log(`[Setup] Database "${DB_NAME}" verified/created.`);
    await conn.query(`USE \`${DB_NAME}\``);

    // 2. Create Users Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        phone VARCHAR(20) NULL,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('customer', 'admin') DEFAULT 'customer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('[Setup] "users" table verified.');

    // 3. Create Products Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        category VARCHAR(50) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        discount INT DEFAULT 0,
        sizes VARCHAR(100) NOT NULL,
        colors VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        fabric VARCHAR(100) NOT NULL,
        occasion VARCHAR(100) NOT NULL,
        care_instructions TEXT NOT NULL,
        stock_quantity INT DEFAULT 10,
        delivery_info TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('[Setup] "products" table verified.');

    // 4. Create Product Images Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS product_images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        image_url VARCHAR(255) NOT NULL,
        is_primary BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `);
    console.log('[Setup] "product_images" table verified.');

    // 5. Create Wishlist Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS wishlist (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        product_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        UNIQUE(user_id, product_id)
      )
    `);
    console.log('[Setup] "wishlist" table verified.');

    // 6. Create Cart Items Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        product_id INT NOT NULL,
        size VARCHAR(20) NOT NULL,
        color VARCHAR(50) NOT NULL,
        quantity INT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `);
    console.log('[Setup] "cart_items" table verified.');

    // 7. Create Orders Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        address TEXT NOT NULL,
        payment_method ENUM('cod', 'upi', 'card') DEFAULT 'cod',
        payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
        shipping_charges DECIMAL(10, 2) DEFAULT 0.00,
        subtotal DECIMAL(10, 2) NOT NULL,
        grand_total DECIMAL(10, 2) NOT NULL,
        order_status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    console.log('[Setup] "orders" table verified.');

    // 8. Create Order Items Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        product_id INT NULL,
        size VARCHAR(20) NOT NULL,
        color VARCHAR(50) NOT NULL,
        quantity INT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
      )
    `);
    console.log('[Setup] "order_items" table verified.');

    // 9. Create Reviews Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        product_id INT NOT NULL,
        rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
        comment TEXT NULL,
        image_url VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `);
    console.log('[Setup] "reviews" table verified.');

    // 10. Create Contact Messages Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        message TEXT NOT NULL,
        inquiry_type VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('[Setup] "contact_messages" table verified.');

    // 11. Seeding Data
    const [existingProducts] = await conn.query('SELECT COUNT(*) as count FROM products');
    if (existingProducts[0].count === 0) {
      console.log('[Setup] Seeding default products and images...');
      
      const seedProducts = [
        {
          name: "Cream Georgette Zari Saree",
          category: "silk",
          price: 18500.00,
          discount: 10,
          sizes: "Standard,Custom",
          colors: "Cream,Gold",
          description: "A gorgeous, sheer georgette weave saree, adorned with intricate gold zari checks and detailed thread work. Comes with a rich dark wine silk blouse piece.",
          fabric: "Silk Georgette",
          occasion: "Ceremony,Wedding",
          care_instructions: "Dry clean only. Store wrapped in soft muslin cloth.",
          stock_quantity: 8,
          delivery_info: "Dispatched within 3-5 business days. Free delivery across India.",
          images: ["/gallery-1.jpg", "/silk.png"]
        },
        {
          name: "Royal Indigo Banarasi Saree",
          category: "brocade",
          price: 24000.00,
          discount: 15,
          sizes: "Standard",
          colors: "Royal Blue,Gold,Crimson",
          description: "An authentic handloom Banarasi silk saree in deep indigo blue, featuring gold bootis and a heavy crimson border with traditional floral vine motifs.",
          fabric: "Katan Silk",
          occasion: "Bridal,Festive",
          care_instructions: "Dry clean only. Iron on low heat on the reverse side.",
          stock_quantity: 5,
          delivery_info: "Dispatched within 2-4 business days. Insured shipping.",
          images: ["/gallery-2.jpg", "/brocade.png"]
        },
        {
          name: "Bespoke Printed Linen Saree",
          category: "linen",
          price: 7800.00,
          discount: 5,
          sizes: "Standard,Custom",
          colors: "Off-White,Pastel Yellow",
          description: "Lightweight organic linen saree hand-printed with traditional animal and floral patterns. Features soft tassels on the pallu and a matching embroidered blouse.",
          fabric: "Organic Flax Linen",
          occasion: "Casual,Festive",
          care_instructions: "Gentle handwash in cold water with mild detergent. Dry in shade.",
          stock_quantity: 12,
          delivery_info: "Dispatched within 2 business days.",
          images: ["/gallery-3.jpg", "/linen.png"]
        },
        {
          name: "Vibrant Heritage Silk Fabrics",
          category: "silk",
          price: 4500.00,
          discount: 0,
          sizes: "Standard",
          colors: "Yellow,Red,Purple,Orange,Lavender",
          description: "Premium pure silk fabric selections in royal hues, woven with fine details and a glossy finish. Sold in preset lengths for custom designing.",
          fabric: "Pure Mulberry Silk",
          occasion: "Festive,Ceremony",
          care_instructions: "Dry clean recommended.",
          stock_quantity: 20,
          delivery_info: "Dispatched within 3 business days.",
          images: ["/gallery-4.jpg", "/silk.png"]
        },
        {
          name: "Superfine Egyptian Cotton Fabric",
          category: "cotton",
          price: 2900.00,
          discount: 8,
          sizes: "Standard,Custom",
          colors: "Pure White,Cream",
          description: "Extra-long staple Egyptian Giza cotton fabric offering a silky texture, unmatched breathability, and high durability for luxury apparel.",
          fabric: "Egyptian Cotton",
          occasion: "Casual,Formal",
          care_instructions: "Machine wash warm, tumble dry low.",
          stock_quantity: 15,
          delivery_info: "Dispatched within 2 business days.",
          images: ["/cotton.png"]
        }
      ];

      for (const p of seedProducts) {
        const [result] = await conn.query(
          `INSERT INTO products (name, category, price, discount, sizes, colors, description, fabric, occasion, care_instructions, stock_quantity, delivery_info) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [p.name, p.category, p.price, p.discount, p.sizes, p.colors, p.description, p.fabric, p.occasion, p.care_instructions, p.stock_quantity, p.delivery_info]
        );
        const productId = result.insertId;

        for (let i = 0; i < p.images.length; i++) {
          await conn.query(
            `INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, ?)`,
            [productId, p.images[i], i === 0]
          );
        }
      }
      console.log('[Setup] Seeding completed.');
    }

    // Seed default admin user
    const [existingUsers] = await conn.query('SELECT COUNT(*) as count FROM users');
    if (existingUsers[0].count === 0) {
      console.log('[Setup] Seeding default admin user...');
      // bcrypt hash for "admin123"
      const adminPassHash = '$2a$10$XJpG9/w4XQ1n11L2t6Y/Su6iA21Lp8l6v0n8H3fR2k8vP9e7yD8wG';
      await conn.query(
        `INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)`,
        ["Admin User", "admin@rudraksha.com", "9876543210", adminPassHash, "admin"]
      );
      console.log('[Setup] Admin user seeded: admin@rudraksha.com / admin123');
    }

    console.log('[Setup] All tables setup and verification complete!');
  } catch (err) {
    console.error(`[Setup Error] Database initialization failed: ${err.message}`);
  } finally {
    if (conn) conn.end();
  }
}

if (require.main === module) {
  runSetup();
}

module.exports = { runSetup };
