import mongoose from 'mongoose';
import dns from 'dns';

// Ensure DNS uses Google & Cloudflare public DNS to resolve Atlas SRV lookups reliably on Windows
function setupDns() {
  try {
    dns.setDefaultResultOrder('ipv4first');
    dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1', '1.0.0.1']);
  } catch {
    // Ignore if restricted
  }
}

export async function connectDB(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  if (mongoose.connection.readyState >= 1) {
    return mongoose;
  }

  setupDns();

  const opts: mongoose.ConnectOptions = {
    bufferCommands: false,
    maxPoolSize: 10,
    minPoolSize: 2,
    socketTimeoutMS: 45000,
    serverSelectionTimeoutMS: 15000,
    family: 4,
    retryWrites: true,
    w: 'majority',
  };

  try {
    const conn = await mongoose.connect(uri, opts);
    console.log(`[SUCCESS] MongoDB Connected to Atlas database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error('[ERROR] Failed to connect to MongoDB Atlas:', error);
    throw error;
  }
}

export default connectDB;
