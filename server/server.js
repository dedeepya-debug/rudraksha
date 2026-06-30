const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// Setup Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      origin.startsWith('http://localhost:') || 
      origin.startsWith('http://127.0.0.1:')
    ) {
      return callback(null, true);
    }
    return callback(new Error('CORS policy mismatch'), false);
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static images or assets if needed (e.g. profile uploads)
app.use('/uploads', express.static('uploads'));

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: "OK", database: db.getIsMock() ? "In-Memory Mock" : "MySQL connected" });
});

// Mount Routes
app.use('/api', apiRoutes);

// Database initialization & server boot
async function startServer() {
  await db.initDb();
  
  app.listen(PORT, () => {
    console.log(`[Server] Rudraksha Textiles API is active on http://localhost:${PORT}`);
    if (db.getIsMock()) {
      console.log(`[Server] Run-Mode: In-Memory Sandbox Mock. Database operations are safe and fully functional.`);
    } else {
      console.log(`[Server] Run-Mode: Live MySQL Production Database.`);
    }
  });
}

startServer();
