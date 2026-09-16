import dotenv from 'dotenv';
import path from 'path';

// Load .env before any other imports
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import express, { Request, Response } from 'express';
import cors from 'cors';
import connectDB from './config/db';

import courseRoutes from './routes/course.routes';
import testRoutes from './routes/test.routes';
import noticeRoutes from './routes/notice.routes';
import admissionRoutes from './routes/admission.routes';
import feedbackRoutes from './routes/feedback.routes';
import authRoutes from './routes/auth.routes';
import studentRoutes from './routes/student.routes';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Raven Tutorials LMS API',
    timestamp: new Date().toISOString(),
  });
});

app.get('/', (req: Request, res: Response) => {
  res.send('Raven Tutorials Backend API is live.');
});

// Mount Routes
app.use('/api/courses', courseRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/admission', admissionRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);

// Error Handler
app.use((err: any, req: Request, res: Response, next: Function) => {
  console.error('[SERVER ERROR]', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Start Server
async function startServer() {
  try {
    await connectDB();
    const portNumber = Number(PORT) || 5000;
    app.listen(portNumber, '0.0.0.0', () => {
      console.log(`=========================================`);
      console.log(`🚀 Raven Backend running on port ${portNumber}`);
      console.log(`📡 Local:   http://localhost:${portNumber}`);
      console.log(`📡 Network: http://0.0.0.0:${portNumber}`);
      console.log(`🩺 Health:  http://localhost:${portNumber}/api/health`);
      console.log(`=========================================`);
    });
  } catch (error) {
    console.error('[FATAL] Could not connect to database on startup:', error);
    process.exit(1);
  }
}

startServer();
