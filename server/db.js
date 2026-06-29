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
      id: 5,
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
