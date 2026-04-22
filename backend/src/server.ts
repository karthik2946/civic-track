import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { mailRouter } from './routes/mail.js';
import { errorHandler } from './middleware/errorHandler.js';
import { mailService, MailServiceConfig } from './services/mailService.js';

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Initialize Mail Service on startup
 */
async function initializeMailService() {
  try {
    const config: MailServiceConfig = {
      host: process.env.SMTP_HOST || '',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
      fromEmail: process.env.MAIL_FROM_EMAIL || 'noreply@civicconnect.local',
      fromName: process.env.MAIL_FROM_NAME || 'Civic Connect',
    };

    // Validate SMTP configuration
    if (!config.host || !config.auth.user || !config.auth.pass) {
      console.warn('⚠️  SMTP credentials not fully configured');
      console.warn('   Please set SMTP_HOST, SMTP_USER, and SMTP_PASS in environment variables');
      console.warn('   Mail service will be disabled');
      return false;
    }

    await mailService.initialize(config);
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize mail service on startup:', error);
    return false;
  }
}

// Health check route
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
  });
});

// API Routes
app.use('/api/mail', mailRouter);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    method: req.method,
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
async function startServer() {
  try {
    // Initialize mail service first
    console.log('🔧 Initializing mail service...');
    const mailInitialized = await initializeMailService();

    app.listen(PORT, () => {
      console.log(`
    ╔════════════════════════════════════════╗
    ║   Civic Connect Mail Service           ║
    ║   SMTP Server Running                  ║
    ╚════════════════════════════════════════╝
    
    Server: http://localhost:${PORT}
    Health: http://localhost:${PORT}/health
    Mail API: http://localhost:${PORT}/api/mail/send
    Environment: ${NODE_ENV}
    
    SMTP Configuration:
    - Host: ${process.env.SMTP_HOST}
    - Port: ${process.env.SMTP_PORT}
    - Secure: ${process.env.SMTP_SECURE}
    - Auth User: ${process.env.SMTP_USER}
    - Status: ${mailInitialized ? '✅ Connected' : '⚠️  Not Connected'}
  `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});
