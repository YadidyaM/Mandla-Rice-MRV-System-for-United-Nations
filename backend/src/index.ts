/**
 * Mandla Rice MRV System - Backend Entry Point
 * UN Climate Challenge 2024
 * 
 * This is the main entry point for the Mandla Rice Methane MRV & Carbon Credit System.
 * It initializes the Express server, database connections, and all middleware.
 */

import 'reflect-metadata';
import './types/express';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createClient } from 'redis';

// Import configurations and utilities
import { config } from './config/config';
import { logger } from './utils/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { validateRequest } from './middleware/validation';
import { initializeSentry } from './config/sentry';
import { sentryRequestHandler, sentryTracingHandler, sentryErrorHandler } from './middleware/sentry';
import { databaseService } from './config/database';

// Import routes
import authRoutes from './routes/auth.routes';
import farmRoutes from './routes/farm.routes';
import mrvRoutes from './routes/mrv.routes';
import carbonCreditRoutes from './routes/carbonCredit.routes';
import satelliteRoutes from './routes/satellite.routes';
import notificationRoutes from './routes/notification.routes';
import whatsappRoutes from './routes/whatsapp.routes';
import adminRoutes from './routes/admin.routes';
import undpRoutes from './routes/undp.routes';
import researchRoutes from './routes/research.routes';
import healthRoutes from './routes/health.routes';

// Import services
import { LangChainAgentService } from './services/agents/LangChainAgentService';
import { BlockchainService } from './services/blockchain/BlockchainService';
import { JobScheduler } from './services/scheduler/JobScheduler';

// Type definitions
interface AppContext {
  redis: any;
  langChainService: LangChainAgentService;
  blockchainService: BlockchainService;
  jobScheduler: JobScheduler;
}

class MandlaMRVServer {
  private app: express.Application;
  private context: AppContext;

  constructor() {
    this.app = express();
    this.context = {} as AppContext;
    
    // Initialize Sentry early
    initializeSentry();
  }

  /**
   * Initialize all services and dependencies
   */
  private async initializeServices(): Promise<void> {
    try {
      logger.info('Using in-memory authentication service...');
      logger.info('✅ Simple auth service initialized');

      logger.info('Initializing Redis connection...');
      this.context.redis = createClient({
        url: config.redis.url,
      });

      this.context.redis.on('error', (err: Error) => {
        logger.error('Redis Client Error:', err);
      });

      await this.context.redis.connect();
      logger.info('✅ Redis connected successfully');

      logger.info('Initializing LangChain Agent Service...');
      this.context.langChainService = new LangChainAgentService();
      logger.info('✅ LangChain Agent Service initialized');

      logger.info('Initializing Blockchain Service...');
      this.context.blockchainService = new BlockchainService();
      await this.context.blockchainService.initialize();
      logger.info('✅ Blockchain Service initialized');

      logger.info('Initializing Job Scheduler...');
      this.context.jobScheduler = new JobScheduler(this.context);
      await this.context.jobScheduler.initialize();
      logger.info('✅ Job Scheduler initialized');

    } catch (error) {
      logger.error('Failed to initialize services:', error);
      throw error;
    }
  }

  /**
   * Configure Express middleware
   */
  private setupMiddleware(): void {
    // Sentry middleware (must be first)
    this.app.use(sentryRequestHandler);
    this.app.use(sentryTracingHandler);
    
    // Security middleware
    this.app.use(helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));

