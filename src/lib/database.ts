import mongoose from 'mongoose';
import dns from 'dns';

// Ensure DNS uses Google & Cloudflare public DNS to resolve Atlas SRV lookups reliably on Windows
function setupDns() {
  try {
    dns.setDefaultResultOrder('ipv4first');
    dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1', '1.0.0.1']);
  } catch {
    // Ignore in environments where setting custom DNS is restricted
  }
}

setupDns();

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectDatabase(): Promise<typeof mongoose> {
  if (cached.conn && mongoose.connection.readyState >= 1) {
    return cached.conn;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  if (!cached.promise) {
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

    cached.promise = mongoose.connect(uri, opts).then((mongooseInstance) => {
      console.log('[SUCCESS] MongoDB Connected to Atlas');
      return mongooseInstance;
    }).catch((error) => {
      cached.promise = null;
      console.error('[ERROR] MongoDB connection failed:', error.message);
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export const connectDB = connectDatabase;
export default connectDatabase;
