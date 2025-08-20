import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

export const connectDB = async (retries = 5) => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    
    console.log('🔗 Connecting to MongoDB...');
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Connection timeout settings
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      connectTimeoutMS: 10000, // Give up initial connection after 10s
      
      // Connection pool settings
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 0, // Allow pool to scale down to zero when idle
      maxIdleTimeMS: 5000, // Close idle connections after 5s
      
      // Buffering settings
      bufferCommands: false, // Disable mongoose buffering
      
      // Additional optimization
      heartbeatFrequencyMS: 10000, // Check server status every 10s
      retryWrites: true, // Retry failed writes
      w: 'majority', // Write concern
    });
    
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB connection error:', error);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });
    
  } catch (error) {
    console.error(`❌ Database connection error (attempt ${6 - retries}/5):`, error.message);
    
    if (retries > 0) {
      console.log(`🔄 Retrying connection in 5 seconds...`);
      await new Promise(resolve => setTimeout(resolve, 5000));
      return connectDB(retries - 1);
    }
    
    console.error('❌ Failed to connect to database after 5 attempts');
    // Close any open connections and stop further retries
    try {
      await mongoose.connection.close(false);
    } catch {}
    process.exit(1);
  }
};
