const mysql = require('mysql2/promise');
require('dotenv').config();

let pool = null;
let isMock = false;

// In-memory fallback database
const mockDb = {
  users: [
    { id: 1, name: "Admin User", email: "admin@rudraksha.com", phone: "9876543210", password_hash: "$2a$10$XJpG9/w4XQ1n11L2t6Y/Su6iA21Lp8l6v0n8H3fR2k8vP9e7yD8wG", role: "admin", created_at: new Date() },
    { id: 2, name: "Bespoke Designer", email: "designer@aurafashion.com", phone: "9988776655", password_hash: "$2a$10$XJpG9/w4XQ1n11L2t6Y/Su6iA21Lp8l6v0n8H3fR2k8vP9e7yD8wG", role: "customer", created_at: new Date() }
  ],
  products: [
    {
      id: 1,
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
      id: 2,
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
      id: 3,
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
      id: 4,
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
      id: 5,
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
      id: 6,
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
      id: 7,
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
      id: 8,
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
      id: 9,
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
      id: 10,
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
      id: 11,
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
      id: 12,
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
  ],
  wishlist: [],
  cart_items: [],
  orders: [],
  order_items: [],
  reviews: [
    { id: 1, user_id: 2, product_id: 1, rating: 5, comment: "Absolutely exquisite! The georgette draping is fluid and the zari shines brilliantly under lighting.", image_url: null, created_at: new Date() },
    { id: 2, user_id: 2, product_id: 2, rating: 5, comment: "A masterpiece. The Banarasi silk is thick and high-quality.", image_url: null, created_at: new Date() }
  ],
  contact_messages: []
};

// Initialize DB Connection Pool
async function initDb() {
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'rudraksha_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  };

  try {
    // Attempt connecting to MySQL database
    pool = mysql.createPool(dbConfig);
    const conn = await pool.getConnection();
    console.log(`[DB SUCCESS] Connected to MySQL database "${dbConfig.database}" successfully.`);
    conn.release();
  } catch (err) {
    console.warn(`[DB WARNING] Failed to connect to MySQL database: "${err.message}".`);
    console.warn(`[DB WARNING] Falling back to In-Memory mockup database mode for testing.`);
    isMock = true;
    pool = null;
  }
}

// Global query wrapper
async function query(sql, params = []) {
  if (isMock) {
    throw new Error("Cannot execute raw SQL queries in mock DB mode. Use mock handlers.");
  }
  const [results] = await pool.execute(sql, params);
  return results;
}

module.exports = {
  initDb,
  query,
  getPool: () => pool,
  getIsMock: () => isMock,
  mockDb
};
