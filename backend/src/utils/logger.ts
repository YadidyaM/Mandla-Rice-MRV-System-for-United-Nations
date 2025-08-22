/**
 * Logger Configuration for Mandla Rice MRV System
 * Winston-based logging with file rotation and different log levels
 */

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import fs from 'fs';

// Create logs directory if it doesn't exist
const logDir = './logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS',
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss',
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

// Configure transports
const transports: winston.transport[] = [];

// Console transport for development
if (process.env.NODE_ENV === 'development') {
  transports.push(
    new winston.transports.Console({
      level: 'debug',
      format: consoleFormat,
    })
  );
} else {
  transports.push(
    new winston.transports.Console({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    })
  );
}

// File transport for all logs
transports.push(
  new DailyRotateFile({
    filename: path.join(logDir, 'mandla-mrv-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: process.env.LOG_MAX_SIZE || '20m',
    maxFiles: process.env.LOG_MAX_FILES || '14d',
    format: logFormat,
    level: 'info',
  })
);

// Error file transport
transports.push(
  new DailyRotateFile({
    filename: path.join(logDir, 'mandla-mrv-error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: process.env.LOG_MAX_SIZE || '20m',
    maxFiles: process.env.LOG_MAX_FILES || '14d',
    format: logFormat,
    level: 'error',
  })
);

// Audit log transport for security events
transports.push(
  new DailyRotateFile({
    filename: path.join(logDir, 'mandla-mrv-audit-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: process.env.LOG_MAX_SIZE || '20m',
    maxFiles: process.env.LOG_MAX_FILES || '30d',
    format: logFormat,
    level: 'info',
  })
);

// Create logger instance
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports,
  // Handle uncaught exceptions
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'exceptions.log'),
    }),
  ],
  // Handle unhandled promise rejections
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'rejections.log'),
    }),
  ],
});

// Specific loggers for different modules
export const auditLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
    winston.format.label({ label: 'AUDIT' })
  ),
  transports: [
    new DailyRotateFile({
      filename: path.join(logDir, 'audit-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
    }),
  ],
});

export const mrvLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
    winston.format.label({ label: 'MRV' })
  ),
  transports: [
    new DailyRotateFile({
      filename: path.join(logDir, 'mrv-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
    }),
  ],
});

export const blockchainLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
    winston.format.label({ label: 'BLOCKCHAIN' })
  ),
  transports: [
    new DailyRotateFile({
      filename: path.join(logDir, 'blockchain-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
    }),
  ],
});

export const satelliteLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
    winston.format.label({ label: 'SATELLITE' })
  ),
  transports: [
    new DailyRotateFile({
      filename: path.join(logDir, 'satellite-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '7d',
    }),
  ],
});

// Utility functions for structured logging
export const logContext = {
  // Authentication events
  auth: (action: string, userId?: string, metadata?: any) => {
    auditLogger.info('Authentication Event', {
      action,
      userId,
      timestamp: new Date().toISOString(),
      ...metadata,
    });
  },

  // MRV process events
  mrv: (stage: string, farmId: string, metadata?: any) => {
    mrvLogger.info('MRV Process', {
      stage,
      farmId,
      timestamp: new Date().toISOString(),
      ...metadata,
    });
  },

  // Blockchain transactions
  blockchain: (action: string, txHash?: string, metadata?: any) => {
    blockchainLogger.info('Blockchain Transaction', {
      action,
      txHash,
      timestamp: new Date().toISOString(),
      ...metadata,
    });
  },

  // Satellite data processing
  satellite: (operation: string, farmId?: string, metadata?: any) => {
    satelliteLogger.info('Satellite Data Processing', {
      operation,
      farmId,
      timestamp: new Date().toISOString(),
      ...metadata,
    });
  },

  // API access logs
  api: (method: string, endpoint: string, userId?: string, metadata?: any) => {
    logger.info('API Access', {
      method,
      endpoint,
      userId,
      timestamp: new Date().toISOString(),
      ...metadata,
    });
  },

  // Error logging with context
  error: (error: Error, context?: any) => {
    logger.error('Application Error', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      ...context,
    });
  },

  // Performance logging
  performance: (operation: string, duration: number, metadata?: any) => {
    logger.info('Performance Metric', {
      operation,
      duration,
      timestamp: new Date().toISOString(),
      ...metadata,
    });
  },
};

// Performance timing utility
export const createTimer = (operation: string) => {
  const start = Date.now();
  return {
    end: (metadata?: any) => {
      const duration = Date.now() - start;
      logContext.performance(operation, duration, metadata);
      return duration;
    },
  };
};

// Default export
export default logger;
