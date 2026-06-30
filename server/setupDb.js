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
          name: "Vibrant Heritage Silk Saree",
          category: "silk",
          price: 12500.00,
          discount: 0,
          sizes: "Standard",
          colors: "Yellow,Red,Purple,Orange,Lavender",
          description: "Premium pure mulberry silk saree in royal hues, woven with fine traditional motifs and finished with a glossy sheen.",
          fabric: "Pure Mulberry Silk",
          occasion: "Festive,Ceremony",
          care_instructions: "Dry clean recommended.",
          stock_quantity: 20,
          delivery_info: "Dispatched within 3 business days.",
          images: ["/gallery-4.jpg", "/silk.png"]
        },
        {
          name: "Superfine Egyptian Cotton Saree",
          category: "cotton",
          price: 5900.00,
          discount: 8,
          sizes: "Standard,Custom",
          colors: "Pure White,Cream",
          description: "Extra-long staple Giza Egyptian cotton weave saree offering a lightweight, breathable drape with golden borders.",
          fabric: "Egyptian Cotton",
          occasion: "Casual,Formal",
          care_instructions: "Machine wash warm, tumble dry low.",
          stock_quantity: 15,
          delivery_info: "Dispatched within 2 business days.",
          images: ["/cotton.png"]
        },
        {
          name: "Golden Kanjeevaram Saree",
          category: "silk",
          price: 28000.00,
          discount: 12,
          sizes: "Standard,Custom",
          colors: "Red,Gold,Mustard",
          description: "Intricately detailed Kanjeevaram silk saree with rich scarlet red and mustard orange border work, woven with heavy golden zari threads.",
          fabric: "Mulberry Silk",
          occasion: "Wedding,Bridal",
          care_instructions: "Dry clean only.",
          stock_quantity: 10,
          delivery_info: "Dispatched within 3-5 business days.",
          images: ["/gallery-5.png", "/silk.png"]
        },
        {
          name: "Mint Green Organza Saree",
          category: "silk",
          price: 14800.00,
          discount: 5,
          sizes: "Standard",
          colors: "Mint Green,Gold",
          description: "Lightweight pastel mint green organza saree featuring delicate gold floral embroidery work and fine silver zari borders.",
          fabric: "Organza Silk",
          occasion: "Ceremony,Festive",
          care_instructions: "Gentle dry clean recommended.",
          stock_quantity: 12,
          delivery_info: "Dispatched within 2-3 business days.",
          images: ["/gallery-6.png", "/silk.png"]
        },
        {
          name: "Royal Purple Paithani Saree",
          category: "silk",
          price: 22500.00,
          discount: 10,
          sizes: "Standard",
          colors: "Royal Purple,Gold",
          description: "Traditional Paithani silk saree in royal purple, featuring a golden border with colorful peacock motifs on the pallu.",
          fabric: "Katan Silk",
          occasion: "Wedding,Festive",
          care_instructions: "Dry clean only. Store wrapped in soft muslin.",
          stock_quantity: 8,
          delivery_info: "Dispatched within 3 business days.",
          images: ["/gallery-7.png", "/silk.png"]
        },
        {
          name: "Rose Pink Chanderi Saree",
          category: "cotton",
          price: 9500.00,
          discount: 0,
          sizes: "Standard,Custom",
          colors: "Rose Pink,Gold",
          description: "Sheer Chanderi cotton-silk saree in rose pink, woven with light gold coin motifs and elegant temple borders.",
          fabric: "Chanderi Silk Blend",
          occasion: "Casual,Ceremony",
          care_instructions: "Dry clean only.",
          stock_quantity: 15,
          delivery_info: "Dispatched within 2 business days.",
          images: ["/gallery-8.png", "/cotton.png"]
        },
        {
          name: "Dhakai Jamdani Saree",
          category: "cotton",
          price: 16500.00,
          discount: 5,
          sizes: "Standard",
          colors: "Cream,Gold",
          description: "Traditional Dhakai Jamdani cotton-silk saree featuring floral motifs woven using supplementary weft threads.",
          fabric: "Cotton-Silk Blend",
          occasion: "Festive,Ceremony",
          care_instructions: "Gentle hand wash or dry clean.",
          stock_quantity: 6,
          delivery_info: "Dispatched within 3 business days.",
          images: ["/gallery-9.png", "/cotton.png"]
        },
        {
          name: "Traditional Patola Silk Saree",
          category: "silk",
          price: 32000.00,
          discount: 10,
          sizes: "Standard",
          colors: "Red,Indigo,Gold",
          description: "Authentic double-ikat Patola silk saree with complex geometric patterns in rich crimson, blue, and gold threads.",
          fabric: "Patola Silk",
          occasion: "Bridal,Ceremony",
          care_instructions: "Dry clean only.",
          stock_quantity: 4,
          delivery_info: "Dispatched within 4 business days.",
          images: ["/gallery-10.png", "/silk.png"]
        },
        {
          name: "Lavender Sequinned Chiffon Saree",
          category: "silk",
          price: 13500.00,
          discount: 15,
          sizes: "Standard",
          colors: "Lavender,Silver",
          description: "Ethereal pastel lavender chiffon saree adorned with delicate silver sequins and elegant hand-embroidered borders.",
          fabric: "Pure Chiffon",
          occasion: "Party,Cocktail",
          care_instructions: "Dry clean only.",
          stock_quantity: 10,
          delivery_info: "Dispatched within 2 business days.",
          images: ["/gallery-11.png", "/silk.png"]
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
