import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import cron from 'node-cron';
import path from 'path';

// Load environment variables
dotenv.config();

// Import routes
import tableRoutes from './controllers/tableController';
import checkoutRoutes from './controllers/checkoutController';
import stripeWebhookRoutes from './controllers/stripeWebhookController';
import djRoutes from './controllers/djController';
import adminRoutes from './controllers/adminController';
import healthRoutes from './controllers/healthController';
import businessRoutes from './routes/businessRoutes';

// Import services
import { sendNightlySummary } from './services/telegramService';
import { aggregateDailyStats } from './services/statsService';
import { isStripeAvailable } from './services/stripeService';

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Debug logging for Railway
console.log('🚀 TIPSI server starting...');
console.log('📊 Environment variables:');
console.log('  - PORT:', process.env.PORT || '3000 (default)');
console.log('  - NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('  - DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
console.log('  - STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? 'SET' : 'NOT SET');
console.log('  - BASE_URL:', process.env.BASE_URL || 'NOT SET');
console.log('  - JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
console.log('  - Current working directory:', process.cwd());
console.log('  - __dirname:', __dirname);

// Check critical configuration
if (!process.env.DATABASE_URL) {
  console.error('❌ CRITICAL: DATABASE_URL is required but not set!');
  console.error('   Please set DATABASE_URL in your environment variables.');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error('❌ CRITICAL: JWT_SECRET is required but not set!');
  console.error('   Please set JWT_SECRET in your environment variables.');
  process.exit(1);
}

// Check Stripe configuration
if (isStripeAvailable()) {
  console.log('✅ Stripe is configured - payment features enabled');
} else {
  console.log('⚠️  Stripe not configured - payment features will be disabled');
  console.log('   To enable payments, set STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY');
}

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files - use absolute paths for Railway compatibility
const uploadsPath = path.resolve(__dirname, '../uploads');
const buildPath = path.resolve(__dirname, '../frontend/build');
const viewsPath = path.resolve(__dirname, '../views');

console.log('📁 File paths:');
console.log('  - Uploads:', uploadsPath);
console.log('  - Build:', buildPath);
console.log('  - Views:', viewsPath);

// Static files
app.use('/uploads', express.static(uploadsPath));

// Serve frontend static files
app.use(express.static(buildPath));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', viewsPath);

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ 
    message: 'TIPSI app is running!', 
    timestamp: new Date().toISOString(),
    features: {
      stripe: isStripeAvailable(),
      database: !!process.env.DATABASE_URL,
      jwt: !!process.env.JWT_SECRET
    }
  });
});

// Routes
app.use('/t', tableRoutes);
app.use('/checkout', checkoutRoutes);
app.use('/stripe/webhook', stripeWebhookRoutes);
app.use('/dj', djRoutes);
app.use('/admin', adminRoutes);
app.use('/health', healthRoutes);
app.use('/api/business', businessRoutes);

// DJ Badge page
app.get('/dj-badge', (req, res) => {
  res.render('dj-badge');
});

// Serve frontend for all other routes (SPA routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

// Nightly summary cron job (runs at 6 AM every day)
cron.schedule('0 6 * * *', async () => {
  try {
    console.log('Running nightly summary job...');
    const stats = await aggregateDailyStats();
    await sendNightlySummary(stats);
    console.log('Nightly summary sent successfully');
  } catch (error) {
    console.error('Error in nightly summary job:', error);
  }
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Railway-compatible server configuration
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 TIPSI server running on port ${PORT}`);
  console.log(`📱 Table pages: http://localhost:${PORT}/t/:tableId`);
  console.log(`⚙️  Admin: http://localhost:${PORT}/admin/venue`);
  console.log(`🎵 DJ Badge: http://localhost:${PORT}/dj-badge`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
  console.log('✅ Server startup completed successfully!');
  console.log(`🌐 Server bound to 0.0.0.0:${PORT} (Railway compatible)`);
}).on('error', (error) => {
  console.error('❌ Server failed to start:', error);
  process.exit(1);
});

// Graceful shutdown for Railway
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});
