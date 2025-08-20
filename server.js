import http from 'http';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from './database.js';
import killPort from './utils/killPort.js';
import Router from './utils/router.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import { protect } from './middleware/auth.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const corsMiddleware = (req, res, next) => {
  const allowedOrigins = [
    process.env.CORS_ORIGIN || 'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
    'http://localhost:4173' // Vite preview
  ];
  
  const origin = req.headers.origin;
  
  // Allow requests from allowed origins or no origin (for same-origin requests)
  if (!origin || allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || allowedOrigins[0]);
  }
  
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With,Accept,Origin,Cache-Control');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }
  
  next();
};

const jsonParser = (req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk;
      // Prevent large payloads
      if (body.length > 1e6) {
        res.writeHead(413, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Payload too large' }));
        return;
      }
    });
    
    req.on('end', () => {
      try {
        req.body = body ? JSON.parse(body) : {};
        next();
      } catch (error) {
        console.error('❌ JSON parsing error:', error.message);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: false, 
          message: 'Invalid JSON format' 
        }));
      }
    });
    
    req.on('error', (error) => {
      console.error('❌ Request error:', error);
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        success: false, 
        message: 'Request error' 
      }));
    });
  } else {
    next();
  }
};



const startServer = async () => {
  try {
    console.log('🚀 Starting Rosellea Server...');
    await killPort(process.env.PORT || 5000);
    console.log('✅ Port cleared');
    await connectDB();
    console.log('✅ Database connected');

  const router = new Router();
  
  router.get('/api/health', async (req, res) => {
    try {
      // Check database connection
      const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
      
      const healthData = {
        status: 'OK',
        message: 'Rosellea Backend API is running',
        timestamp: new Date().toISOString(),
        database: dbStatus,
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0'
      };
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(healthData));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'ERROR',
        message: 'Health check failed',
        error: error.message
      }));
    }
  });
  
  router.get('/api/csrf-token', protect, (req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      success: true, 
      csrfToken: 'dummy-token', 
      sessionId: 'dummy-session' 
    }));
  });
  router.use('/api/auth', authRoutes);
  router.use('/api/products', productRoutes);
  router.use('/api/cart', cartRoutes);
  router.use('/api/orders', orderRoutes);
  router.use('/api/contact', contactRoutes);


  const server = http.createServer((req, res) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url} - ${req.headers.origin || 'no-origin'}`);
    
    // Add error handling for the entire request pipeline
    try {
      corsMiddleware(req, res, () => {
        jsonParser(req, res, () => {
          router.handle(req, res);
        });
      });
    } catch (error) {
      console.error('❌ Request processing error:', error);
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: 'Internal server error'
        }));
      }
    }
  });

  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`🌟 Rosellea Server running on port ${PORT}`);
    console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
    console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
  });
  
  // Handle server errors
  server.on('error', (error) => {
    console.error('❌ Server error:', error);
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use`);
      process.exit(1);
    }
  });

  const shutdown = (signal) => {
    console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      try {
        await mongoose.connection.close();
        console.log('✅ Database connection closed');
      } catch (error) {
        console.error('❌ Error closing database:', error);
      }
      console.log('✅ Server closed');
      process.exit(0);
    });
  };
  
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