    // CORS configuration
    this.app.use(cors({
      origin: [
        config.frontendUrl,
        'http://localhost:3000',
        'http://localhost:3001',
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: config.auth.rateLimitWindowMs,
      max: config.auth.rateLimitMaxRequests,
      message: {
        error: 'Too many requests from this IP, please try again later.',
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use('/api/', limiter);

    // Body parsing and compression
    this.app.use(compression());
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Logging
    if (config.nodeEnv === 'development') {
      this.app.use(morgan('dev'));
    } else {
      this.app.use(morgan('combined', {
        stream: {
          write: (message: string) => logger.info(message.trim()),
        },
      }));
    }

    // Inject context into requests
    this.app.use((req: any, res, next) => {
      req.context = this.context;
      next();
    });
  }

  /**
   * Setup API routes
   */
  private setupRoutes(): void {
    // Health check (before rate limiting)
    this.app.use('/health', healthRoutes);

    // API routes
    const apiRouter = express.Router();
    
    // Authentication routes
    apiRouter.use('/auth', authRoutes);
    
    // Core feature routes
    apiRouter.use('/farms', farmRoutes);
    apiRouter.use('/mrv', mrvRoutes);
    apiRouter.use('/carbon-credits', carbonCreditRoutes);
    apiRouter.use('/satellite', satelliteRoutes);
    apiRouter.use('/notifications', notificationRoutes);
    
    // Communication routes
    apiRouter.use('/whatsapp', whatsappRoutes);
    
    // Admin routes
    apiRouter.use('/admin', adminRoutes);
    
    // UN/UNDP Integration routes
    apiRouter.use('/undp', undpRoutes);
    
    // Research & Development routes
    apiRouter.use('/research', researchRoutes);

    // Mount API router
    this.app.use(`/api/${config.apiVersion}`, apiRouter);

    // API documentation
    this.app.get('/api', (req, res) => {
      res.json({
        name: 'Mandla Rice MRV System API',
        version: config.apiVersion,
        description: 'UN Climate Challenge - Blockchain & AI-powered MRV system for rice methane reduction',
        documentation: '/api/docs',
        health: '/health',
        endpoints: {
          auth: '/api/v1/auth',
          farms: '/api/v1/farms',
          mrv: '/api/v1/mrv',
          carbonCredits: '/api/v1/carbon-credits',
          satellite: '/api/v1/satellite',
          notifications: '/api/v1/notifications',
          whatsapp: '/api/v1/whatsapp',
          admin: '/api/v1/admin',
          undp: '/api/v1/undp',
          research: '/api/v1/research',
        },
      });
    });

    // Error handling middleware (must be last)
    this.app.use(sentryErrorHandler);
    this.app.use(notFoundHandler);
    this.app.use(errorHandler);
  }

  /**
   * Start the server
   */
  public async start(): Promise<void> {
    try {
      await this.initializeServices();
      this.setupMiddleware();
      this.setupRoutes();

      const port = config.port;
      this.app.listen(port, () => {
        logger.info(`
🚀 Mandla Rice MRV System Backend Started Successfully!
📍 Port: ${port}
🌍 Environment: ${config.nodeEnv}
📊 API Version: ${config.apiVersion}
🔗 API URL: ${config.appUrl}/api/${config.apiVersion}
🏥 Health Check: ${config.appUrl}/health
📝 API Docs: ${config.appUrl}/api

🌾 UN Climate Challenge 2024
🎯 Goal: Empowering Mandla farmers with blockchain-verified carbon credits
💚 Impact: Reducing methane emissions from rice farming
        `);
      });

      // Graceful shutdown handlers
      process.on('SIGTERM', () => this.shutdown('SIGTERM'));
      process.on('SIGINT', () => this.shutdown('SIGINT'));

    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  /**
   * Graceful shutdown
   */
  private async shutdown(signal: string): Promise<void> {
    logger.info(`${signal} received, shutting down gracefully...`);

    try {
      // Close database connections
      if (databaseService.isDatabaseConnected()) {
        await databaseService.disconnect();
        logger.info('✅ MongoDB disconnected');
      }

      // Close Redis connection
      if (this.context.redis) {
        await this.context.redis.disconnect();
        logger.info('✅ Redis disconnected');
      }

      // Stop job scheduler
      if (this.context.jobScheduler) {
        await this.context.jobScheduler.stop();
        logger.info('✅ Job scheduler stopped');
      }

      logger.info('🛑 Server shutdown complete');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown:', error);
      process.exit(1);
    }
  }
}

// Start the server
const server = new MandlaMRVServer();
server.start().catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});
